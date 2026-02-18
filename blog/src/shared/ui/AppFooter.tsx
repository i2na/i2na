"use client";

import { FOOTER_LINKS } from "@/shared/config";
import styles from "@/shared/styles/AppFooter.module.scss";

export function AppFooter() {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                {FOOTER_LINKS.map((link) => (
                    <a
                        key={link.label}
                        href={link.href}
                        target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                        rel={link.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                    >
                        {link.label}
                    </a>
                ))}
            </div>
        </footer>
    );
}
