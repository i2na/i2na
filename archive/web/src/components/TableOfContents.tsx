import { useState, useRef, useEffect } from "react";
import { GoListUnordered } from "react-icons/go";
import type { TocItem } from "@/types";
import styles from "./TableOfContents.module.scss";

interface TableOfContentsProps {
    items: TocItem[];
}

export function TableOfContents({ items }: TableOfContentsProps) {
    const [isOpen, setIsOpen] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                tooltipRef.current &&
                buttonRef.current &&
                !tooltipRef.current.contains(event.target as Node) &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const handleItemClick = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const yOffset = -100;
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: "smooth" });
        }
        setIsOpen(false);
    };

    if (items.length === 0) {
        return null;
    }

    return (
        <div className={styles.tocContainer}>
            <button
                ref={buttonRef}
                className={styles.tocButton}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Contents"
            >
                <GoListUnordered />
            </button>

            {isOpen && (
                <div ref={tooltipRef} className={styles.tocTooltip}>
                    <div className={styles.tocHeader}>Contents</div>
                    <ul className={styles.tocList}>
                        {items.map((item, index) => (
                            <li
                                key={`${item.id}-${index}`}
                                className={`${styles.tocItem} ${styles[`level${item.level}`]}`}
                            >
                                <button
                                    onClick={() => handleItemClick(item.id)}
                                    className={styles.tocLink}
                                >
                                    {item.text}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
