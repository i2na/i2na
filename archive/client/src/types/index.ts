export interface MarkdownFile {
    filename: string;
    title: string;
    content: string;
    path: string;
    metadata: PostMetadata;
}

export interface TocItem {
    level: number;
    text: string;
    id: string;
}

export type PostVisibility = "public" | "private";

export interface PostMetadata {
    visibility: PostVisibility;
    sharedWith: string[];
    createdAt?: string;
}

export interface UserInfo {
    email: string;
    name: string;
}
