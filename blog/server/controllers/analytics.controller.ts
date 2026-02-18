import { buildHomeAnalytics, trackAnalyticsEvent } from "@server/models/analytics.model";
import { HttpError } from "@server/utils/http-error";

interface ITrackAnalyticsPayload {
    type: "scroll";
    viewerKey?: string;
    postSlug?: string;
    depth?: number;
}

export async function getHomeAnalyticsController() {
    return await buildHomeAnalytics();
}

export async function trackAnalyticsController(payload: ITrackAnalyticsPayload) {
    if (payload.type !== "scroll") {
        throw new HttpError(400, "Unsupported analytics type");
    }

    if (!payload.viewerKey) {
        throw new HttpError(400, "viewerKey is required");
    }

    if (typeof payload.depth !== "number" || payload.depth < 0 || payload.depth > 100) {
        throw new HttpError(400, "depth must be a number between 0 and 100");
    }

    await trackAnalyticsEvent({
        type: "scroll",
        viewerKey: payload.viewerKey,
        postSlug: payload.postSlug,
        depth: payload.depth,
    });

    return {
        tracked: true,
    };
}
