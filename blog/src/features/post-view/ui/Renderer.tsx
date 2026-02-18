"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { SITE_CONFIG } from "@/shared/config";
import type { IPostDetail } from "@/shared/lib/types";
import { smoothScrollToElement } from "../lib/scroll";
import { HeaderLink } from "./HeaderLink";
import styles from "../styles/Renderer.module.scss";
import "highlight.js/styles/github.css";

interface RendererProps {
    file: IPostDetail;
}

export function Renderer({ file }: RendererProps) {
    const searchParams = useSearchParams();
    const headerIndexRef = useRef(0);
    headerIndexRef.current = 0;

    useEffect(() => {
        const sectionParam = searchParams.get("section");
        if (sectionParam) {
            smoothScrollToElement(`section-${sectionParam}`);
        }
    }, [searchParams]);

    return (
        <article className={styles.article}>
            <header className={styles.postHeader}>
                <p className={styles.identity}>{`${SITE_CONFIG.TITLE}/${file.filename}`}</p>
                <h1 className={styles.postTitle}>{file.title}</h1>
                <p className={styles.postDescription}>{file.description}</p>
                <div className={styles.metaRow}>
                    <span>{file.metadata.createdAt || "No publish date"}</span>
                </div>
            </header>

            <div className={`markdown-body ${styles.markdownContent}`}>
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw, rehypeHighlight]}
                    components={{
                        a: (props) => <a {...props} target="_blank" rel="noopener noreferrer" />,
                        img: (props) => <img {...props} />,
                        table: (props) => (
                            <div className="tableWrapper">
                                <table {...props} />
                            </div>
                        ),
                        h2: ({ children, ...props }) => {
                            const id = `section-${headerIndexRef.current}`;
                            headerIndexRef.current += 1;
                            return (
                                <h2 id={id} {...props}>
                                    {children}
                                    <HeaderLink sectionId={id} />
                                </h2>
                            );
                        },
                        h3: ({ children, ...props }) => {
                            const id = `section-${headerIndexRef.current}`;
                            headerIndexRef.current += 1;
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
