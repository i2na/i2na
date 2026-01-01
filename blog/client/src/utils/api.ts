const API_BASE = "/api";

interface FetchOptions {
    userEmail?: string | null;
}

export async function fetchPosts(options: FetchOptions = {}) {
    const headers: HeadersInit = {};
    if (options.userEmail) {
        headers["x-user-email"] = options.userEmail;
    }

    const response = await fetch(`${API_BASE}/posts`, { headers });
    if (!response.ok) {
        throw new Error("Failed to fetch posts");
    }

    return await response.json();
}

export async function fetchPost(filename: string, options: FetchOptions = {}) {
    const headers: HeadersInit = {};
    if (options.userEmail) {
        headers["x-user-email"] = options.userEmail;
    }

    const response = await fetch(`${API_BASE}/posts?file=${encodeURIComponent(filename)}`, {
        headers,
    });

    if (!response.ok) {
        if (response.status === 403 || response.status === 404) {
            return null;
        }
        throw new Error("Failed to fetch post");
    }

    return await response.json();
}
