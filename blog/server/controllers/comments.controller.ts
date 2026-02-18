import { getAdminEmails, isAdmin } from "@server/auth/access";
import { canUserAccessPost, getPostBySlug } from "@server/models/posts.model";
import {
    createComment,
    deleteCommentById,
    getCommentById,
    listCommentThread,
    updateCommentById,
} from "@server/models/comments.model";
import { HttpError } from "@server/utils/http-error";

interface ICreateCommentPayload {
    content: string;
    parentId?: string;
    authorName?: string;
}

interface IUpdateCommentPayload {
    content: string;
}

function normalizeEmail(value: string | null | undefined): string {
    return (value || "").trim().toLowerCase();
}

async function assertPostAccessible(
    slug: string,
    viewerEmail: string | null | undefined
): Promise<void> {
    const post = await getPostBySlug(slug);
    if (!post) {
        throw new HttpError(404, "Post not found");
    }

    const adminEmails = await getAdminEmails();
    const viewerIsAdmin = isAdmin(viewerEmail || undefined, adminEmails);

    if (!canUserAccessPost(post, viewerEmail, viewerIsAdmin)) {
        throw new HttpError(403, "Access denied");
    }
}

async function assertCanManageComment(
    slug: string,
    commentId: string,
    viewerEmail: string | undefined
): Promise<void> {
    if (!viewerEmail) {
        throw new HttpError(401, "Unauthorized");
    }

    await assertPostAccessible(slug, viewerEmail);

    const targetComment = await getCommentById(slug, commentId);
    if (!targetComment) {
        throw new HttpError(404, "Comment not found");
    }

    const adminEmails = await getAdminEmails();
    const viewerIsAdmin = isAdmin(viewerEmail, adminEmails);
    const viewerOwnsComment =
        normalizeEmail(targetComment.authorEmail) === normalizeEmail(viewerEmail);

    if (!viewerIsAdmin && !viewerOwnsComment) {
        throw new HttpError(403, "You can only manage your own comments");
    }
}

export async function listCommentsController(slug: string, viewerEmail: string | null | undefined) {
    await assertPostAccessible(slug, viewerEmail);

    return {
        comments: await listCommentThread(slug),
    };
}

export async function createCommentController(
    slug: string,
    payload: ICreateCommentPayload,
    viewerEmail: string | undefined
) {
    if (!viewerEmail) {
        throw new HttpError(401, "Unauthorized");
    }

    await assertPostAccessible(slug, viewerEmail);

    const comment = await createComment({
        postSlug: slug,
        parentId: payload.parentId || null,
        authorName: payload.authorName?.trim() || viewerEmail,
        authorEmail: viewerEmail,
        content: payload.content,
    });

    return {
        comment,
    };
}

export async function updateCommentController(
    slug: string,
    commentId: string,
    payload: IUpdateCommentPayload,
    viewerEmail: string | undefined
) {
    await assertCanManageComment(slug, commentId, viewerEmail);

    const comment = await updateCommentById(slug, commentId, payload.content);

    return {
        comment,
    };
}

export async function deleteCommentController(
    slug: string,
    commentId: string,
    viewerEmail: string | undefined
) {
    await assertCanManageComment(slug, commentId, viewerEmail);

    await deleteCommentById(slug, commentId);

    return {
        deleted: true,
    };
}
