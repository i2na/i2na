import { getAdminEmails, isAdmin } from "@server/auth/access";
import { isGitHubBackupEnabled } from "@server/config/env";
import { fetchGitHubFile, fetchGitHubFileList } from "@server/github/client";
import { parseFrontmatter } from "@server/markdown/parse";
import {
    listAllPosts,
    normalizePostSlug,
    upsertPostFromRepository,
} from "@server/models/posts.model";
import { HttpError } from "@server/utils/http-error";
import { backupPostContent } from "@server/utils/post-backup";
import type { TPostVisibility } from "@server/models/types";

interface IRepoPostItem {
    slug: string;
    filename: string;
    title: string;
    description: string;
    content: string;
    visibility: TPostVisibility;
    sharedWith: string[];
    createdAt?: string;
    updatedAt?: string;
}

interface ISyncResult {
    repositoryScanned: number;
    repositoryToDatabaseCreated: number;
    repositoryToDatabaseUpdated: number;
    databaseToRepositoryUpserted: number;
    skipped: number;
}

function normalizeVisibility(value: unknown): TPostVisibility {
    return value === "private" ? "private" : "public";
}

function buildRepositoryPostItem(filename: string, rawMarkdown: string): IRepoPostItem | null {
    const slug = normalizePostSlug(filename.replace(/\.md$/i, ""));
    if (!slug) {
        return null;
    }

    const { content, metadata } = parseFrontmatter(rawMarkdown);

    const title = metadata.title?.trim() || slug;
    const description = metadata.description?.trim() || `Synced from ${filename}`;

    return {
        slug,
        filename: `${slug}.md`,
        title,
        description,
        content,
        visibility: normalizeVisibility(metadata.visibility),
        sharedWith: Array.isArray(metadata.sharedWith) ? metadata.sharedWith : [],
        createdAt: metadata.createdAt,
        updatedAt: metadata.updatedAt,
    };
}

async function ensureAdminAccess(userEmail: string | undefined): Promise<void> {
    if (!userEmail) {
        throw new HttpError(401, "Unauthorized");
    }

    const adminEmails = await getAdminEmails();
    if (!isAdmin(userEmail, adminEmails)) {
        throw new HttpError(403, "Admin access required");
    }
}

export async function syncRepositoryAndDatabaseController(
    userEmail: string | undefined
): Promise<ISyncResult> {
    await ensureAdminAccess(userEmail);

    const result: ISyncResult = {
        repositoryScanned: 0,
        repositoryToDatabaseCreated: 0,
        repositoryToDatabaseUpdated: 0,
        databaseToRepositoryUpserted: 0,
        skipped: 0,
    };

    const repositoryFiles = await fetchGitHubFileList();
    result.repositoryScanned = repositoryFiles.length;

    for (const file of repositoryFiles) {
        try {
            const rawMarkdown = await fetchGitHubFile(file.name);
            const repositoryPost = buildRepositoryPostItem(file.name, rawMarkdown);

            if (!repositoryPost) {
                result.skipped += 1;
                continue;
            }

            const sync = await upsertPostFromRepository(repositoryPost);

            if (sync.created) {
                result.repositoryToDatabaseCreated += 1;
            } else {
                result.repositoryToDatabaseUpdated += 1;
            }
        } catch {
            result.skipped += 1;
        }
    }

    if (isGitHubBackupEnabled()) {
        const databasePosts = await listAllPosts();
        for (const post of databasePosts) {
            try {
                await backupPostContent(post);
                result.databaseToRepositoryUpserted += 1;
            } catch {
                result.skipped += 1;
            }
        }
    }

    return result;
}
