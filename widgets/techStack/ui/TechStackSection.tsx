import React from "react";
import { TECH_STACK } from "@/config/constants";
import styles from "./TechStackSection.module.scss";

export const TechStackSection: React.FC = () => {
    return (
        <section className={styles.techStackSection}>
            <div className={styles.label}>{TECH_STACK.label}</div>
            <div className={styles.scrollWrapper}>
                <div className={styles.scrollContainer}>
                    {TECH_STACK.contents.map((tech, i) => (
                        <span key={i} className={styles.content}>
                            {tech}
                        </span>
                    ))}
                </div>
                <div className={styles.scrollContainer} aria-hidden="true">
                    {TECH_STACK.contents.map((tech, i) => (
                        <span key={`clone-${i}`} className={styles.content}>
                            {tech}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    );
};
