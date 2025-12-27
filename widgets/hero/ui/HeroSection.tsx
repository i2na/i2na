import React from "react";
import { Icons } from "@/shared/ui/icons";
import { HERO } from "@/config/constants";
import { SplineScene } from "./SplineScene";
import styles from "./HeroSection.module.scss";

export const HeroSection: React.FC = () => {
    return (
        <section id="hero" className={styles.heroSection}>
            <SplineScene />
            <div className={styles.content}>
                <h1 className={styles.content1}>{HERO.content1}</h1>
                <div className={styles.content2}>
                    <span className={styles.part1}>{HERO.content2.part1}</span>
                    <span className={styles.dot}></span>
                    <span className={styles.part2}>{HERO.content2.part2}</span>
                </div>
            </div>

            <div
                className={styles.scrollIndicator}
                onClick={() =>
                    document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })
                }
            >
                <Icons.ArrowRight />
            </div>
        </section>
    );
};
