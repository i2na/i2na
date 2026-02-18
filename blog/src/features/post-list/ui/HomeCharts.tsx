"use client";

import type { IHomeAnalytics } from "@/shared/lib/types";
import styles from "../styles/HomeCharts.module.scss";

interface HomeChartsProps {
    analytics: IHomeAnalytics;
}

function toPercent(value: number): string {
    return `${Math.round(value * 100)}%`;
}

export function HomeCharts({ analytics }: HomeChartsProps) {
    const maxWeather = analytics.pixelWeather.reduce(
        (maximum, item) => (item.count > maximum ? item.count : maximum),
        0
    );
    const maxRhythm = analytics.makerRhythm.reduce(
        (maximum, item) => (item.posts > maximum ? item.posts : maximum),
        0
    );

    return (
        <section className={styles.chartsSection}>
            <article className={styles.chartCard}>
                <h3 className={styles.chartTitle}>Pixel Weather</h3>
                <p className={styles.chartSubtitle}>Hourly visit heatmap</p>
                <div className={styles.pixelGrid}>
                    {analytics.pixelWeather.map((point, index) => {
                        const ratio = maxWeather > 0 ? point.count / maxWeather : 0;
                        return (
                            <span
                                key={`${point.weekday}-${point.hour}-${index}`}
                                className={styles.pixelCell}
                                style={{
                                    opacity: ratio > 0 ? 0.2 + ratio * 0.8 : 0.08,
                                }}
                                title={`${point.weekday}-${point.hour}:00 / ${point.count}`}
                            />
                        );
                    })}
                </div>
            </article>

            <article className={styles.chartCard}>
                <h3 className={styles.chartTitle}>Deep Dive</h3>
                <p className={styles.chartSubtitle}>
                    Scroll depth &gt;= {analytics.deepDive.threshold}%
                </p>
                <p className={styles.metric}>{toPercent(analytics.deepDive.rate)}</p>
            </article>

            <article className={styles.chartCard}>
                <h3 className={styles.chartTitle}>Comeback Loop</h3>
                <p className={styles.chartSubtitle}>
                    {analytics.comebackLoop.windowDays}-day return rate
                </p>
                <p className={styles.metric}>{toPercent(analytics.comebackLoop.returnRate)}</p>
            </article>

            <article className={styles.chartCard}>
                <h3 className={styles.chartTitle}>Maker Rhythm</h3>
                <p className={styles.chartSubtitle}>Weekly publishing rhythm</p>
                <div className={styles.rhythmBars}>
                    {analytics.makerRhythm.length === 0 && (
                        <span className={styles.empty}>No publish data yet</span>
                    )}
                    {analytics.makerRhythm.map((item) => {
                        const ratio = maxRhythm > 0 ? item.posts / maxRhythm : 0;
                        return (
                            <div key={item.week} className={styles.rhythmItem}>
                                <span className={styles.rhythmWeek}>{item.week}</span>
                                <span
                                    className={styles.rhythmBar}
                                    style={{ width: `${Math.max(12, ratio * 100)}%` }}
                                />
                                <span className={styles.rhythmCount}>{item.posts}</span>
                            </div>
                        );
                    })}
                </div>
            </article>
        </section>
    );
}
