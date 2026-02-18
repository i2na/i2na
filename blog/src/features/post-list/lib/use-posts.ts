"use client";

import { useEffect, useState } from "react";
import { fetchPosts } from "@/shared/lib/api";
import type { IPostSummary, TPostSort, TPostVisibility } from "@/shared/lib/types";

interface IUsePostsOptions {
    userEmail?: string | null;
    userName?: string | null;
    search: string;
    visibility: "all" | TPostVisibility;
    sort: TPostSort;
}

export function usePosts(options: IUsePostsOptions) {
    const [posts, setPosts] = useState<IPostSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const loadPosts = async () => {
            try {
                setLoading(true);
                const data = await fetchPosts(
                    {
                        userEmail: options.userEmail,
                        userName: options.userName,
                    },
                    {
                        search: options.search,
                        visibility: options.visibility,
                        sort: options.sort,
                    }
                );

                if (!isMounted) {
                    return;
                }

                setPosts(data.posts || []);
                setError(null);
            } catch (error) {
                if (!isMounted) {
                    return;
                }

                setPosts([]);
                setError(error instanceof Error ? error.message : "Failed to load posts");
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadPosts();

        return () => {
            isMounted = false;
        };
    }, [options.userEmail, options.userName, options.search, options.visibility, options.sort]);

    return {
        posts,
        loading,
        error,
    };
}
