export interface PostMetadata {
    visibility: string;
    sharedWith: string[];
    createdAt?: string;
}

export interface ParsedPost {
    content: string;
    metadata: PostMetadata;
}

export function parseFrontmatter(fileContent: string): ParsedPost {
    const frontmatterMatch = fileContent.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

    let metadata: PostMetadata = {
        visibility: "public",
        sharedWith: [],
    };
    let content = fileContent;

    if (frontmatterMatch) {
        const frontmatterText = frontmatterMatch[1];
        content = frontmatterMatch[2];

        // visibility 파싱
        const visibilityMatch = frontmatterText.match(/visibility:\s*(\w+)/);
        if (visibilityMatch) {
            metadata.visibility = visibilityMatch[1];
        }

        // createdAt 파싱
        const createdAtMatch = frontmatterText.match(/createdAt:\s*(.+)/);
        if (createdAtMatch) {
            metadata.createdAt = createdAtMatch[1].trim();
        }

        // sharedWith 배열 파싱
        const sharedWithMatch = frontmatterText.match(/sharedWith:\s*\[([\s\S]*?)\]/);
        if (sharedWithMatch) {
            metadata.sharedWith = sharedWithMatch[1]
                .split(",")
                .map((email) => email.trim())
                .filter((email) => email.length > 0);
        }
    }

    return {
        content: content.trim(),
        metadata,
    };
}
