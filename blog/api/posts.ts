import { VercelRequest, VercelResponse } from "@vercel/node";
import { fetchGitHubFileList, fetchGitHubFile } from "./utils/github.js";
import { parseFrontmatter, PostMetadata } from "./utils/markdown.js";
import { getUserEmailFromRequest, hasAccessToPost } from "./utils/auth.js";

interface PostListItem {
    filename: string;
    title: string;
    path: string;
    metadata: PostMetadata;
}

async function fetchPostMetadata(file: any): Promise<PostListItem | null> {
    try {
        const contentResponse = await fetch(file.download_url);
        const content = await contentResponse.text();
        const { metadata } = parseFrontmatter(content);

        return {
            filename: file.name,
            title: file.name.replace(".md", ""),
            path: file.name,
            metadata,
        };
    } catch (error) {
        console.error(`Error fetching file ${file.name}:`, error);
        return null;
    }
}

async function handleSinglePost(
    filename: string,
    userEmail: string | undefined,
    res: VercelResponse
) {
    if (!filename.endsWith(".md")) {
        return res.status(400).json({ error: "Invalid filename" });
    }

    try {
        const fileContent = await fetchGitHubFile(filename);
        const { content, metadata } = parseFrontmatter(fileContent);

        if (!hasAccessToPost(metadata, userEmail)) {
            return res.status(403).json({ error: "Access denied" });
        }

        res.status(200).json({
            filename,
            title: filename.replace(".md", ""),
            content,
            path: filename,
            metadata,
        });
    } catch (error: any) {
        console.error("[API] Error:", error);
        if (error.message === "NOT_FOUND") {
            return res.status(404).json({ error: "Post not found" });
        }
        res.status(500).json({ error: "Failed to fetch post", details: error.message });
    }
}

async function handlePostList(userEmail: string | undefined, res: VercelResponse) {
    try {
        const mdFiles = await fetchGitHubFileList();
        const posts = await Promise.all(mdFiles.map(fetchPostMetadata));
        const validPosts = posts.filter((post): post is PostListItem => post !== null);
        const visiblePosts = validPosts.filter((post) => hasAccessToPost(post.metadata, userEmail));

        res.status(200).json({ posts: visiblePosts });
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ error: "Failed to fetch posts" });
    }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const userEmail = getUserEmailFromRequest(req.headers);
    const urlPath = req.url || "";
    const { file } = req.query;

    if (file && typeof file === "string") {
        return handleSinglePost(file, userEmail, res);
    }

    const pathMatch = urlPath.match(/^\/api\/posts\/(.+)/);
    if (pathMatch) {
        const filename = decodeURIComponent(pathMatch[1].split("?")[0]);
        return handleSinglePost(filename, userEmail, res);
    }

    return handlePostList(userEmail, res);
}
