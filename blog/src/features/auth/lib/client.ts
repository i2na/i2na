"use client";

import { STORAGE_KEYS } from "@/shared/config";
import type { IUserInfo } from "@/shared/lib/types";

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

export function getUserInfo(): IUserInfo | null {
    if (!isAuthenticated()) return null;

    const email = localStorage.getItem(STORAGE_KEYS.EMAIL);
    const name = localStorage.getItem(STORAGE_KEYS.NAME);

    if (!email) return null;

    return {
        email: email.trim().toLowerCase(),
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

    const currentPath = returnPath || window.location.pathname + window.location.search;
    localStorage.setItem(STORAGE_KEYS.AUTH_RETURN_PATH, currentPath);

    const authUrl = `/api/auth/google?state=${encodeURIComponent(currentPath)}`;

    window.location.href = authUrl;
}

export function getAuthReturnPath(): string | null {
    return localStorage.getItem(STORAGE_KEYS.AUTH_RETURN_PATH);
}

export function clearAuthReturnPath(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH_RETURN_PATH);
}

export function saveAuthData(data: {
    token: string;
    email: string;
    name: string;
    expires: number;
}): void {
    const normalizedEmail = data.email.trim().toLowerCase();

    localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
    localStorage.setItem(STORAGE_KEYS.EMAIL, normalizedEmail);
    localStorage.setItem(STORAGE_KEYS.NAME, data.name);
    localStorage.setItem(STORAGE_KEYS.EXPIRES, data.expires.toString());
}
