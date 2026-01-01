import type { UserInfo } from "@/types";

const STORAGE_KEYS = {
    TOKEN: "blog_auth_token",
    EMAIL: "blog_user_email",
    NAME: "blog_user_name",
    EXPIRES: "blog_expires",
} as const;

export function isAuthenticated(): boolean {
    if (typeof window === "undefined") return false;

    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const expires = localStorage.getItem(STORAGE_KEYS.EXPIRES);

    if (!token || !expires) return false;

    if (Date.now() > parseInt(expires)) {
        clearAuth();
        return false;
    }

    return true;
}

export function getUserInfo(): UserInfo | null {
    if (!isAuthenticated()) return null;

    const email = localStorage.getItem(STORAGE_KEYS.EMAIL);
    const name = localStorage.getItem(STORAGE_KEYS.NAME);

    if (!email) return null;

    return {
        email,
        name: name || "",
    };
}

export function clearAuth(): void {
    Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
    });
}

export function startGoogleLogin(returnPath?: string): void {
    if (isAuthenticated()) {
        return;
    }

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const baseUrl = import.meta.env.VITE_BASE_URL;
    const redirectUri = `${baseUrl}/api/auth/google`;
    const scope = "email profile";

    const currentPath = returnPath || window.location.pathname + window.location.search;
    localStorage.setItem("auth_return_path", currentPath);

    const authUrl =
        `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(scope)}&` +
        `state=${encodeURIComponent(currentPath)}`;

    window.location.href = authUrl;
}

export function getAuthReturnPath(): string | null {
    return localStorage.getItem("auth_return_path");
}

export function clearAuthReturnPath(): void {
    localStorage.removeItem("auth_return_path");
}
