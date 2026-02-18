import { MONGODB } from "@server/config/constants";
import { getIsoTimestamp } from "@server/utils/date";
import { HttpError } from "@server/utils/http-error";
import {
    deleteMany,
    deleteOne,
    findMany,
    findOne,
    insertOne,
    updateMany,
    updateOne,
} from "./mongo-data-api";
import type { IPostDocument, IPostListQuery, TPostSort, TPostVisibility } from "./types";

interface ICreatePostInput {
    slug: string;
    title: string;
    description: string;
    content: string;
    visibility: TPostVisibility;
    sharedWith: string[];
    authorName: string;
    authorEmail: string;
}

interface IUpdatePostInput {
    title: string;
    description: string;
    content: string;
    visibility: TPostVisibility;
    sharedWith: string[];
    nextSlug?: string;
}

interface IUpsertPostFromRepositoryInput {
    slug: string;
    filename: string;
    title: string;
    description: string;
    content: string;
    visibility: TPostVisibility;
    sharedWith: string[];
    createdAt?: string;
    updatedAt?: string;
}

function normalizeSlug(rawSlug: string): string {
    return rawSlug
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-_]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

function getSortOption(sort: TPostSort = "latest"): Record<string, 1 | -1> {
    if (sort === "oldest") {
        return { createdAt: 1 };
    }

    if (sort === "viewCount") {
        return { viewCount: -1, createdAt: -1 };
    }

    if (sort === "name") {
        return { title: 1 };
    }

    return { createdAt: -1 };
}

function buildPostAccessFilter(query: IPostListQuery, isAdmin: boolean): Record<string, unknown> {
    const filterParts: Record<string, unknown>[] = [];

    if (!isAdmin) {
        if (query.viewerEmail) {
            filterParts.push({
                $or: [
                    { visibility: "public" },
                    { visibility: "private", sharedWith: query.viewerEmail },
                    { visibility: "private", authorEmail: query.viewerEmail },
                ],
            });
        } else {
            filterParts.push({ visibility: "public" });
        }
    }

    if (query.visibility === "public") {
        filterParts.push({ visibility: "public" });
    }

    if (query.visibility === "private") {
        filterParts.push({ visibility: "private" });
    }

    if (query.search) {
        const safeKeyword = query.search.trim();
        if (safeKeyword.length > 0) {
            filterParts.push({
                $or: [
                    { title: { $regex: safeKeyword, $options: "i" } },
                    { description: { $regex: safeKeyword, $options: "i" } },
                    { content: { $regex: safeKeyword, $options: "i" } },
                ],
            });
        }
    }

    if (filterParts.length === 0) {
        return {};
    }

    if (filterParts.length === 1) {
        return filterParts[0];
    }

    return { $and: filterParts };
}

function assertRequiredFields(input: { title: string; description: string }): void {
    if (!input.title.trim()) {
        throw new HttpError(400, "title is required");
    }

    if (!input.description.trim()) {
        throw new HttpError(400, "description is required");
    }
}

function assertValidVisibility(value: string): asserts value is TPostVisibility {
    if (value !== "public" && value !== "private") {
        throw new HttpError(400, "visibility must be public or private");
    }
}

export async function listPosts(query: IPostListQuery, isAdmin = false): Promise<IPostDocument[]> {
    const filter = buildPostAccessFilter(query, isAdmin);
    const sort = getSortOption(query.sort || "latest");

    return await findMany<IPostDocument>(MONGODB.COLLECTIONS.POSTS, {
        filter,
        sort,
    });
}

export async function getPostBySlug(slug: string): Promise<IPostDocument | null> {
    const normalizedSlug = normalizeSlug(slug);
    if (!normalizedSlug) {
        throw new HttpError(400, "slug is required");
    }

    return await findOne<IPostDocument>(MONGODB.COLLECTIONS.POSTS, { slug: normalizedSlug });
}

export async function createPost(input: ICreatePostInput): Promise<IPostDocument> {
    assertRequiredFields({ title: input.title, description: input.description });
    assertValidVisibility(input.visibility);

    const slug = normalizeSlug(input.slug);
    if (!slug) {
        throw new HttpError(400, "slug is required");
    }

    const existing = await getPostBySlug(slug);
    if (existing) {
        throw new HttpError(409, "A post with this slug already exists");
    }

    const now = getIsoTimestamp();
    const nextPost: IPostDocument = {
        slug,
        filename: `${slug}.md`,
        title: input.title.trim(),
        description: input.description.trim(),
        content: input.content,
        visibility: input.visibility,
        sharedWith: input.sharedWith,
        authorName: input.authorName,
        authorEmail: input.authorEmail,
        viewCount: 0,
        createdAt: now,
        updatedAt: now,
        ...(input.visibility === "public" ? { publishedAt: now } : {}),
    };

    await insertOne(MONGODB.COLLECTIONS.POSTS, nextPost);

    return nextPost;
}

