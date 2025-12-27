import React from "react";
import { FOOTER } from "@/config/constants";
import { Icons } from "@/shared/ui/icons";
import styles from "./footer.module.scss";
import cn from "classnames";

interface FooterProps {
    theme?: "light" | "dark";
}

export const Footer: React.FC<FooterProps> = ({ theme = "dark" }) => {
    return (
        <footer id="contact" className={cn(styles.footer, styles[`theme-${theme}`])}>
            <div className={styles.container}>
                <div className={styles.left}>
                    <h2 className={styles.content}>
                        <span className={styles.part1}>{FOOTER.content.part1}</span>
                        <br />
                        <span className={styles.part2}>{FOOTER.content.part2}</span>
                    </h2>
                    <div className={styles.social}>
                        {FOOTER.social.map((item) => {
                            const Icon = Icons[item.icon as keyof typeof Icons];
                            if (!Icon) return null;
                            const className = item.icon.toLowerCase();

                            return (
                                <a
                                    key={item.icon}
                                    href={item.url}
                                    className={cn(styles[className])}
                                >
                                    <Icon />
                                </a>
                            );
                        })}
                    </div>
                </div>
                <div className={styles.right}>
                    <div className={styles.meta}>
                        <span className={styles.location}>{FOOTER.location}</span>
                        <span className={styles.name}>
                            {new Date().getFullYear()} © {FOOTER.name}
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
};
