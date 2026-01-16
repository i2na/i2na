import { useSearchParams } from "react-router-dom";
import { useEffect, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import type { MarkdownFile } from "@/types";
import { smoothScrollToElement } from "@/utils/scroll";
import { HeaderLink } from "./HeaderLink";
import styles from "./MarkdownViewer.module.scss";
import "@/styles/markdown.scss";
import "highlight.js/styles/github-dark.css";

interface MarkdownViewerProps {
    file: MarkdownFile;
}

export function MarkdownViewer({ file }: MarkdownViewerProps) {
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
        <article className={styles.article}>
            <div className="markdownContent">
                {file.metadata.createdAt && (
                    <span
                        style={{
                            fontSize: "0.875rem",
                            color: "#6e7781",
                            display: "block",
                            marginBottom: "0.5rem",
                        }}
                    >
                        {file.metadata.createdAt}
                    </span>
                )}
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
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
                                    <HeaderLink sectionId={id} />
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
                                    <HeaderLink sectionId={id} />
                                </h3>
                            );
                        },
                    }}
                >
                    {file.content}
                </ReactMarkdown>
            </div>
        </article>
    );
}
