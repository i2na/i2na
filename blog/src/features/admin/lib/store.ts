"use client";

import { create } from "zustand";
import { getUserInfo } from "@/features/auth/lib/client";
import { fetchEmailConfig } from "@/shared/lib/api";
import type { IAdminState } from "./types";

function normalizeEmail(value: string | null | undefined): string {
    return (value || "").trim().toLowerCase();
}

export const useAdminStore = create<IAdminState>((set, get) => ({
    isAdmin: false,
    adminEmails: [],
    archiveEmails: [],

    checkAdminStatus: async () => {
        const user = getUserInfo();
        if (!user) {
            set({ isAdmin: false });
            return;
        }

        const { adminEmails } = get();
        const normalizedUserEmail = normalizeEmail(user.email);
        const isAdmin = adminEmails.some((email) => normalizeEmail(email) === normalizedUserEmail);
        set({ isAdmin });
    },

    loadEmailConfig: async () => {
        try {
            const config = await fetchEmailConfig();
            const adminEmails = Array.isArray(config.admin) ? config.admin : [];
            const archiveEmails = Array.isArray(config.archive) ? config.archive : [];

            set({
                adminEmails: adminEmails.map((email: string) => normalizeEmail(email)).filter(Boolean),
                archiveEmails: archiveEmails
                    .map((email: string) => normalizeEmail(email))
                    .filter(Boolean),
            });
            await get().checkAdminStatus();
        } catch (error) {
            console.error("Failed to load email config:", error);
            set({ adminEmails: [], archiveEmails: [] });
        }
    },
}));
