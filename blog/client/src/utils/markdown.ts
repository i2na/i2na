import type { MarkdownFile, TocItem } from "@/types";
import { fetchPosts, fetchPost } from "./api";

export async function getMarkdownFiles(userEmail: string | null = null): Promise<MarkdownFile[]> {
    try {
        const data = await fetchPosts({ userEmail });

        const files: MarkdownFile[] = (data.posts || []).map((post: any) => ({
            filename: post.filename,
            title: post.title,
            content: "",
            path: post.path,
            metadata: post.metadata,
        }));

        return files.sort((a, b) => {
            const dateA = a.metadata.createdAt;
            const dateB = b.metadata.createdAt;

            if (!dateA && !dateB) {
                return a.filename.localeCompare(b.filename);
            }
            if (!dateA) return 1;
            if (!dateB) return -1;

            return new Date(dateB).getTime() - new Date(dateA).getTime();
        });
    } catch (error) {
        console.error("Error fetching posts:", error);
        return [];
    }
}

export async function getMarkdownFileByFilename(
    filename: string,
    userEmail: string | null = null
): Promise<MarkdownFile | null> {
    try {
        return await fetchPost(filename, { userEmail });
    } catch (error) {
        console.error("Error fetching post:", error);
        return null;
    }
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
    
    const sharedWith = file.metadata.sharedWith;
    if (!Array.isArray(sharedWith)) {
        return false;
    }
    
    return sharedWith.includes(userEmail);
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
