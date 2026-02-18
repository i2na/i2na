import { ENV_VARS } from "@server/config/constants";
import { getAdminEmails, isAdmin } from "@server/auth/access";
import {
    canUserAccessPost,
    createPost,
    deletePostBySlug,
    getPostBySlug,
    incrementPostViewCount,
    isPostPublishedNow,
    listAllPosts,
    listPosts,
    normalizePostSlug,
    updatePost,
} from "@server/models/posts.model";
import type { IPostDocument, TPostSort, TPostVisibility } from "@server/models/types";
import { HttpError } from "@server/utils/http-error";
import { backupPostContent, removePostBackup } from "@server/utils/post-backup";
import { deliverPublicationAlerts } from "@server/utils/subscription-alert";
import { extractMediaUrlsFromMarkdown, removeUnusedMediaFiles } from "@server/utils/media";
import { trackAnalyticsEvent } from "@server/models/analytics.model";

interface IListPostsInput {
    viewerEmail?: string | null;
    search?: string;
    visibility?: "all" | "public" | "private";
    sort?: TPostSort;
}

interface IUpsertPostPayload {
    slug?: string;
    nextSlug?: string;
    title: string;
    description: string;
    content: string;
    visibility: TPostVisibility;
    sharedWith?: string[];
    authorName?: string;
}

function normalizeVisibility(value: unknown): TPostVisibility {
    if (value === "private") {
        return "private";
    }

    if (value === "public") {
        return "public";
    }

    throw new HttpError(400, "visibility must be public or private");
}

function normalizeUpsertPayload(payload: IUpsertPostPayload) {
    return {
        title: typeof payload.title === "string" ? payload.title : "",
        description: typeof payload.description === "string" ? payload.description : "",
        content: typeof payload.content === "string" ? payload.content : "",
        visibility: normalizeVisibility(payload.visibility),
        slug: typeof payload.slug === "string" ? payload.slug : undefined,
        nextSlug: typeof payload.nextSlug === "string" ? payload.nextSlug : undefined,
        sharedWith: normalizeSharedEmails(payload.sharedWith),
        authorName: typeof payload.authorName === "string" ? payload.authorName : undefined,
    };
}

function normalizeSharedEmails(sharedWith: unknown): string[] {
    if (!Array.isArray(sharedWith)) {
        return [];
    }

    return Array.from(
        new Set(
            sharedWith
                .map((email) => String(email).trim().toLowerCase())
                .filter((email) => email.length > 0)
        )
    );
}

function toPostSummary(post: IPostDocument) {
    return {
        slug: post.slug,
        filename: post.filename,
        title: post.title,
        description: post.description,
        path: post.filename,
        viewCount: post.viewCount,
        metadata: {
            visibility: post.visibility,
            sharedWith: post.sharedWith,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
        },
    };
}

function toPostDetail(post: IPostDocument) {
    return {
        ...toPostSummary(post),
        content: post.content,
        authorName: post.authorName,
        authorEmail: post.authorEmail,
    };
}

async function cleanupUnusedMediaFromPosts(): Promise<void> {
    const posts = await listAllPosts();
    const allUsedUrls = new Set<string>();

    posts.forEach((post) => {
        extractMediaUrlsFromMarkdown(post.content).forEach((url) => {
            allUsedUrls.add(url);
        });
    });

    await removeUnusedMediaFiles(Array.from(allUsedUrls));
}

async function assertAdminAccess(viewerEmail: string): Promise<void> {
    const adminEmails = await getAdminEmails();
    const viewerIsAdmin = isAdmin(viewerEmail, adminEmails);

    if (!viewerIsAdmin) {
        throw new HttpError(403, "Admin access required");
    }
}

