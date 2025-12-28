import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import type { MarkdownFile } from "@/types";
import styles from "./MarkdownViewer.module.scss";
import "@/styles/markdown.scss";
import "highlight.js/styles/github-dark.css";

interface MarkdownViewerProps {
    file: MarkdownFile;
}

export function MarkdownViewer({ file }: MarkdownViewerProps) {
    const navigate = useNavigate();

    return (
        <div className={styles.viewerPage}>
            <div className={styles.container}>
                <button className={styles.backButton} onClick={() => navigate("/")}>
                    ← 목록으로
                </button>

                <article className={styles.article}>
                    <header className={styles.header}>
                        <h1 className={styles.title}>{file.title}</h1>
                        <p className={styles.path}>{file.path}</p>
                    </header>

                    <div className="markdownContent">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw, rehypeHighlight]}
                            components={{
                                a: ({ node, ...props }) => (
                                    <a {...props} target="_blank" rel="noopener noreferrer" />
                                ),
                                table: ({ node, ...props }) => (
                                    <div className="tableWrapper">
                                        <table {...props} />
                                    </div>
                                ),
                            }}
                        >
                            {file.content}
                        </ReactMarkdown>
                    </div>
                </article>
            </div>
        </div>
    );
}

