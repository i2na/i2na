"use client";

import { GoLock, GoRepo } from "react-icons/go";
import { FiEye } from "react-icons/fi";
import { SITE_CONFIG } from "@/shared/config";
import type { IPostSummary } from "@/shared/lib/types";
import styles from "../styles/Card.module.scss";

interface CardProps {
    post: IPostSummary;
    onClick: (slug: string) => void;
}

export function Card({ post, onClick }: CardProps) {
    return (
        <article className={styles.item} onClick={() => onClick(post.slug)}>
            <div className={styles.itemMain}>
                <div className={styles.itemTitleRow}>
                    <span className={styles.repoIconWrap}>
                        <GoRepo className={styles.repoIcon} />
                    </span>
                    <h2 className={styles.itemTitle} title={post.title}>
                        {post.title}
                    </h2>
                </div>

                <p className={styles.description}>{post.description}</p>

                <div className={styles.itemMeta}>
                    <span className={styles.author}>@{SITE_CONFIG.TITLE}</span>
                    <span className={styles.dot}>•</span>
                    <span className={styles.date}>{post.metadata.createdAt || "No date"}</span>
                    <span className={styles.dot}>•</span>
                    <span className={styles.viewCount}>
                        <FiEye />
                        {post.viewCount}
                    </span>
                    {post.metadata.visibility === "private" && (
                        <span className={styles.sharedBadge}>
                            <GoLock size={12} />
                            <span>Private</span>
                        </span>
                    )}
                </div>
            </div>
        </article>
    );
}
