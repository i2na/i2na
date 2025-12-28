import { useParams, useNavigate } from "react-router-dom";
import { MarkdownViewer } from "@/components/MarkdownViewer";
import { getMarkdownFileByFilename } from "@/utils/markdown";
import { useEffect } from "react";

export function ViewPage() {
    const { filename } = useParams<{ filename: string }>();
    const navigate = useNavigate();
    
    const file = filename ? getMarkdownFileByFilename(filename) : null;

    useEffect(() => {
        if (!file) {
            navigate("/");
        }
    }, [file, navigate]);

    if (!file) {
        return null;
    }

    return <MarkdownViewer file={file} />;
}

