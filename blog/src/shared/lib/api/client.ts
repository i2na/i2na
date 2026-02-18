import type { IApiEnvelope } from "@/shared/lib/types";

interface IRequestOptions {
    userEmail?: string | null;
    userName?: string | null;
}

function createHeaders(options: IRequestOptions, withJsonContentType = true): HeadersInit {
    const headers: HeadersInit = {};

    if (withJsonContentType) {
        headers["Content-Type"] = "application/json";
    }

    if (options.userEmail) {
        headers["x-user-email"] = options.userEmail;
    }

    if (options.userName) {
        headers["x-user-name"] = options.userName;
    }

    return headers;
}

async function parseApiResponse<TData>(response: Response): Promise<TData> {
    const json = (await response.json().catch(() => ({}))) as Partial<IApiEnvelope<TData>>;

    if (!response.ok || !json.success) {
        throw new Error(json.error || `API Error: ${response.status}`);
    }

    if (typeof json.data === "undefined") {
        throw new Error("API Error: Missing response data");
    }

    return json.data;
}

export function createApiClient() {
    return {
        get: async <TData>(url: string, options: IRequestOptions = {}): Promise<TData> => {
            const response = await fetch(url, {
                headers: createHeaders(options, false),
            });

            return await parseApiResponse<TData>(response);
        },

        post: async <TData>(
            url: string,
            body: unknown,
            options: IRequestOptions = {}
        ): Promise<TData> => {
            const response = await fetch(url, {
                method: "POST",
                headers: createHeaders(options),
                body: JSON.stringify(body),
            });

            return await parseApiResponse<TData>(response);
        },

        put: async <TData>(
            url: string,
            body: unknown,
            options: IRequestOptions = {}
        ): Promise<TData> => {
            const response = await fetch(url, {
                method: "PUT",
                headers: createHeaders(options),
                body: JSON.stringify(body),
            });

            return await parseApiResponse<TData>(response);
        },

        delete: async <TData>(url: string, options: IRequestOptions = {}): Promise<TData> => {
            const response = await fetch(url, {
                method: "DELETE",
                headers: createHeaders(options, false),
            });

            return await parseApiResponse<TData>(response);
        },

        postForm: async <TData>(
            url: string,
            formData: FormData,
            options: IRequestOptions = {}
        ): Promise<TData> => {
            const response = await fetch(url, {
                method: "POST",
                headers: createHeaders(options, false),
                body: formData,
            });

            return await parseApiResponse<TData>(response);
        },
    };
}
