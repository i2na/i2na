export type TPostVisibility = "public" | "private";

export type TPostSort = "latest" | "oldest" | "viewCount" | "name";

export interface IPostMetadata {
    visibility: TPostVisibility;
    sharedWith: string[];
    createdAt?: string;
    updatedAt?: string;
}

export interface IPostSummary {
    slug: string;
    filename: string;
    title: string;
    description: string;
    path: string;
    viewCount: number;
    metadata: IPostMetadata;
}

export interface IPostDetail extends IPostSummary {
    content: string;
    authorName: string;
    authorEmail: string;
}

export interface IMarkdownFile extends IPostDetail {}

export interface ITocItem {
    level: number;
    text: string;
    id: string;
}

export interface IPostUpsertPayload {
    slug?: string;
    nextSlug?: string;
    title: string;
    description: string;
    content: string;
    visibility: TPostVisibility;
    sharedWith: string[];
    authorName?: string;
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

export interface IUploadMediaResponse {
    url: string;
    fileName: string;
    bytes: number;
    mimeType: string;
}
