"use client";

import { useEffect, useState } from "react";
import { fetchPost } from "@/shared/lib/api";
import type { IPostDetail } from "@/shared/lib/types";

export function usePost(
    slug: string,
    userEmail: string | null = null,
    userName: string | null = null
) {
    const [post, setPost] = useState<IPostDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const loadPost = async () => {
            try {
                setLoading(true);
                const data = await fetchPost(slug, {
                    userEmail,
                    userName,
                });

                if (!isMounted) {
                    return;
                }

                setPost(data);
                setError(null);
            } catch (error) {
                if (!isMounted) {
                    return;
                }

                setPost(null);
                setError(error instanceof Error ? error.message : "Failed to load post");
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadPost();

        return () => {
            isMounted = false;
        };
    }, [slug, userEmail, userName]);

    return {
        post,
        loading,
        error,
    };
}
