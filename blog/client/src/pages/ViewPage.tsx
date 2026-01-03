import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { MarkdownViewer } from "@/components/MarkdownViewer";
import { TableOfContents } from "@/components/TableOfContents";
import { getMarkdownFileByFilename, extractTableOfContents } from "@/utils/markdown";
import { isAuthenticated, getUserInfo, startGoogleLogin } from "@/utils/auth";
import { IoArrowBack } from "react-icons/io5";
import { BsShare } from "react-icons/bs";
import type { MarkdownFile } from "@/types";
import styles from "./ViewPage.module.scss";

export function ViewPage() {
    const { filename } = useParams<{ filename: string }>();
    const navigate = useNavigate();

    const [file, setFile] = useState<MarkdownFile | null>(null);
    const [loading, setLoading] = useState(true);
    const hasShownError = useRef(false);

    const authenticated = isAuthenticated();
    const user = getUserInfo();

    useEffect(() => {
        const fetchPost = async () => {
            if (!filename) {
                navigate("/");
                return;
            }

            setLoading(true);
            const userEmail = user?.email || null;
            const fullFilename = filename.endsWith(".md") ? filename : `${filename}.md`;

            const post = await getMarkdownFileByFilename(fullFilename, userEmail);

            if (!post) {
                if (!authenticated) {
                    const currentPath = `/${filename}`;
                    startGoogleLogin(currentPath);
                    return;
                } else {
                    if (!hasShownError.current) {
                        hasShownError.current = true;
                        toast.error("이 글을 볼 권한이 없습니다.");
                        navigate("/");
                    }
                    return;
                }
            }

            setFile(post);
            setLoading(false);
        };

        fetchPost();
    }, [filename, authenticated, user?.email, navigate]);

    const handleShare = async () => {
        const url = window.location.href.split("?")[0];
        try {
            await navigator.clipboard.writeText(url);
            toast.success("URL이 복사되었습니다");
        } catch (error) {
            toast.error("URL 복사에 실패했습니다");
        }
    };

    const tocItems = file ? extractTableOfContents(file.content) : [];

    const formatDate = (dateString?: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
        }).format(date);
    };

    return (
        <div className={styles.viewPage}>
            <div className={styles.container}>
                <div className={styles.toolbar}>
                    <button className={styles.backButton} onClick={() => navigate("/")}>
                        <IoArrowBack />
                        <span>Back to List</span>
                    </button>

                    <div className={styles.toolbarActions}>
                        {!loading && <TableOfContents items={tocItems} />}
                        <button className={styles.shareButton} onClick={handleShare}>
                            <BsShare />
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className={styles.loading}>
                        <span></span>
                    </div>
                ) : file ? (
                    <div className={styles.content}>
                        <MarkdownViewer file={file} />
                    </div>
                ) : null}
            </div>
        </div>
    );
}
