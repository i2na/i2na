import type { IPostMeta } from "@/entities/blog/model/types";
import { formatDate } from "@/shared/lib/date";

export interface TPostDisplay extends IPostMeta {
    date: string;
    tags: string[];
}

export interface IBlogListProps {
    posts?: TPostDisplay[];
    theme?: "dark" | "light";
    onPostClick: (post: TPostDisplay) => void;
    className?: string;
    onViewArchive?: () => void;
}

export interface IBlogPostItemProps {
    post: TPostDisplay;
    theme?: "dark" | "light";
    onClick: () => void;
}

export function convertToDisplayPost(metadata: IPostMeta): TPostDisplay {
    return {
        ...metadata,
        date: formatDate(metadata.createdAt, "ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        })
            .replace(/\./g, ".")
            .replace(/\s/g, ""),
        tags: ["Technical"],
    };
}
