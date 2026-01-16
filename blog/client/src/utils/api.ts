interface FetchOptions {
    userEmail?: string | null;
}

export async function fetchPosts(options: FetchOptions = {}) {
    const headers: HeadersInit = {};
    if (options.userEmail) {
        headers["x-user-email"] = options.userEmail;
    }

    const response = await fetch("/api/posts", { headers });
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

    const response = await fetch(`/api/posts?file=${encodeURIComponent(filename)}`, {
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

export async function fetchEmailConfig() {
    const response = await fetch("/api/email-config");
    if (!response.ok) {
        throw new Error("Failed to fetch email config");
    }
    return await response.json();
}

export async function updatePostSharedWith(
    filename: string,
    sharedWith: string[],
    userEmail: string,
    visibility?: "public" | "private"
) {
    const response = await fetch(
        `/api/posts/shared-with?filename=${encodeURIComponent(filename)}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "x-user-email": userEmail,
            },
            body: JSON.stringify({ sharedWith, ...(visibility && { visibility }) }),
        }
    );

    if (!response.ok) {
        throw new Error("Failed to update shared emails");
    }

    return await response.json();
}

export async function deletePost(filename: string, userEmail: string) {
    const response = await fetch(
        `/api/posts/delete?filename=${encodeURIComponent(filename)}`,
        {
            method: "DELETE",
            headers: {
                "x-user-email": userEmail,
            },
        }
    );

    if (!response.ok) {
        throw new Error("Failed to delete post");
    }

    return await response.json();
}
