import { VercelRequest, VercelResponse } from "@vercel/node";
import { fetchGitHubFile, updateGitHubFile } from "../utils/github.js";
import { parseFrontmatter, generateFrontmatter } from "../utils/markdown.js";
import { getUserEmailFromRequest } from "../utils/auth.js";
async function fetchEmailConfigInternal() {
    const emailConfigContent = await fetchGitHubFile("email.yaml");
    const adminMatch = emailConfigContent.match(/admin:\s*\n((?:\s+-\s+[^\n]+\n?)+)/);
    const archiveMatch = emailConfigContent.match(/archive:\s*\n((?:\s+-\s+[^\n]+\n?)+)/);

    const parseYamlArray = (match: RegExpMatchArray | null): string[] => {
        if (!match) return [];
        return match[1]
            .split("\n")
            .map((line) => {
                const itemMatch = line.match(/^\s+-\s+(.+)$/);
                return itemMatch ? itemMatch[1].trim() : null;
            })
            .filter((item): item is string => item !== null && item.length > 0);
    };

    return {
        admin: parseYamlArray(adminMatch),
        archive: parseYamlArray(archiveMatch),
    };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== "PUT") {
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

    if (!filename.endsWith(".md")) {
        return res.status(400).json({ error: "Invalid filename" });
    }

    try {
        const emailConfig = await fetchEmailConfigInternal();
        if (!emailConfig.admin.includes(userEmail)) {
            return res.status(403).json({ error: "Admin access required" });
        }

        const { sharedWith, visibility } = req.body;
        if (!Array.isArray(sharedWith)) {
            return res.status(400).json({ error: "sharedWith must be an array" });
        }

        const fileContent = await fetchGitHubFile(filename);
        const { content, metadata } = parseFrontmatter(fileContent);

        metadata.sharedWith = sharedWith;
        if (visibility && (visibility === "public" || visibility === "private")) {
            metadata.visibility = visibility;
        }
        const updatedContent = generateFrontmatter(metadata, content);

        await updateGitHubFile(
            filename,
            updatedContent,
            `Update shared emails for ${filename}`
        );

        res.status(200).json({
            filename,
            metadata,
        });
    } catch (error: any) {
        console.error("[API] Error updating shared emails:", error);
        if (error.message === "NOT_FOUND") {
            return res.status(404).json({ error: "Post not found" });
        }
        res.status(500).json({ error: "Failed to update shared emails", details: error.message });
    }
}
