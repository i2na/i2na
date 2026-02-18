// @note x-user-email in request; validate input at API boundary; tokens in env (config).

export function getUserEmailFromRequest(headers: Headers): string | undefined {
    const email = headers.get("x-user-email");
    if (!email) {
        return undefined;
    }

    const normalized = email.trim().toLowerCase();
    return normalized.length > 0 ? normalized : undefined;
}

export function getUserNameFromRequest(headers: Headers): string | undefined {
    return headers.get("x-user-name") || undefined;
}

export function createAuthHeaders(userEmail: string): HeadersInit {
    return {
        "x-user-email": userEmail,
    };
}
