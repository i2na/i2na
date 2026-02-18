import { deleteGitHubFile, upsertGitHubFile } from "@server/github/posts";
import { generateFrontmatter } from "@server/markdown/parse";
import type { IPostDocument } from "@server/models/types";
import { isGitHubBackupEnabled } from "@server/config/env";

function toFrontmatterPost(post: IPostDocument): string {
    return generateFrontmatter(
        {
            title: post.title,
            description: post.description,
            visibility: post.visibility,
            sharedWith: post.sharedWith,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
        },
        post.content
    );
}

export async function backupPostContent(post: IPostDocument): Promise<void> {
    if (!isGitHubBackupEnabled()) {
        return;
    }

    const markdown = toFrontmatterPost(post);
    await upsertGitHubFile(post.filename, markdown, `Backup post content: ${post.filename}`);
}

export async function removePostBackup(filename: string): Promise<void> {
    if (!isGitHubBackupEnabled()) {
        return;
    }

    try {
        await deleteGitHubFile(filename);
    } catch (error: unknown) {
        if (error instanceof Error && error.message.includes("404")) {
            return;
        }

        throw error;
    }
}
