import { Icons } from "@/shared/ui/icons";
import { BlogPostItem } from "./BlogPostItem";
import type { IBlogListProps } from "../model/types";
import styles from "./BlogList.module.scss";
import cn from "classnames";

export function BlogList({
    posts = [],
    theme = "dark",
    onPostClick,
    className,
    onViewArchive,
}: IBlogListProps) {
    return (
        <div className={cn(styles.blogList, styles[theme], className)}>
            <div className={styles.postsContainer}>
                {posts.map((post) => (
                    <BlogPostItem
                        key={post.slug}
                        post={post}
                        theme={theme}
                        onClick={() => onPostClick(post)}
                    />
                ))}
            </div>

            {onViewArchive && (
                <div className={styles.archiveButton}>
                    <button onClick={onViewArchive}>
                        <span>View Full Archive</span>
                        <Icons.ArrowRight />
                    </button>
                </div>
            )}
        </div>
    );
}
