import { Icons } from "@/shared/ui/icons";
import type { IBlogPostItemProps } from "../model/types";
import styles from "./BlogPostItem.module.scss";
import cn from "classnames";

export function BlogPostItem({ post, theme, onClick }: IBlogPostItemProps) {
    return (
        <div className={cn(styles.blogPostItem, styles[theme])} onClick={onClick}>
            <div className={styles.date}>
                <span>{post.date}</span>
            </div>

            <div className={styles.content}>
                <h3 className={styles.title}>{post.title}</h3>
                <p className={styles.excerpt}>{post.summary}</p>
            </div>

            <div className={styles.arrow}>
                <div>
                    <Icons.ArrowRight />
                </div>
            </div>
        </div>
    );
}