async function notifyIfPublished(
    previousPost: IPostDocument | null,
    nextPost: IPostDocument
): Promise<void> {
    if (!isPostPublishedNow(previousPost, nextPost)) {
        return;
    }

    const baseUrl = (ENV_VARS.PUBLIC_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
    const postUrl = `${baseUrl}/${nextPost.slug}`;

    await deliverPublicationAlerts({
        postSlug: nextPost.slug,
        postTitle: nextPost.title,
        postDescription: nextPost.description,
        postUrl,
    });

    await trackAnalyticsEvent({
        type: "publish",
        postSlug: nextPost.slug,
    });
}

export async function listPostsController(input: IListPostsInput) {
    const adminEmails = await getAdminEmails();
    const viewerIsAdmin = isAdmin(input.viewerEmail || undefined, adminEmails);

    const posts = await listPosts(
        {
            viewerEmail: input.viewerEmail,
            search: input.search,
            visibility: input.visibility,
            sort: input.sort,
        },
        viewerIsAdmin
    );

    return {
        posts: posts.map(toPostSummary),
    };
}

export async function getPostController(slug: string, viewerEmail: string | null | undefined) {
    const targetSlug = normalizePostSlug(slug);
    const post = await getPostBySlug(targetSlug);

    if (!post) {
        throw new HttpError(404, "Post not found");
    }

    const adminEmails = await getAdminEmails();
    const viewerIsAdmin = isAdmin(viewerEmail || undefined, adminEmails);

    if (!canUserAccessPost(post, viewerEmail, viewerIsAdmin)) {
        throw new HttpError(403, "Access denied");
    }

    return toPostDetail(post);
}

export async function createPostController(
    payload: IUpsertPostPayload,
    viewerEmail: string | undefined,
    viewerName: string | undefined
) {
    if (!viewerEmail) {
        throw new HttpError(401, "Unauthorized");
    }
    await assertAdminAccess(viewerEmail);

    const normalizedPayload = normalizeUpsertPayload(payload);

    const slug = normalizedPayload.slug
        ? normalizePostSlug(normalizedPayload.slug)
        : normalizePostSlug(normalizedPayload.title);
    if (!slug) {
        throw new HttpError(400, "slug is required");
    }

    const createdPost = await createPost({
        slug,
        title: normalizedPayload.title,
        description: normalizedPayload.description,
        content: normalizedPayload.content,
        visibility: normalizedPayload.visibility,
        sharedWith: normalizedPayload.sharedWith,
        authorName: (normalizedPayload.authorName || viewerName || viewerEmail).trim(),
        authorEmail: viewerEmail,
    });

    await backupPostContent(createdPost);
    await notifyIfPublished(null, createdPost);
    await cleanupUnusedMediaFromPosts();

    return toPostDetail(createdPost);
}

export async function updatePostController(
    slug: string,
    payload: IUpsertPostPayload,
    viewerEmail: string | undefined
) {
    if (!viewerEmail) {
        throw new HttpError(401, "Unauthorized");
    }
    await assertAdminAccess(viewerEmail);

    const normalizedPayload = normalizeUpsertPayload(payload);

    const currentPost = await getPostBySlug(slug);
    if (!currentPost) {
        throw new HttpError(404, "Post not found");
    }

    const nextSlug = normalizedPayload.nextSlug
        ? normalizePostSlug(normalizedPayload.nextSlug)
        : undefined;
    const updatedPost = await updatePost(slug, {
        title: normalizedPayload.title,
        description: normalizedPayload.description,
        content: normalizedPayload.content,
        visibility: normalizedPayload.visibility,
        sharedWith: normalizedPayload.sharedWith,
        ...(nextSlug ? { nextSlug } : {}),
    });

    await backupPostContent(updatedPost);

    if (currentPost.filename !== updatedPost.filename) {
        await removePostBackup(currentPost.filename);
    }

    await notifyIfPublished(currentPost, updatedPost);
    await cleanupUnusedMediaFromPosts();

    return toPostDetail(updatedPost);
}

export async function deletePostController(slug: string, viewerEmail: string | undefined) {
    if (!viewerEmail) {
        throw new HttpError(401, "Unauthorized");
    }
    await assertAdminAccess(viewerEmail);

    const currentPost = await getPostBySlug(slug);
    if (!currentPost) {
        throw new HttpError(404, "Post not found");
    }

    await deletePostBySlug(slug);
    await removePostBackup(currentPost.filename);
    await cleanupUnusedMediaFromPosts();

    return {
        deleted: true,
    };
}

export async function incrementPostViewController(
    slug: string,
    viewerKey: string | undefined
): Promise<{ viewCount: number }> {
    const nextViewCount = await incrementPostViewCount(slug);

    await trackAnalyticsEvent({
        type: "visit",
        postSlug: slug,
        ...(viewerKey ? { viewerKey } : {}),
    });

    return {
        viewCount: nextViewCount,
    };
}
