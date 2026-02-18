import { API_ROUTES } from "@/shared/config";
import { createApiClient } from "./client";
import type {
    ICreateCommentResponse,
    IDeleteCommentResponse,
    IPostCommentsResponse,
    IPostResponse,
    IPostsResponse,
    IUpdateCommentResponse,
    IPostViewResponse,
    IUploadMediaApiResponse,
} from "@/shared/lib/types";
import type { IPostUpsertPayload, TPostSort, TPostVisibility } from "@/shared/lib/types";

interface IFetchOptions {
    userEmail?: string | null;
    userName?: string | null;
}

interface IPostsQuery {
    search?: string;
    visibility?: "all" | TPostVisibility;
    sort?: TPostSort;
}

const apiClient = createApiClient();

export async function fetchPosts(options: IFetchOptions = {}, query: IPostsQuery = {}) {
    const searchParams = new URLSearchParams();

    if (query.search) {
        searchParams.set("search", query.search);
    }

    if (query.visibility) {
        searchParams.set("visibility", query.visibility);
    }

    if (query.sort) {
        searchParams.set("sort", query.sort);
    }

    const url = `${API_ROUTES.POSTS}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

    return await apiClient.get<IPostsResponse>(url, {
        userEmail: options.userEmail,
        userName: options.userName,
    });
}

export async function fetchPost(slug: string, options: IFetchOptions = {}) {
    return await apiClient.get<IPostResponse>(API_ROUTES.POST(slug), {
        userEmail: options.userEmail,
        userName: options.userName,
    });
}

export async function createPost(payload: IPostUpsertPayload, options: IFetchOptions = {}) {
    return await apiClient.post<IPostResponse>(API_ROUTES.POSTS, payload, {
        userEmail: options.userEmail,
        userName: options.userName,
    });
}

export async function updatePost(
    slug: string,
    payload: IPostUpsertPayload,
    options: IFetchOptions = {}
) {
    return await apiClient.put<IPostResponse>(API_ROUTES.POST(slug), payload, {
        userEmail: options.userEmail,
        userName: options.userName,
    });
}

export async function deletePostBySlug(slug: string, options: IFetchOptions = {}) {
    return await apiClient.delete<{ deleted: boolean }>(API_ROUTES.POST(slug), {
        userEmail: options.userEmail,
        userName: options.userName,
    });
}

export async function incrementPostView(slug: string, viewerKey: string) {
    return await apiClient.post<IPostViewResponse>(API_ROUTES.POST_VIEW(slug), {
        viewerKey,
    });
}

export async function fetchPostComments(slug: string, options: IFetchOptions = {}) {
    return await apiClient.get<IPostCommentsResponse>(API_ROUTES.POST_COMMENTS(slug), {
        userEmail: options.userEmail,
        userName: options.userName,
    });
}

export async function createPostComment(
    slug: string,
    payload: { content: string; parentId?: string; authorName?: string },
    options: IFetchOptions = {}
) {
    return await apiClient.post<ICreateCommentResponse>(API_ROUTES.POST_COMMENTS(slug), payload, {
        userEmail: options.userEmail,
        userName: options.userName,
    });
}

export async function updatePostComment(
    slug: string,
    commentId: string,
    payload: { content: string },
    options: IFetchOptions = {}
) {
    return await apiClient.put<IUpdateCommentResponse>(
        API_ROUTES.POST_COMMENT(slug, commentId),
        payload,
        {
            userEmail: options.userEmail,
            userName: options.userName,
        }
    );
}

export async function deletePostComment(
    slug: string,
    commentId: string,
    options: IFetchOptions = {}
) {
    return await apiClient.delete<IDeleteCommentResponse>(
        API_ROUTES.POST_COMMENT(slug, commentId),
        {
            userEmail: options.userEmail,
            userName: options.userName,
        }
    );
}

export async function uploadMedia(file: File, options: IFetchOptions = {}) {
    const formData = new FormData();
    formData.append("file", file);

    return await apiClient.postForm<IUploadMediaApiResponse>(API_ROUTES.MEDIA_UPLOAD, formData, {
        userEmail: options.userEmail,
        userName: options.userName,
    });
}
