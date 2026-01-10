import { VercelRequest, VercelResponse } from "@vercel/node";
import { fetchGitHubFile, getGitHubFileSha } from "../utils/github.js";
import { getUserEmailFromRequest } from "../utils/auth.js";
import { GITHUB, ENV_VARS } from "../../constants.js";

async function getAdminEmails(): Promise<string[]> {
    try {
        const emailConfigContent = await fetchGitHubFile("email.yaml");
        const adminMatch = emailConfigContent.match(/admin:\s*\n((?:\s+-\s+[^\n]+\n?)+)/);
        if (!adminMatch) return [];

        return adminMatch[1]
            .split("\n")
            .map((line) => {
                const itemMatch = line.match(/^\s+-\s+(.+)$/);
                return itemMatch ? itemMatch[1].trim() : null;
            })
            .filter((item): item is string => item !== null && item.length > 0);
    } catch (error) {
        console.error("Error fetching admin emails:", error);
        return [];
    }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== "DELETE") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const userEmail = getUserEmailFromRequest(req.headers);
    if (!userEmail) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const { filename } = req.query;
    if (!filename || typeof filename !== "string") {
        return res.status(400).json({ error: "Filename is required" });
    }

    try {
        const adminEmails = await getAdminEmails();
        if (!adminEmails.includes(userEmail)) {
            return res.status(403).json({ error: "Admin access required" });
        }

        const sha = await getGitHubFileSha(filename);
        const url = `${GITHUB.API_BASE_URL}/repos/${GITHUB.REPO_OWNER}/${GITHUB.POSTS_REPO_NAME}/contents/${filename}`;
        const GITHUB_TOKEN = ENV_VARS.BLOG_POSTS_GITHUB_TOKEN;

        const response = await fetch(url, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${GITHUB_TOKEN}`,
                Accept: "application/vnd.github.v3+json",
                "User-Agent": GITHUB.USER_AGENT,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                message: `Delete post: ${filename}`,
                sha,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                `GitHub API error: ${response.status} - ${errorData.message || response.statusText}`
            );
        }

        res.status(200).json({ success: true, message: "Post deleted" });
    } catch (error: any) {
        console.error("[API] Error deleting post:", error);
        if (error.message === "NOT_FOUND") {
            return res.status(404).json({ error: "Post not found" });
        }
        res.status(500).json({ error: "Failed to delete post", details: error.message });
    }
}
