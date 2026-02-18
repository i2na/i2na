import { MONGODB } from "@server/config/constants";
import { getIsoTimestamp } from "@server/utils/date";
import { HttpError } from "@server/utils/http-error";
import { getDocumentId } from "@server/utils/mongo";
import { deleteMany, deleteOne, findMany, findOne, insertOne, updateOne } from "./mongo-data-api";
import type { ICommentDocument, ICommentItem } from "./types";

interface ICreateCommentInput {
    postSlug: string;
    parentId?: string | null;
    authorName: string;
    authorEmail: string;
    content: string;
}

function mapCommentDocument(document: ICommentDocument): ICommentItem {
    return {
        id: getDocumentId(document),
        postSlug: document.postSlug,
        parentId: document.parentId,
        authorName: document.authorName,
        authorEmail: document.authorEmail,
        content: document.content,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt,
        replies: [],
    };
}

function buildCommentTree(comments: ICommentItem[]): ICommentItem[] {
    const itemMap = new Map<string, ICommentItem>();
    const roots: ICommentItem[] = [];

    comments.forEach((comment) => {
        itemMap.set(comment.id, comment);
    });

    comments.forEach((comment) => {
        if (!comment.parentId) {
            roots.push(comment);
            return;
        }

        const parent = itemMap.get(comment.parentId);
        if (!parent) {
            roots.push(comment);
            return;
        }

        parent.replies.push(comment);
    });

    return roots;
}

function assertCommentContent(content: string): void {
    if (!content.trim()) {
        throw new HttpError(400, "comment content is required");
    }

    if (content.length > 2000) {
        throw new HttpError(400, "comment is too long");
    }
}

export async function listCommentThread(postSlug: string): Promise<ICommentItem[]> {
    const comments = await findMany<ICommentDocument>(MONGODB.COLLECTIONS.COMMENTS, {
        filter: { postSlug },
        sort: { createdAt: 1 },
    });

    const normalized = comments.map(mapCommentDocument);
    return buildCommentTree(normalized);
}

export async function createComment(input: ICreateCommentInput): Promise<ICommentItem> {
    assertCommentContent(input.content);

    if (input.parentId) {
        const parentComment = await findOne<ICommentDocument>(MONGODB.COLLECTIONS.COMMENTS, {
            _id: { $oid: input.parentId },
            postSlug: input.postSlug,
        });

        if (!parentComment) {
            throw new HttpError(404, "parent comment not found");
        }
    }

    const newComment: ICommentDocument = {
        postSlug: input.postSlug,
        parentId: input.parentId || null,
        authorName: input.authorName,
        authorEmail: input.authorEmail,
        content: input.content.trim(),
        createdAt: getIsoTimestamp(),
    };

    const insertedId = await insertOne(MONGODB.COLLECTIONS.COMMENTS, newComment);

    return {
        id:
            typeof insertedId === "object" && insertedId && "$oid" in (insertedId as object)
                ? String((insertedId as { $oid: string }).$oid)
                : String(insertedId),
        postSlug: newComment.postSlug,
        parentId: newComment.parentId,
        authorName: newComment.authorName,
        authorEmail: newComment.authorEmail,
        content: newComment.content,
        createdAt: newComment.createdAt,
        updatedAt: newComment.updatedAt,
        replies: [],
    };
}

export async function getCommentById(
    postSlug: string,
    commentId: string
): Promise<ICommentDocument | null> {
    return await findOne<ICommentDocument>(MONGODB.COLLECTIONS.COMMENTS, {
        _id: { $oid: commentId },
        postSlug,
    });
}

export async function updateCommentById(
    postSlug: string,
    commentId: string,
    content: string
): Promise<ICommentItem> {
    const targetComment = await getCommentById(postSlug, commentId);
    if (!targetComment) {
        throw new HttpError(404, "Comment not found");
    }

    const nextContent = typeof content === "string" ? content : "";
    assertCommentContent(nextContent);

    const updatedAt = getIsoTimestamp();
    const normalizedContent = nextContent.trim();

    await updateOne(
        MONGODB.COLLECTIONS.COMMENTS,
        {
            _id: { $oid: commentId },
            postSlug,
        },
        {
            $set: {
                content: normalizedContent,
                updatedAt,
            },
        }
    );

    return {
        id: commentId,
        postSlug: targetComment.postSlug,
        parentId: targetComment.parentId,
        authorName: targetComment.authorName,
        authorEmail: targetComment.authorEmail,
        content: normalizedContent,
        createdAt: targetComment.createdAt,
        updatedAt,
        replies: [],
    };
}

export async function deleteCommentById(postSlug: string, commentId: string): Promise<void> {
    const targetComment = await getCommentById(postSlug, commentId);
    if (!targetComment) {
        throw new HttpError(404, "Comment not found");
    }

    const childComment = await findOne<ICommentDocument>(MONGODB.COLLECTIONS.COMMENTS, {
        postSlug,
        parentId: commentId,
    });

    if (childComment) {
        throw new HttpError(409, "Cannot delete a comment that has replies");
    }

    await deleteOne(MONGODB.COLLECTIONS.COMMENTS, {
        _id: { $oid: commentId },
        postSlug,
    });
}

export async function deleteCommentsByPostSlug(postSlug: string): Promise<void> {
    await deleteMany(MONGODB.COLLECTIONS.COMMENTS, { postSlug });
}
