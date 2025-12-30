import type { MarkdownFile, TocItem } from "@/types";

const markdownFiles: Record<string, string> = import.meta.glob("../../../docs/**/*.md", {
    query: "?raw",
    import: "default",
    eager: true,
});

export function getMarkdownFiles(): MarkdownFile[] {
    const files: MarkdownFile[] = [];

    for (const [path, content] of Object.entries(markdownFiles)) {
        const filename = path.split("/").pop() || "";
        const relativePath = path.replace("../../../", "");

        const title = filename.replace(".md", "");

        files.push({
            filename,
            title,
            content: content as string,
            path: relativePath,
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
