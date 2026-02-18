"use client";

import { useEffect } from "react";
import { FiEye } from "react-icons/fi";
import { useAdminStore } from "@/features/admin";
import { useAuthStore } from "@/features/auth";
import { LoadingSpinner } from "@/shared/ui";
import { usePost } from "../lib/use-post";
import { useEngagement } from "../lib/use-engagement";
import { extractTableOfContents } from "../lib/use-toc";
import { CommentsSection } from "./CommentsSection";
import { Renderer } from "./Renderer";
import { Toolbar } from "./Toolbar";
import styles from "../styles/Container.module.scss";

interface ContainerProps {
    slug: string;
}

export function Container({ slug }: ContainerProps) {
    const { user } = useAuthStore();
    const { isAdmin, loadEmailConfig } = useAdminStore();
    const { post, loading, error } = usePost(slug, user?.email || null, user?.name || null);
    const tocItems = post ? extractTableOfContents(post.content) : [];
    const { viewCount } = useEngagement(slug, post?.viewCount || 0);

    useEffect(() => {
        if (!user?.email) {
            return;
        }

        loadEmailConfig();
    }, [loadEmailConfig, user?.email]);

    if (loading) {
        return (
            <div className={styles.viewPage}>
                <div className={styles.container}>
                    <LoadingSpinner className={styles.loading} />
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className={styles.viewPage}>
                <div className={styles.container}>
                    <p className={styles.error}>{error || "Post not found"}</p>
                </div>
            </div>
        );
    }

    const canEdit = Boolean(user?.email && isAdmin);

    return (
        <div className={styles.viewPage}>
            <div className={styles.container}>
                <Toolbar canEdit={canEdit} slug={slug} tocItems={tocItems} />

                <div className={styles.reactionRow}>
                    <span className={styles.reactionLabel}>Reaction</span>
                    <span className={styles.viewCount}>
                        <FiEye />
                        {viewCount}
                    </span>
                </div>

                <div className={styles.content}>
                    <Renderer file={post} />
                </div>

                <CommentsSection postSlug={post.slug} />
            </div>
        </div>
    );
}
