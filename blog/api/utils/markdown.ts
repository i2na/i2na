export interface PostMetadata {
    visibility: string;
    sharedWith: string[];
    createdAt?: string;
}

export interface ParsedPost {
    content: string;
    metadata: PostMetadata;
}

function formatDate(dateString: string): string {
    try {
        const date = new Date(dateString.replace(" ", "T"));
        if (isNaN(date.getTime())) return dateString;

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");

        return `${year}.${month}.${day} ${hours}:${minutes}`;
    } catch {
        return dateString;
    }
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

        // createdAt 파싱 및 포맷팅
        const createdAtMatch = frontmatterText.match(/createdAt:\s*(.+)/);
        if (createdAtMatch) {
            const rawDate = createdAtMatch[1].trim();
            metadata.createdAt = formatDate(rawDate);
        }

        // sharedWith 배열 파싱 (block-style sequence)
        const sharedWithBlockMatch = frontmatterText.match(
            /sharedWith:\s*\n((?:\s+-\s+[^\n]+\n?)+)/
        );
        if (sharedWithBlockMatch) {
            metadata.sharedWith = sharedWithBlockMatch[1]
                .split("\n")
                .map((line) => {
                    const itemMatch = line.match(/^\s+-\s+(.+)$/);
                    return itemMatch ? itemMatch[1].trim() : null;
                })
                .filter((item): item is string => item !== null && item.length > 0);
        } else {
            // flow-style sequence (기존 형식) 지원
            const sharedWithMatch = frontmatterText.match(/sharedWith:\s*\[([\s\S]*?)\]/);
            if (sharedWithMatch) {
                metadata.sharedWith = sharedWithMatch[1]
                    .split(",")
                    .map((email) => email.trim())
                    .filter((email) => email.length > 0);
            }
        }
    }

    return {
        content: content.trim(),
        metadata,
    };
}

export function generateFrontmatter(metadata: PostMetadata, content: string): string {
    const frontmatterLines: string[] = ["---"];

    frontmatterLines.push(`visibility: ${metadata.visibility}`);

    if (metadata.createdAt) {
        frontmatterLines.push(`createdAt: ${metadata.createdAt}`);
    }

    if (metadata.sharedWith && metadata.sharedWith.length > 0) {
        frontmatterLines.push("sharedWith:");
        metadata.sharedWith.forEach((email) => {
            frontmatterLines.push(`    - ${email}`);
        });
    }

    frontmatterLines.push("---");

    return `${frontmatterLines.join("\n")}\n${content}`;
}
