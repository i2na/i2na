import { useSearchParams } from "react-router-dom";
import { useEffect, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import type { MarkdownFile } from "@/types";
import { smoothScrollToElement } from "@/utils/scroll";
import styles from "./MarkdownViewer2026.module.scss";
import "highlight.js/styles/github-dark.css";

interface MarkdownViewer2026Props {
    file: MarkdownFile;
}

export function MarkdownViewer2026({ file }: MarkdownViewer2026Props) {
    const [searchParams] = useSearchParams();

    const headerIndexMap = useMemo(() => {
        const map = new Map<string, number>();
        const headingRegex = /^(#{2,3})\s+(.+)$/gm;
        let index = 0;
        let match;

        while ((match = headingRegex.exec(file.content)) !== null) {
            const text = match[2].trim();
            map.set(text, index);
            index++;
        }

        return map;
    }, [file.content]);

    useEffect(() => {
        const sectionParam = searchParams.get("section");
        if (sectionParam) {
            smoothScrollToElement(`section-${sectionParam}`);
        }
    }, [searchParams]);

    return (
        <div className={styles.viewerPage2026}>
            <div className={styles.container2026}>
                <article className={styles.article2026}>
                    <div className="markdownContent2026">
                        {file.metadata.createdAt && (
                            <>
                                <sub>{file.metadata.createdAt}</sub>
                                {"\n\n"}
                            </>
                        )}
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
                                h2: ({ node, children, ...props }) => {
                                    const text = String(children);
                                    const index = headerIndexMap.get(text);
                                    const id = `section-${index}`;
                                    return (
                                        <h2 id={id} {...props}>
                                            {children}
                                        </h2>
                                    );
                                },
                                h3: ({ node, children, ...props }) => {
                                    const text = String(children);
                                    const index = headerIndexMap.get(text);
                                    const id = `section-${index}`;
                                    return (
                                        <h3 id={id} {...props}>
                                            {children}
                                        </h3>
                                    );
                                },
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

