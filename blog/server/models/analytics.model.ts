import { MONGODB } from "@server/config/constants";
import { getIsoTimestamp, getStartDate, toDateKey } from "@server/utils/date";
import { findMany, insertOne } from "./mongo-data-api";
import type { IAnalyticsEventDocument, IHomeAnalytics, IPostDocument } from "./types";

interface ITrackAnalyticsInput {
    type: "visit" | "scroll" | "publish";
    viewerKey?: string;
    postSlug?: string;
    depth?: number;
}

function toWeekKey(dateValue: string): string {
    const date = new Date(dateValue);
    const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNumber = target.getUTCDay() || 7;
    target.setUTCDate(target.getUTCDate() + 4 - dayNumber);
    const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
    const weekNumber = Math.ceil(((target.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);

    return `${target.getUTCFullYear()}-W${String(weekNumber).padStart(2, "0")}`;
}

function createPixelWeather(events: IAnalyticsEventDocument[]): IHomeAnalytics["pixelWeather"] {
    const heatmapMap = new Map<string, number>();

    for (let weekday = 0; weekday < 7; weekday += 1) {
        for (let hour = 0; hour < 24; hour += 1) {
            heatmapMap.set(`${weekday}-${hour}`, 0);
        }
    }

    events.forEach((event) => {
        const date = new Date(event.createdAt);
        const key = `${date.getDay()}-${date.getHours()}`;
        heatmapMap.set(key, (heatmapMap.get(key) || 0) + 1);
    });

    const items: IHomeAnalytics["pixelWeather"] = [];

    for (let weekday = 0; weekday < 7; weekday += 1) {
        for (let hour = 0; hour < 24; hour += 1) {
            items.push({
                weekday,
                hour,
                count: heatmapMap.get(`${weekday}-${hour}`) || 0,
            });
        }
    }

    return items;
}

function createDeepDive(events: IAnalyticsEventDocument[]): IHomeAnalytics["deepDive"] {
    const visitorSet = new Set<string>();
    const deepDiveSet = new Set<string>();

    events.forEach((event) => {
        if (!event.viewerKey) {
            return;
        }

        if (event.type === "visit") {
            visitorSet.add(event.viewerKey);
            return;
        }

        if (event.type === "scroll" && (event.depth || 0) >= 80) {
            deepDiveSet.add(event.viewerKey);
        }
    });

    const rate = visitorSet.size > 0 ? deepDiveSet.size / visitorSet.size : 0;

    return {
        threshold: 80,
        rate,
    };
}

function createComebackLoop(events: IAnalyticsEventDocument[]): IHomeAnalytics["comebackLoop"] {
    const viewerVisitDays = new Map<string, Set<string>>();

    events.forEach((event) => {
        if (event.type !== "visit" || !event.viewerKey) {
            return;
        }

        const dayKey = toDateKey(event.createdAt);
        const currentDays = viewerVisitDays.get(event.viewerKey) || new Set<string>();
        currentDays.add(dayKey);
        viewerVisitDays.set(event.viewerKey, currentDays);
    });

    if (viewerVisitDays.size === 0) {
        return {
            windowDays: 7,
            returnRate: 0,
        };
    }

    let returningUsers = 0;
    viewerVisitDays.forEach((days) => {
        if (days.size >= 2) {
            returningUsers += 1;
        }
    });

    return {
        windowDays: 7,
        returnRate: returningUsers / viewerVisitDays.size,
    };
}

function createMakerRhythm(posts: IPostDocument[]): IHomeAnalytics["makerRhythm"] {
    const weeklyPublishCount = new Map<string, number>();

    posts.forEach((post) => {
        if (!post.publishedAt) {
            return;
        }

        const weekKey = toWeekKey(post.publishedAt);
        weeklyPublishCount.set(weekKey, (weeklyPublishCount.get(weekKey) || 0) + 1);
    });

    return Array.from(weeklyPublishCount.entries())
        .sort(([left], [right]) => left.localeCompare(right))
        .slice(-8)
        .map(([week, postsCount]) => ({
            week,
            posts: postsCount,
        }));
}

export async function trackAnalyticsEvent(input: ITrackAnalyticsInput): Promise<void> {
    await insertOne<IAnalyticsEventDocument>(MONGODB.COLLECTIONS.ANALYTICS_EVENTS, {
        type: input.type,
        ...(input.viewerKey ? { viewerKey: input.viewerKey } : {}),
        ...(input.postSlug ? { postSlug: input.postSlug } : {}),
        ...(typeof input.depth === "number" ? { depth: input.depth } : {}),
        createdAt: getIsoTimestamp(),
    });
}

export async function buildHomeAnalytics(): Promise<IHomeAnalytics> {
    const sevenDaysAgo = getStartDate(7).toISOString();
    const thirtyDaysAgo = getStartDate(30).toISOString();

    const [recentVisitEvents, monthlyEvents, publishedPosts] = await Promise.all([
        findMany<IAnalyticsEventDocument>(MONGODB.COLLECTIONS.ANALYTICS_EVENTS, {
            filter: {
                type: "visit",
                createdAt: { $gte: sevenDaysAgo },
            },
        }),
        findMany<IAnalyticsEventDocument>(MONGODB.COLLECTIONS.ANALYTICS_EVENTS, {
            filter: {
                createdAt: { $gte: thirtyDaysAgo },
            },
        }),
        findMany<IPostDocument>(MONGODB.COLLECTIONS.POSTS, {
            filter: {
                visibility: "public",
            },
            sort: { publishedAt: 1 },
        }),
    ]);

    return {
        pixelWeather: createPixelWeather(recentVisitEvents),
        deepDive: createDeepDive(monthlyEvents),
        comebackLoop: createComebackLoop(recentVisitEvents),
        makerRhythm: createMakerRhythm(publishedPosts),
    };
}
