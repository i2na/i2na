"use client";

import { useEffect, useState } from "react";
import { fetchHomeAnalytics } from "@/shared/lib/api";
import type { IHomeAnalytics } from "@/shared/lib/types";

const EMPTY_ANALYTICS: IHomeAnalytics = {
    pixelWeather: [],
    deepDive: {
        threshold: 80,
        rate: 0,
    },
    comebackLoop: {
        windowDays: 7,
        returnRate: 0,
    },
    makerRhythm: [],
};

export function useHomeAnalytics() {
    const [analytics, setAnalytics] = useState<IHomeAnalytics>(EMPTY_ANALYTICS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const load = async () => {
            try {
                setLoading(true);
                const data = await fetchHomeAnalytics();

                if (!isMounted) {
                    return;
                }

                setAnalytics(data);
            } catch {
                if (isMounted) {
                    setAnalytics(EMPTY_ANALYTICS);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        load();

        return () => {
            isMounted = false;
        };
    }, []);

    return {
        analytics,
        loading,
    };
}
