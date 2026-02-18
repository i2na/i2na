"use client";

import { useEffect, useMemo, useState } from "react";
import { incrementPostView, trackScrollAnalytics } from "@/shared/lib/api";

const VIEWER_KEY_STORAGE = "i2na-blog_viewer_key";

function getViewerKey(): string {
    if (typeof window === "undefined") {
        return "";
    }

    const stored = localStorage.getItem(VIEWER_KEY_STORAGE);
    if (stored) {
        return stored;
    }

    const next = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(VIEWER_KEY_STORAGE, next);
    return next;
}

function calculateScrollDepth(): number {
    const windowHeight = window.innerHeight;
    const bodyHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY;
    const totalScrollable = Math.max(bodyHeight - windowHeight, 1);

    return Math.min(100, Math.max(0, Math.round((scrollTop / totalScrollable) * 100)));
}

export function useEngagement(postSlug: string, initialViewCount: number) {
    const viewerKey = useMemo(() => getViewerKey(), []);
    const [viewCount, setViewCount] = useState(initialViewCount);

    useEffect(() => {
        setViewCount(initialViewCount);
    }, [initialViewCount]);

    useEffect(() => {
        let mounted = true;

        const trackView = async () => {
            try {
                const result = await incrementPostView(postSlug, viewerKey);
                if (mounted) {
                    setViewCount(result.viewCount);
                }
            } catch {
                return;
            }
        };

        trackView();

        return () => {
            mounted = false;
        };
    }, [postSlug, viewerKey]);

    useEffect(() => {
        let hasTrackedDeepDive = false;

        const handleScroll = () => {
            if (hasTrackedDeepDive) {
                return;
            }

            const depth = calculateScrollDepth();
            if (depth < 80) {
                return;
            }

            hasTrackedDeepDive = true;
            trackScrollAnalytics({
                viewerKey,
                postSlug,
                depth,
            }).catch(() => undefined);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [postSlug, viewerKey]);

    return {
        viewCount,
    };
}
