import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { IoArrowBack } from "react-icons/io5";
import { BsShare } from "react-icons/bs";
import toast from "react-hot-toast";
import type { MarkdownFile } from "@/types";
import { extractTableOfContents } from "@/utils/markdown";
import { smoothScrollToElement } from "@/utils/scroll";
import { TableOfContents } from "./TableOfContents";
import { HeaderLink } from "./HeaderLink";
import styles from "./MarkdownViewer.module.scss";
import "@/styles/markdown.scss";
import "highlight.js/styles/github-dark.css";

interface MarkdownViewerProps {
    file: MarkdownFile;
}

export function MarkdownViewer({ file }: MarkdownViewerProps) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const tocItems = extractTableOfContents(file.content);

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

    const handleShare = async () => {
        const url = window.location.href.split("?")[0];
        try {
            await navigator.clipboard.writeText(url);
            toast.success("URL이 복사되었습니다");
        } catch (error) {
            toast.error("URL 복사에 실패했습니다");
        }
    };

    return (
        <div className={styles.viewerPage}>
            <div className={styles.container}>
                <div className={styles.toolbar}>
                    <button className={styles.backButton} onClick={() => navigate("/")}>
                        <IoArrowBack />
                        <span>Back to List</span>
                    </button>

                    <div className={styles.toolbarActions}>
                        <TableOfContents items={tocItems} />
                        <button className={styles.shareButton} onClick={handleShare}>
                            <BsShare />
                        </button>
                    </div>
                </div>

                <article className={styles.article}>
                    <div className="markdownContent">
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
            </div>
        </div>
    );
}
