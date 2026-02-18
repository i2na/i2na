"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AUTH_COPY, ROUTES, SITE_CONFIG } from "@/shared/config";
import { subscribeToPostAlerts, syncRepositoryAndDatabase } from "@/shared/lib/api";
import { useAuthStore } from "@/features/auth";
import { LoginButton, LogoutButton } from "@/features/auth";
import { useAdminStore } from "@/features/admin";
import type { TPostSort, TPostVisibility } from "@/shared/lib/types";
import { usePosts } from "../lib/use-posts";
import { useHomeAnalytics } from "../lib/use-home-analytics";
import { Card } from "./Card";
import { HomeCharts } from "./HomeCharts";
import { Skeleton } from "./Skeleton";
import styles from "../styles/Container.module.scss";

const SORT_OPTIONS: Array<{ label: string; value: TPostSort }> = [
    { label: "Latest", value: "latest" },
    { label: "Oldest", value: "oldest" },
    { label: "View Count", value: "viewCount" },
    { label: "Name", value: "name" },
];

const VISIBILITY_OPTIONS: Array<{ label: string; value: "all" | TPostVisibility }> = [
    { label: "All", value: "all" },
    { label: "Public", value: "public" },
    { label: "Private", value: "private" },
];

export function Container() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const { isAdmin, loadEmailConfig } = useAdminStore();
    const [searchKeyword, setSearchKeyword] = useState("");
    const [visibility, setVisibility] = useState<"all" | TPostVisibility>("all");
    const [sort, setSort] = useState<TPostSort>("latest");
    const [subscriptionEmail, setSubscriptionEmail] = useState(user?.email || "");
    const [isSyncing, setIsSyncing] = useState(false);

    const { posts, loading } = usePosts({
        userEmail: user?.email || null,
        userName: user?.name || null,
        search: searchKeyword,
        visibility,
        sort,
    });
    const { analytics } = useHomeAnalytics();

    const listTitle = useMemo(() => `@${SITE_CONFIG.TITLE}`, []);

    useEffect(() => {
        if (user?.email) {
            setSubscriptionEmail(user.email);
        }
    }, [user?.email]);

    useEffect(() => {
        if (!user?.email) {
            return;
        }

        loadEmailConfig();
    }, [user?.email, loadEmailConfig]);

    const handleLogout = () => {
        window.location.reload();
    };

    const handleSubscribe = async () => {
        if (!subscriptionEmail.trim()) {
            toast.error("Email is required");
            return;
        }

        try {
            const result = await subscribeToPostAlerts(subscriptionEmail);
            toast.success(result.isNew ? "Subscribed for new public posts" : "Already subscribed");
            setSubscriptionEmail(result.email);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to subscribe");
        }
    };

    const handleSyncStores = async () => {
        if (!user?.email || isSyncing) {
            return;
        }

        try {
            setIsSyncing(true);
            const syncResult = await syncRepositoryAndDatabase(user.email);

            toast.success(
                `Sync done: repo scan ${syncResult.repositoryScanned}, repo→db +${
                    syncResult.repositoryToDatabaseCreated + syncResult.repositoryToDatabaseUpdated
                }, db→repo ${syncResult.databaseToRepositoryUpserted}`
            );
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Sync failed");
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div className={styles.listPage}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <div className={styles.brandBlock}>
                        <h1 className={styles.title}>{listTitle}</h1>
                        <p className={styles.subtitle}>Simple premium blog with MongoDB runtime</p>
                    </div>

                    {isAuthenticated && user ? (
                        <div className={styles.userInfo}>
                            <div className={styles.userSummary}>
                                <span className={styles.userName}>{user.name}</span>
                                <span className={styles.userEmail}>{user.email}</span>
                            </div>
                            {isAdmin && (
                                <>
                                    <button
                                        className={styles.newPostButton}
                                        onClick={() => router.push(ROUTES.NEW_POST)}
                                    >
                                        New Post
                                    </button>
                                    <button
                                        className={styles.syncButton}
                                        onClick={handleSyncStores}
                                        disabled={isSyncing}
                                    >
                                        {isSyncing ? "Syncing..." : "Sync DB ↔ Repo"}
                                    </button>
                                </>
                            )}
                            <LogoutButton onLogout={handleLogout}>Logout</LogoutButton>
                        </div>
                    ) : (
                        <LoginButton returnPath={ROUTES.HOME}>{AUTH_COPY.GOOGLE_CTA}</LoginButton>
                    )}
                </header>

                <section className={styles.subscribeSection}>
                    <div className={styles.subscribeText}>
                        <h2>Subscribe for public post alerts</h2>
                        <p>Get email updates whenever a new public post is published.</p>
                    </div>
                    <div className={styles.subscribeForm}>
                        <input
                            className={styles.subscribeInput}
                            value={subscriptionEmail}
                            onChange={(event) => setSubscriptionEmail(event.target.value)}
                            placeholder="email@example.com"
                        />
                        <button className={styles.subscribeButton} onClick={handleSubscribe}>
                            Subscribe
                        </button>
                    </div>
                </section>

                <HomeCharts analytics={analytics} />

                <section className={styles.controls}>
                    <input
                        className={styles.searchInput}
                        value={searchKeyword}
                        onChange={(event) => setSearchKeyword(event.target.value)}
                        placeholder="Search title or content"
                    />

                    <div className={styles.selectGroup}>
                        <select
                            className={styles.select}
                            value={visibility}
                            onChange={(event) =>
                                setVisibility(event.target.value as "all" | TPostVisibility)
                            }
                        >
                            {VISIBILITY_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>

                        <select
                            className={styles.select}
                            value={sort}
                            onChange={(event) => setSort(event.target.value as TPostSort)}
                        >
                            {SORT_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </section>

                <div className={styles.list}>
                    {loading ? (
                        <Skeleton />
                    ) : posts.length === 0 ? (
                        <div className={styles.empty}>No posts found</div>
                    ) : (
                        posts.map((post) => (
                            <Card
                                key={post.filename}
                                post={post}
                                onClick={(slug) => router.push(`/${slug}`)}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
