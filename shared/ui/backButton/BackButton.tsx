import React from "react";
import { Icons } from "@/shared/ui/icons";
import styles from "./BackButton.module.scss";

interface BackButtonProps {
    onClick: () => void;
    text?: string;
    className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ 
    onClick, 
    text = "back to page",
    className 
}) => {
    return (
        <button 
            onClick={onClick} 
            className={`${styles.backButton} ${className || ""}`}
        >
            <div className={styles.iconWrapper}>
                <Icons.ArrowRight />
            </div>
            <span className={styles.backText}>{text}</span>
        </button>
    );
};

