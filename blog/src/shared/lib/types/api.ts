import type {
    ICommentItem,
    IHomeAnalytics,
    IPostDetail,
    IPostSummary,
    IUploadMediaResponse,
} from "./post";

export interface IApiEnvelope<TData> {
    success: boolean;
    data: TData;
    error?: string;
}

export interface IPostsResponse {
    posts: IPostSummary[];
}

export interface IPostCommentsResponse {
    comments: ICommentItem[];
}

export interface IPostViewResponse {
    viewCount: number;
}

export interface ICreateCommentResponse {
    comment: ICommentItem;
}

export interface IUpdateCommentResponse {
    comment: ICommentItem;
}

export interface IDeleteCommentResponse {
    deleted: boolean;
}

export interface ISubscriptionResponse {
    email: string;
    subscribed: boolean;
    isNew: boolean;
}

export interface IHomeAnalyticsResponse extends IHomeAnalytics {}

export interface IUploadMediaApiResponse extends IUploadMediaResponse {}

export interface IPostResponse extends IPostDetail {}
