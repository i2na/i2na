"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PostEditorPage } from "@/features/post-editor";
import { useAdminStore } from "@/features/admin";
import { useAuthStore, getUserInfo, isAuthenticated } from "@/features/auth";

export default function SettingsPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const router = useRouter();
    const { setUser } = useAuthStore();
    const { loadEmailConfig } = useAdminStore();

    useEffect(() => {
        let isMounted = true;

        const guardAdmin = async () => {
            if (!isAuthenticated()) {
                router.replace("/");
                return;
            }

            const user = getUserInfo();
            setUser(user);

            if (!user?.email) {
                router.replace("/");
                return;
            }

            await loadEmailConfig();

            if (!isMounted) {
                return;
            }

            const normalizedUserEmail = user.email.trim().toLowerCase();
            const { adminEmails } = useAdminStore.getState();
            const isAdmin = adminEmails.includes(normalizedUserEmail);

            if (!isAdmin) {
                router.replace("/");
            }
        };

        guardAdmin();

        return () => {
            isMounted = false;
        };
    }, [loadEmailConfig, router, setUser]);

    return <PostEditorPage mode="edit" slug={slug} />;
}
