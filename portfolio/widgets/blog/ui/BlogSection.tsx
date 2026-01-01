import { BLOG } from "@/config/constants";
import styles from "./BlogSection.module.scss";

export function BlogSection() {
    return (
        <section id="blog" className={styles.blogSection}>
            <div className={styles.sectionHeader}>
                <div className={styles.label}>{BLOG.label}</div>
                <h2 className={styles.content}>{BLOG.content}</h2>
            </div>
            <div className={styles.blogLink}>
                <a
                    href="https://blog.yena.io.kr/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.link}
                >
                    Visit Blog →
                </a>
            </div>
        </section>
    );
}
