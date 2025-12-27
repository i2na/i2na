import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { formatDate } from "@/shared/lib/date";
import type { BlogPost } from "@/entities/blog/model/types";
import { BackButton } from "@/shared/ui/backButton";
import { Footer } from "@/widgets/footer/ui/footer";
import styles from "./BlogPostContent.module.scss";
import "highlight.js/styles/github-dark.css";

interface BlogPostContentProps {
    post: BlogPost;
    onBack: () => void;
}

export const BlogPostContent: React.FC<BlogPostContentProps> = ({ post, onBack }) => {
    return (
        <div className={styles.blogPostContent}>
            <div className={styles.container}>
                <BackButton onClick={onBack} />

                <article className={styles.article}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>{post.title}</h1>
                        <div className={styles.meta}>
                            <span>
                                {formatDate(post.createdAt, "ko-KR", {
                                    year: "numeric",
                                    month: "2-digit",
                                    day: "2-digit",
                                })
                                    .replace(/\./g, ".")
                                    .replace(/\s/g, "")}
                            </span>
                        </div>
                    </div>

                    <div className={styles.markdownContent}>
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw, rehypeHighlight]}
                            components={{
                                a: ({ node, ...props }) => (
                                    <a {...props} target="_blank" rel="noopener noreferrer" />
                                ),
                                table: ({ node, ...props }) => (
                                    <div className={styles.tableWrapper}>
                                        <table {...props} />
                                    </div>
                                ),
                                img: ({ node, className, ...props }: any) => {
                                    // className이 있으면 그대로 사용, 없으면 기본 스타일 적용
                                    return (
                                        <img 
                                            {...props} 
                                            className={className || ''} 
                                        />
                                    );
                                },
                                video: ({ node, className, ...props }: any) => {
                                    // className이 있으면 그대로 사용, 없으면 기본 스타일 적용
                                    return (
                                        <video 
                                            {...props} 
                                            className={className || ''} 
                                        />
                                    );
                                },
                            }}
                        >
                            {post.content}
                        </ReactMarkdown>
                    </div>
                </article>
            </div>
            <Footer theme="light" />
        </div>
    );
};
