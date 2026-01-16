import { create } from "zustand";
import { getUserInfo } from "@/utils/auth";
import { fetchEmailConfig } from "@/utils/api";

interface IAdminState {
    isAdmin: boolean;
    adminEmails: string[];
    archiveEmails: string[];
    checkAdminStatus: () => Promise<void>;
    loadEmailConfig: () => Promise<void>;
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
        const isAdmin = adminEmails.includes(user.email);
        set({ isAdmin });
    },

    loadEmailConfig: async () => {
        try {
            const config = await fetchEmailConfig();
            set({
                adminEmails: config.admin || [],
                archiveEmails: config.archive || [],
            });
            await get().checkAdminStatus();
        } catch (error) {
            console.error("Failed to load email config:", error);
            set({ adminEmails: [], archiveEmails: [] });
        }
    },
}));
