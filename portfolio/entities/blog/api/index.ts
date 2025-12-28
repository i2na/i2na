import matter from "gray-matter";
import { Buffer } from "buffer";
import { generateSlugFromFileName } from "@/shared/lib/slug";
import { parseDate } from "@/shared/lib/date";
import { extractSummary } from "@/shared/lib/text";
import type { IPost, IPostMeta } from "../model/types";

if (typeof window !== "undefined" && !window.Buffer) {
    (window as any).Buffer = Buffer;
}

export async function getAllPosts(): Promise<IPost[]> {
    const modules = import.meta.glob("/config/blog/*.md", {
        query: "?raw",
        import: "default",
        eager: true,
    }) as Record<string, string>;

    const posts: IPost[] = [];

    for (const [path, content] of Object.entries(modules)) {
        if (path.includes("/temp/")) {
            continue;
        }

        const fileName = path.split("/").pop() || "";
        if (!fileName.endsWith(".md")) {
            continue;
        }

        const { data, content: markdownContent } = matter(content);

        const slug = await generateSlugFromFileName(fileName);
        const title = data.title || fileName.replace(/\.md$/, "").replace(/_/g, " ");
        const createdAt = data.createdAt ? parseDate(data.createdAt) : new Date().toISOString();
        const summary = data.summary || data.excerpt || extractSummary(markdownContent);

        posts.push({
            slug,
            title,
            createdAt,
            summary,
            content: markdownContent,
            fileName,
        });
    }

    posts.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return posts;
}

export async function getPostBySlug(slug: string): Promise<IPost | null> {
    const posts = await getAllPosts();
    return posts.find((post) => post.slug === slug) || null;
}

export async function getAllPostMetadata(): Promise<IPostMeta[]> {
    const posts = await getAllPosts();
    return posts.map(({ slug, title, createdAt, summary, fileName }) => ({
        slug,
        title,
        createdAt,
        summary,
        fileName,
    }));
}

export async function getAllPostSlugs(): Promise<string[]> {
    const posts = await getAllPosts();
    return posts.map((post) => post.slug);
}
