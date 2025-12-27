import React from "react";
import { ABOUT } from "@/config/constants";
import cn from "classnames";
import styles from "./AboutSection.module.scss";

type TextType = "plain" | "highlight" | "code" | "underline";

const getTextClassName = (type: TextType): string => {
    switch (type) {
        case "highlight":
            return styles.gradient;
        case "code":
            return styles.highlight;
        case "underline":
            return styles.underline;
        default:
            return "";
    }
};

export const AboutSection: React.FC = () => {
    return (
        <section id="about" className={styles.aboutSection}>
            <div className={cn(styles.blurCircle, styles.purple)} />
            <div className={cn(styles.blurCircle, styles.green)} />

            <div className={styles.container}>
                <span className={styles.label}>{ABOUT.label}</span>
                <p className={styles.content}>
                    {ABOUT.content.map((item, index) => {
                        const className = getTextClassName(item.type);
                        return item.type === "plain" ? (
                            <React.Fragment key={index}>{item.text}</React.Fragment>
                        ) : (
                            <span key={index} className={className}>
                                {item.text}
                            </span>
                        );
                    })}
                </p>
            </div>
        </section>
    );
};
