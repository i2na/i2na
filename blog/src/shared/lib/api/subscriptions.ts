import { API_ROUTES } from "@/shared/config";
import { createApiClient } from "./client";
import type { ISubscriptionResponse } from "@/shared/lib/types";

const apiClient = createApiClient();

export async function subscribeToPostAlerts(email: string): Promise<ISubscriptionResponse> {
    return await apiClient.post<ISubscriptionResponse>(API_ROUTES.SUBSCRIPTIONS, { email });
}
