import React from "react";
import { Icons } from "@/shared/ui/icons";
import type { BlogPostDisplay } from "../model/types";
import styles from "./BlogPostItem.module.scss";
import cn from "classnames";

interface BlogPostItemProps {
    post: BlogPostDisplay;
    theme: "dark" | "light";
    onClick: () => void;
}

export const BlogPostItem: React.FC<BlogPostItemProps> = ({ post, theme, onClick }) => {
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
};
