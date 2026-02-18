"use client";

import { useEffect } from "react";
import { Container } from "@/features/post-list";
import { useAuthStore, getUserInfo, isAuthenticated } from "@/features/auth";

export default function HomePage() {
    const { setUser } = useAuthStore();

    useEffect(() => {
        if (!isAuthenticated()) {
            setUser(null);
            return;
        }

        setUser(getUserInfo());
    }, [setUser]);

    return <Container />;
}
