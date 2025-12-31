import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { MarkdownViewer } from "@/components/MarkdownViewer";
import { getMarkdownFileByFilename, canAccessPost } from "@/utils/markdown";
import { isAuthenticated, getUserInfo, startGoogleLogin } from "@/utils/auth";

export function ViewPage() {
    const { filename } = useParams<{ filename: string }>();
    const navigate = useNavigate();

    const [isChecking, setIsChecking] = useState(true);
    const hasShownError = useRef(false);

    const file = filename ? getMarkdownFileByFilename(filename) : null;
    const authenticated = isAuthenticated();
    const user = getUserInfo();

    useEffect(() => {
        if (!file) {
            navigate("/");
            return;
        }

        const hasAccess = canAccessPost(file, user?.email || null);

        if (!hasAccess) {
            if (!authenticated) {
                const currentPath = `/view/${filename}`;
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

        setIsChecking(false);
    }, [file, filename, authenticated, user?.email, navigate]);

    if (isChecking || !file) {
        return null;
    }

    return <MarkdownViewer file={file} />;
}
