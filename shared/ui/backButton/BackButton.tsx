import { Icons } from "@/shared/ui/icons";
import type { IBackButtonProps } from "./types";
import styles from "./BackButton.module.scss";

export function BackButton({ onClick, text = "back to page", className }: IBackButtonProps) {
    return (
        <button onClick={onClick} className={`${styles.backButton} ${className || ""}`}>
            <div className={styles.iconWrapper}>
                <Icons.ArrowRight />
            </div>
            <span className={styles.backText}>{text}</span>
        </button>
    );
}
