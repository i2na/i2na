"use client";

import { use, useEffect } from "react";
import { Container } from "@/features/post-view";
import { useAuthStore, getUserInfo, isAuthenticated } from "@/features/auth";

export default function PostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const { setUser } = useAuthStore();

    useEffect(() => {
        if (!isAuthenticated()) {
            setUser(null);
            return;
        }

        setUser(getUserInfo());
    }, [setUser]);

    return <Container slug={slug} />;
}
