import matter from "gray-matter";
import type { MarkdownFile, TocItem, PostMetadata } from "@/types";

const markdownFiles: Record<string, string> = import.meta.glob("../../../post/**/*.md", {
    query: "?raw",
    import: "default",
    eager: true,
});

export function getMarkdownFiles(): MarkdownFile[] {
    const files: MarkdownFile[] = [];

    for (const [path, content] of Object.entries(markdownFiles)) {
        const filename = path.split("/").pop() || "";
        const relativePath = path.replace("../../../", "");

        const { data, content: markdownContent } = matter(content as string);

        const metadata: PostMetadata = {
            visibility: data.visibility || "public",
            sharedWith: data.sharedWith || [],
            createdAt: data.createdAt,
        };

        const title = filename.replace(".md", "");

        files.push({
            filename,
            title,
            content: markdownContent,
            path: relativePath,
            metadata,
        });
    }

    return files.sort((a, b) => a.filename.localeCompare(b.filename));
}

export function getMarkdownFileByFilename(filename: string): MarkdownFile | null {
    const files = getMarkdownFiles();
    return files.find((f) => f.filename === filename) || null;
}

export function extractTableOfContents(markdown: string): TocItem[] {
    const headingRegex = /^(#{2,3})\s+(.+)$/gm;
    const toc: TocItem[] = [];
    let match;
    let index = 0;

    while ((match = headingRegex.exec(markdown)) !== null) {
        const level = match[1].length;
        const text = match[2].trim();
        const id = `section-${index}`;

        toc.push({
            level,
            text,
            id,
        });

        index++;
    }

    return toc;
}

export function canAccessPost(file: MarkdownFile, userEmail: string | null): boolean {
    if (file.metadata.visibility === "public") return true;
    if (!userEmail) return false;
    return file.metadata.sharedWith.includes(userEmail);
}

export function filterPostsByVisibility(
    files: MarkdownFile[],
    userEmail: string | null
): MarkdownFile[] {
    return files.filter((file) => {
        if (file.metadata.visibility === "public") return true;
        if (file.metadata.visibility === "private" && userEmail) {
            return file.metadata.sharedWith.includes(userEmail);
        }
        return false;
    });
}
