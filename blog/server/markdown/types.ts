export interface IPostMetadata {
    title: string;
    description: string;
    visibility: "public" | "private";
    sharedWith: string[];
    createdAt?: string;
    updatedAt?: string;
}

export interface IParsedPost {
    content: string;
    metadata: IPostMetadata;
}
