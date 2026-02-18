export type TPostVisibility = "public" | "private";

export type TPostSort = "latest" | "oldest" | "viewCount" | "name";

export interface IPostDocument {
    _id?: unknown;
    slug: string;
    filename: string;
    title: string;
    description: string;
    content: string;
    visibility: TPostVisibility;
    sharedWith: string[];
    authorName: string;
    authorEmail: string;
    viewCount: number;
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
}

export interface IPostListQuery {
    viewerEmail?: string | null;
    visibility?: "all" | TPostVisibility;
    search?: string;
    sort?: TPostSort;
}

export interface ICommentDocument {
    _id?: unknown;
    postSlug: string;
    parentId: string | null;
    authorName: string;
    authorEmail: string;
    content: string;
    createdAt: string;
    updatedAt?: string;
}

export interface ICommentItem {
    id: string;
    postSlug: string;
    parentId: string | null;
    authorName: string;
    authorEmail: string;
    content: string;
    createdAt: string;
    updatedAt?: string;
    replies: ICommentItem[];
}

export interface ISubscriptionDocument {
    _id?: unknown;
    email: string;
    createdAt: string;
    isActive: boolean;
}

export type TAnalyticsEventType = "visit" | "scroll" | "publish";

export interface IAnalyticsEventDocument {
    _id?: unknown;
    type: TAnalyticsEventType;
    viewerKey?: string;
    postSlug?: string;
    depth?: number;
    createdAt: string;
}

export interface IHomeAnalytics {
    pixelWeather: Array<{
        hour: number;
        weekday: number;
        count: number;
    }>;
    deepDive: {
        threshold: number;
        rate: number;
    };
    comebackLoop: {
        windowDays: number;
        returnRate: number;
    };
    makerRhythm: Array<{
        week: string;
        posts: number;
    }>;
}

export interface IMediaDocument {
    _id?: unknown;
    fileName: string;
    publicUrl: string;
    mimeType: string;
    extension: string;
    bytes: number;
    uploadedAt: string;
}
