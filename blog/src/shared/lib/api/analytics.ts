import { API_ROUTES } from "@/shared/config";
import { createApiClient } from "./client";
import type { IHomeAnalyticsResponse } from "@/shared/lib/types";

const apiClient = createApiClient();

export async function fetchHomeAnalytics() {
    return await apiClient.get<IHomeAnalyticsResponse>(API_ROUTES.ANALYTICS_HOME);
}

export async function trackScrollAnalytics(payload: {
    viewerKey: string;
    postSlug?: string;
    depth: number;
}) {
    return await apiClient.post<{ tracked: boolean }>(API_ROUTES.ANALYTICS_TRACK, {
        type: "scroll",
        viewerKey: payload.viewerKey,
        postSlug: payload.postSlug,
        depth: payload.depth,
    });
}
