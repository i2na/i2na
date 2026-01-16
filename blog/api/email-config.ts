import { VercelRequest, VercelResponse } from "@vercel/node";
import { fetchGitHubFile } from "./utils/github.js";

interface IEmailConfig {
    admin: string[];
    archive: string[];
}

function parseYamlArray(content: string, key: string): string[] {
    const regex = new RegExp(`${key}:\\s*\\n((?:\\s+-\\s+[^\\n]+\\n?)+)`, "m");
    const match = content.match(regex);
    if (!match) return [];

    return match[1]
        .split("\n")
        .map((line) => {
            const itemMatch = line.match(/^\s+-\s+(.+)$/);
            return itemMatch ? itemMatch[1].trim() : null;
        })
        .filter((item): item is string => item !== null && item.length > 0);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const emailConfigContent = await fetchGitHubFile("email.yaml");
        const config: IEmailConfig = {
            admin: parseYamlArray(emailConfigContent, "admin"),
            archive: parseYamlArray(emailConfigContent, "archive"),
        };

        res.status(200).json(config);
    } catch (error: any) {
        console.error("[API] Error fetching email config:", error);
        if (error.message === "NOT_FOUND") {
            return res.status(404).json({ error: "Email config not found" });
        }
        res.status(500).json({ error: "Failed to fetch email config", details: error.message });
    }
}