export async function updatePost(slug: string, input: IUpdatePostInput): Promise<IPostDocument> {
    assertRequiredFields({ title: input.title, description: input.description });
    assertValidVisibility(input.visibility);

    const currentPost = await getPostBySlug(slug);
    if (!currentPost) {
        throw new HttpError(404, "Post not found");
    }

    const normalizedNextSlug = input.nextSlug ? normalizeSlug(input.nextSlug) : currentPost.slug;
    if (!normalizedNextSlug) {
        throw new HttpError(400, "slug is required");
    }

    if (normalizedNextSlug !== currentPost.slug) {
        const duplicatePost = await getPostBySlug(normalizedNextSlug);
        if (duplicatePost) {
            throw new HttpError(409, "A post with this slug already exists");
        }
    }

    const nextTimestamp = getIsoTimestamp();
    const shouldSetPublishedAt =
        currentPost.visibility !== "public" && input.visibility === "public";

    const nextPost: IPostDocument = {
        ...currentPost,
        slug: normalizedNextSlug,
        filename: `${normalizedNextSlug}.md`,
        title: input.title.trim(),
        description: input.description.trim(),
        content: input.content,
        visibility: input.visibility,
        sharedWith: input.sharedWith,
        updatedAt: nextTimestamp,
        ...(shouldSetPublishedAt ? { publishedAt: nextTimestamp } : {}),
    };

    await updateOne(
        MONGODB.COLLECTIONS.POSTS,
        { slug: currentPost.slug },
        {
            $set: {
                slug: nextPost.slug,
                filename: nextPost.filename,
                title: nextPost.title,
                description: nextPost.description,
                content: nextPost.content,
                visibility: nextPost.visibility,
                sharedWith: nextPost.sharedWith,
                updatedAt: nextPost.updatedAt,
                ...(shouldSetPublishedAt ? { publishedAt: nextTimestamp } : {}),
            },
        }
    );

    if (normalizedNextSlug !== currentPost.slug) {
        await updateMany(
            MONGODB.COLLECTIONS.COMMENTS,
            { postSlug: currentPost.slug },
            {
                $set: {
                    postSlug: normalizedNextSlug,
                },
            }
        );
    }

    return nextPost;
}

export async function deletePostBySlug(slug: string): Promise<void> {
    const targetPost = await getPostBySlug(slug);
    if (!targetPost) {
        throw new HttpError(404, "Post not found");
    }

    await deleteOne(MONGODB.COLLECTIONS.POSTS, { slug: targetPost.slug });
    await deleteMany(MONGODB.COLLECTIONS.COMMENTS, { postSlug: targetPost.slug });
}

export async function incrementPostViewCount(slug: string): Promise<number> {
    const currentPost = await getPostBySlug(slug);
    if (!currentPost) {
        throw new HttpError(404, "Post not found");
    }

    const nextCount = (currentPost.viewCount || 0) + 1;

    await updateOne(
        MONGODB.COLLECTIONS.POSTS,
        { slug: currentPost.slug },
        {
            $set: {
                viewCount: nextCount,
                updatedAt: getIsoTimestamp(),
            },
        }
    );

    return nextCount;
}

export function canUserAccessPost(
    post: IPostDocument,
    viewerEmail: string | null | undefined,
    isAdmin: boolean
): boolean {
    if (isAdmin) {
        return true;
    }

    if (post.visibility === "public") {
        return true;
    }

    if (!viewerEmail) {
        return false;
    }

    if (post.authorEmail === viewerEmail) {
        return true;
    }

    return post.sharedWith.includes(viewerEmail);
}

export function isPostPublishedNow(
    previousPost: IPostDocument | null,
    nextPost: IPostDocument
): boolean {
    if (!previousPost && nextPost.visibility === "public") {
        return true;
    }

    if (!previousPost) {
        return false;
    }

    return previousPost.visibility !== "public" && nextPost.visibility === "public";
}

export function normalizePostSlug(slug: string): string {
    return normalizeSlug(slug);
}

export async function listAllPosts(): Promise<IPostDocument[]> {
    return await findMany<IPostDocument>(MONGODB.COLLECTIONS.POSTS, {
        sort: { createdAt: -1 },
    });
}

export async function upsertPostFromRepository(
    input: IUpsertPostFromRepositoryInput
): Promise<{ post: IPostDocument; created: boolean }> {
    const normalizedSlug = normalizeSlug(input.slug);
    if (!normalizedSlug) {
        throw new HttpError(400, "Invalid slug in repository post");
    }

    const now = getIsoTimestamp();
    const existingPost = await getPostBySlug(normalizedSlug);

    if (!existingPost) {
        const createdPost: IPostDocument = {
            slug: normalizedSlug,
            filename: input.filename,
            title: input.title.trim(),
            description: input.description.trim(),
            content: input.content,
            visibility: input.visibility,
            sharedWith: input.sharedWith,
            authorName: "Repository Sync",
            authorEmail: "sync@local",
            viewCount: 0,
            createdAt: input.createdAt || now,
            updatedAt: input.updatedAt || now,
            ...(input.visibility === "public" ? { publishedAt: input.createdAt || now } : {}),
        };

        await insertOne(MONGODB.COLLECTIONS.POSTS, createdPost);

        return {
            post: createdPost,
            created: true,
        };
    }

    const nextPost: IPostDocument = {
        ...existingPost,
        slug: normalizedSlug,
        filename: input.filename,
        title: input.title.trim(),
        description: input.description.trim(),
        content: input.content,
        visibility: input.visibility,
        sharedWith: input.sharedWith,
        createdAt: existingPost.createdAt,
        updatedAt: input.updatedAt || now,
    };

    await updateOne(
        MONGODB.COLLECTIONS.POSTS,
        { slug: existingPost.slug },
        {
            $set: {
                slug: nextPost.slug,
                filename: nextPost.filename,
                title: nextPost.title,
                description: nextPost.description,
                content: nextPost.content,
                visibility: nextPost.visibility,
                sharedWith: nextPost.sharedWith,
                updatedAt: nextPost.updatedAt,
            },
        }
    );

    if (existingPost.slug !== nextPost.slug) {
        await updateMany(
            MONGODB.COLLECTIONS.COMMENTS,
            { postSlug: existingPost.slug },
            {
                $set: {
                    postSlug: nextPost.slug,
                },
            }
        );
    }

    return {
        post: nextPost,
        created: false,
    };
}
