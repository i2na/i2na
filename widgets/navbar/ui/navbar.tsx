import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Icons } from "@/shared/ui/icons";
import { NAV } from "@/config/constants";
import styles from "./navbar.module.scss";
import cn from "classnames";

interface NavbarProps {
    onLogoClick?: () => void;
    isLight?: boolean;
    showNavLinks?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onLogoClick, isLight, showNavLinks = true }) => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.hash) {
            const id = location.hash.replace("#", "");
            setTimeout(() => {
                const element = document.getElementById(id);
                if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                }
            }, 100);
        }
    }, [location]);

    const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        const currentPath = location.pathname;

        if (currentPath !== "/") {
            navigate(`/#${id}`);
        } else {
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: "smooth" });
            }
        }
    };

    const handleLogoClick = () => {
        if (onLogoClick) {
            onLogoClick();
        }
        const currentPath = location.pathname;
        if (currentPath !== "/") {
            navigate("/#hero");
        } else {
            const element = document.getElementById("hero");
            if (element) {
                element.scrollIntoView({ behavior: "smooth" });
            }
        }
    };

    return (
        <nav className={cn(styles.navbar, isLight ? styles.light : styles.dark)}>
            <div className={styles.logo} onClick={handleLogoClick}>
                <span>
                    <span className={styles.part1}>{NAV.logo.part1}</span>
                    <span className={styles.part2}>{NAV.logo.part2}</span>
                </span>
            </div>

            {showNavLinks && (
                <div className={cn(styles.sections, isLight ? styles.light : styles.dark)}>
                    {NAV.sections.map((item) => (
                        <a
                            key={item.href}
                            href={item.href}
                            onClick={(e) => handleScroll(e, item.href.replace("#", ""))}
                        >
                            {item.label}
                        </a>
                    ))}
                </div>
            )}

            <div>
                <a
                    href={NAV.github.url}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(styles.github, isLight ? styles.light : styles.dark)}
                >
                    <span className={styles.label}>{NAV.github.label}</span>
                    <Icons.Github />
                </a>
            </div>
        </nav>
    );
};
