import type { MarkdownFile } from "@/types";

const markdownFiles: Record<string, string> = import.meta.glob("../../docs/**/*.md", {
    query: "?raw",
    import: "default",
    eager: true,
});

export function getMarkdownFiles(): MarkdownFile[] {
    const files: MarkdownFile[] = [];

    for (const [path, content] of Object.entries(markdownFiles)) {
        const filename = path.split("/").pop() || "";
        const relativePath = path.replace("../../", "");

        const lines = (content as string).split("\n");
        const title =
            lines.find((line) => line.startsWith("# "))?.replace("# ", "") ||
            filename.replace(".md", "");

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
