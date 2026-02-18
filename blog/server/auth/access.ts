import type { IPostMetadata } from "../markdown/types";
import { fetchGitHubFile } from "../github/client";
import { APP_CONFIG } from "../config/constants";

function normalizeEmail(value: string | null | undefined): string {
    return (value || "").trim().toLowerCase();
}

function parseYamlArray(content: string, key: string): string[] {
    const match = content.match(new RegExp(`${key}:\\s*\\n((?:\\s+-\\s+[^\\n]+\\n?)+)`));
    if (!match) {
        return [];
    }

    return match[1]
        .split("\n")
        .map((line) => normalizeEmail(line.match(/^\s+-\s+(.+)$/)?.[1] || ""))
        .filter((item) => item.length > 0);
}

export function hasAccessToPost(
    metadata: Pick<IPostMetadata, "visibility" | "sharedWith">,
    userEmail: string | null | undefined,
    adminEmails: string[] = []
): boolean {
    const normalizedViewerEmail = normalizeEmail(userEmail);

    if (metadata.visibility === "public") {
        return true;
    }

    if (!normalizedViewerEmail) {
        return false;
    }

    if (adminEmails.map((email) => normalizeEmail(email)).includes(normalizedViewerEmail)) {
        return true;
    }

    return metadata.sharedWith
        .map((email) => normalizeEmail(email))
        .includes(normalizedViewerEmail);
}

export async function getAdminEmails(): Promise<string[]> {
    if (APP_CONFIG.ACCESS.ADMIN_EMAILS.length > 0) {
        return APP_CONFIG.ACCESS.ADMIN_EMAILS.map((email) => normalizeEmail(email)).filter(Boolean);
    }

    try {
        const emailConfigContent = await fetchGitHubFile("email.yaml");
        return parseYamlArray(emailConfigContent, "admin");
    } catch {
        return [];
    }
}

export async function getEmailConfig(): Promise<{ admin: string[]; archive: string[] }> {
    if (APP_CONFIG.ACCESS.ADMIN_EMAILS.length > 0 || APP_CONFIG.ACCESS.ARCHIVE_EMAILS.length > 0) {
        return {
            admin: APP_CONFIG.ACCESS.ADMIN_EMAILS.map((email) => normalizeEmail(email)).filter(
                Boolean
            ),
            archive: APP_CONFIG.ACCESS.ARCHIVE_EMAILS.map((email) => normalizeEmail(email)).filter(
                Boolean
            ),
        };
    }

    try {
        const emailConfigContent = await fetchGitHubFile("email.yaml");
        return {
            admin: parseYamlArray(emailConfigContent, "admin"),
            archive: parseYamlArray(emailConfigContent, "archive"),
        };
    } catch {
        return {
            admin: [],
            archive: [],
        };
    }
}

export function isAdmin(userEmail: string | undefined, adminEmails: string[]): boolean {
    const normalizedUserEmail = normalizeEmail(userEmail);
    if (!normalizedUserEmail) {
        return false;
    }

    return adminEmails.map((email) => normalizeEmail(email)).includes(normalizedUserEmail);
}
