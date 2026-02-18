"use client";

import { useEffect } from "react";
import { useAdminStore } from "@/features/admin";
import { useAuthStore } from "@/features/auth";
import { LoadingSpinner } from "@/shared/ui";
import { usePost } from "../lib/use-post";
import { useEngagement } from "../lib/use-engagement";
import { extractTableOfContents } from "../lib/use-toc";
import { SITE_CONFIG } from "@/shared/config";
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
    const siteTitle = SITE_CONFIG.TITLE;

    useEffect(() => {
        if (!user?.email) {
            return;
        }

        loadEmailConfig();
    }, [loadEmailConfig, user?.email]);

    useEffect(() => {
        if (!post?.filename) {
            return;
        }

        const previousTitle = document.title;
        document.title = `${siteTitle} | ${post.filename}`;

        return () => {
            document.title = previousTitle;
        };
    }, [post?.filename]);

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

                <div className={styles.content}>
                    <Renderer file={post} viewCount={viewCount} />
                </div>

                <CommentsSection postSlug={post.slug} />
            </div>
        </div>
    );
}
