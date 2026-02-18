import type { IParsedPost, IPostMetadata } from "./types";

function extractFrontmatterBlock(fileContent: string): {
    frontmatter: string | null;
    body: string;
} {
    const match = fileContent.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

    if (!match) {
        return {
            frontmatter: null,
            body: fileContent,
        };
    }

    return {
        frontmatter: match[1],
        body: match[2],
    };
}

function parseSharedWith(frontmatter: string): string[] {
    const blockMatch = frontmatter.match(/sharedWith:\s*\n((?:\s+-\s+[^\n]+\n?)*)/);
    if (blockMatch) {
        return blockMatch[1]
            .split("\n")
            .map((line) => line.match(/^\s+-\s+(.+)$/)?.[1]?.trim() || "")
            .filter((email) => email.length > 0);
    }

    const inlineMatch = frontmatter.match(/sharedWith:\s*\[([^\]]*)\]/);
    if (!inlineMatch) {
        return [];
    }

    return inlineMatch[1]
        .split(",")
        .map((email) => email.trim())
        .filter((email) => email.length > 0);
}

function parseValue(frontmatter: string, key: string): string | undefined {
    const match = frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
    if (!match) {
        return undefined;
    }

    return match[1].trim();
}

export function parseFrontmatter(fileContent: string): IParsedPost {
    const { frontmatter, body } = extractFrontmatterBlock(fileContent);

    const metadata: IPostMetadata = {
        title: "",
        description: "",
        visibility: "public",
        sharedWith: [],
    };

    if (frontmatter) {
        metadata.title = parseValue(frontmatter, "title") || "";
        metadata.description = parseValue(frontmatter, "description") || "";

        const visibility = parseValue(frontmatter, "visibility");
        if (visibility === "public" || visibility === "private") {
            metadata.visibility = visibility;
        }

        const createdAt = parseValue(frontmatter, "createdAt");
        const updatedAt = parseValue(frontmatter, "updatedAt");

        if (createdAt) {
            metadata.createdAt = createdAt;
        }

        if (updatedAt) {
            metadata.updatedAt = updatedAt;
        }

        metadata.sharedWith = parseSharedWith(frontmatter);
    }

    return {
        content: body.trim(),
        metadata,
    };
}

export function generateFrontmatter(metadata: IPostMetadata, content: string): string {
    const lines: string[] = ["---"];

    lines.push(`title: ${metadata.title}`);
    lines.push(`description: ${metadata.description}`);
    lines.push(`visibility: ${metadata.visibility}`);

    if (metadata.createdAt) {
        lines.push(`createdAt: ${metadata.createdAt}`);
    }

    if (metadata.updatedAt) {
        lines.push(`updatedAt: ${metadata.updatedAt}`);
    }

    if (metadata.sharedWith.length > 0) {
        lines.push("sharedWith:");
        metadata.sharedWith.forEach((email) => {
            lines.push(`  - ${email}`);
        });
    } else {
        lines.push("sharedWith: []");
    }

    lines.push("---");

    return `${lines.join("\n")}\n${content.trim()}\n`;
}
