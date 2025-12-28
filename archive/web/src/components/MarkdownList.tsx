import { useNavigate } from "react-router-dom";
import type { MarkdownFile } from "@/types";
import styles from "./MarkdownList.module.scss";

interface MarkdownListProps {
    files: MarkdownFile[];
}

export function MarkdownList({ files }: MarkdownListProps) {
    const navigate = useNavigate();

    const handleClick = (filename: string) => {
        navigate(`/view/${filename}`);
    };

    return (
        <div className={styles.listPage}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <h1 className={styles.title}>Archive</h1>
                </header>

                <div className={styles.list}>
                    {files.map((file) => (
                        <div
                            key={file.filename}
                            className={styles.item}
                            onClick={() => handleClick(file.filename)}
                        >
                            <div className={styles.itemTitle}>{file.title}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
