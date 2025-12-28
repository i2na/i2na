import type { IPost } from "@/entities/blog/model/types";

export interface IBlogPostContentProps {
    post: IPost;
    onBack: () => void;
}

