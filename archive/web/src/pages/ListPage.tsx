import { MarkdownList } from "@/components/MarkdownList";
import { getMarkdownFiles } from "@/utils/markdown";

export function ListPage() {
    const files = getMarkdownFiles();

    return <MarkdownList files={files} />;
}

