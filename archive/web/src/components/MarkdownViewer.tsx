import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { IoArrowBack } from "react-icons/io5";
import { BsShare } from "react-icons/bs";
import toast from "react-hot-toast";
import type { MarkdownFile } from "@/types";
import styles from "./MarkdownViewer.module.scss";
import "@/styles/markdown.scss";
import "highlight.js/styles/github-dark.css";

interface MarkdownViewerProps {
    file: MarkdownFile;
}

export function MarkdownViewer({ file }: MarkdownViewerProps) {
    const navigate = useNavigate();

    const handleShare = async () => {
        const url = window.location.href;
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
                        <span>목록으로</span>
                    </button>

                    <button className={styles.shareButton} onClick={handleShare}>
                        <BsShare />
                    </button>
                </div>

                <article className={styles.article}>
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
