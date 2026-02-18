"use client";

import { useRouter } from "next/navigation";
import { IoArrowBack, IoSettingsOutline } from "react-icons/io5";
import { BsShare } from "react-icons/bs";
import toast from "react-hot-toast";
import { ROUTES } from "@/shared/config";
import type { ITocItem } from "@/shared/lib/types";
import { Button } from "@/shared/ui";
import { TableOfContents } from "./TableOfContents";
import styles from "../styles/Toolbar.module.scss";

interface ToolbarProps {
    canEdit: boolean;
    slug: string;
    tocItems?: ITocItem[];
}

export function Toolbar({ canEdit, slug, tocItems }: ToolbarProps) {
    const router = useRouter();

    const handleShare = async () => {
        const url = window.location.href.split("?")[0];
        try {
            await navigator.clipboard.writeText(url);
            toast.success("URL copied");
        } catch {
            toast.error("Failed to copy URL");
        }
    };

    return (
        <div className={styles.toolbar}>
            <Button
                variant="text"
                startIcon={<IoArrowBack />}
                onClick={() => router.push(ROUTES.HOME)}
            >
                Back to List
            </Button>

            <div className={styles.toolbarActions}>
                {tocItems && tocItems.length > 0 && <TableOfContents items={tocItems} />}
                {canEdit && (
                    <button
                        className={styles.settingsButton}
                        onClick={() => router.push(ROUTES.SETTINGS(slug))}
                        title="Edit"
                    >
                        <IoSettingsOutline />
                    </button>
                )}
                <button className={styles.shareButton} onClick={handleShare}>
                    <BsShare />
                </button>
            </div>
        </div>
    );
}
