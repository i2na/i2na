import { createHash, randomUUID } from "crypto";
import { promises as fs } from "fs";
import { dirname, extname, join, resolve } from "path";
import { promisify } from "util";
import { execFile } from "child_process";
import { MEDIA } from "@server/config/constants";
import {
    createMediaRecord,
    deleteMediaRecordsByUrls,
    getMediaLimitBytes,
    isSupportedMediaExtension,
    listAllMediaRecords,
} from "@server/models/media.model";
import { HttpError } from "@server/utils/http-error";

const execFileAsync = promisify(execFile);

interface ISavedMedia {
    fileName: string;
    extension: string;
    bytes: number;
    mimeType: string;
    publicUrl: string;
    absolutePath: string;
}

function getNormalizedExtension(fileName: string): string {
    return extname(fileName).replace(".", "").toLowerCase();
}

function sanitizeFileName(fileName: string): string {
    return fileName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9._-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

function buildFileName(originalName: string): string {
    const extension = getNormalizedExtension(originalName);
    const base = sanitizeFileName(originalName.replace(new RegExp(`\\.${extension}$`), ""));
    const unique = createHash("sha1")
        .update(`${Date.now()}-${randomUUID()}`)
        .digest("hex")
        .slice(0, 12);

    return `${base || "media"}-${unique}.${extension}`;
}

function assertMediaFileConstraint(fileName: string, fileSize: number): string {
    const extension = getNormalizedExtension(fileName);

    if (!isSupportedMediaExtension(extension)) {
        throw new HttpError(400, "Unsupported media extension");
    }

    const maxBytes = getMediaLimitBytes(extension);
    if (fileSize > maxBytes) {
        throw new HttpError(
            400,
            `File is too large for .${extension}. Allowed max: ${Math.floor(maxBytes / 1024 / 1024)}MB`
        );
    }

    return extension;
}

async function runLosslessMetadataStrip(filePath: string, extension: string): Promise<void> {
    try {
        if (["jpg", "jpeg", "png", "webp", "gif"].includes(extension)) {
            await execFileAsync("exiftool", ["-overwrite_original", "-all=", filePath]);
            return;
        }

        if (["mp4", "mov", "webm"].includes(extension)) {
            const tempPath = `${filePath}.tmp`;
            await execFileAsync("ffmpeg", [
                "-i",
                filePath,
                "-map_metadata",
                "-1",
                "-c",
                "copy",
                "-y",
                tempPath,
            ]);
            await fs.rename(tempPath, filePath);
        }
    } catch {
        return;
    }
}

export async function saveMediaFile(file: File): Promise<ISavedMedia> {
    const extension = assertMediaFileConstraint(file.name, file.size);
    const targetFileName = buildFileName(file.name);
    const absoluteRoot = resolve(MEDIA.ROOT_DIR);
    const absolutePath = join(absoluteRoot, targetFileName);

    await fs.mkdir(dirname(absolutePath), { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(absolutePath, buffer);

    await runLosslessMetadataStrip(absolutePath, extension);

    const publicUrl = `${MEDIA.PUBLIC_BASE_PATH}/${targetFileName}`;

    await createMediaRecord({
        fileName: targetFileName,
        publicUrl,
        mimeType: file.type,
        extension,
        bytes: file.size,
    });

    return {
        fileName: targetFileName,
        extension,
        bytes: file.size,
        mimeType: file.type,
        publicUrl,
        absolutePath,
    };
}

export function extractMediaUrlsFromMarkdown(content: string): string[] {
    const markdownMediaRegex = /!\[[^\]]*\]\(([^)]+)\)/g;
    const htmlMediaRegex = /<(?:img|video)[^>]+src=["']([^"']+)["'][^>]*>/gi;
    const urls = new Set<string>();

    for (const regex of [markdownMediaRegex, htmlMediaRegex]) {
        let match = regex.exec(content);
        while (match) {
            const url = match[1]?.trim();
            if (url && url.startsWith(MEDIA.PUBLIC_BASE_PATH)) {
                urls.add(url);
            }
            match = regex.exec(content);
        }
    }

    return Array.from(urls);
}

interface ICleanupOptions {
    excludeRecentMinutes?: number;
}

export async function removeUnusedMediaFiles(
    usedUrls: string[],
    options: ICleanupOptions = {}
): Promise<void> {
    const usedUrlSet = new Set(usedUrls);
    const mediaRecords = await listAllMediaRecords();
    const excludeRecentMinutes = options.excludeRecentMinutes || 0;
    const cutoffTimestamp =
        excludeRecentMinutes > 0 ? Date.now() - excludeRecentMinutes * 60 * 1000 : 0;

    const unused = mediaRecords.filter((record) => {
        if (usedUrlSet.has(record.publicUrl)) {
            return false;
        }

        if (cutoffTimestamp <= 0) {
            return true;
        }

        return new Date(record.uploadedAt).getTime() <= cutoffTimestamp;
    });
    if (unused.length === 0) {
        return;
    }

    await Promise.all(
        unused.map(async (record) => {
            const absolutePath = resolve(MEDIA.ROOT_DIR, record.fileName);
            try {
                await fs.unlink(absolutePath);
            } catch {
                return;
            }
        })
    );

    await deleteMediaRecordsByUrls(unused.map((item) => item.publicUrl));
}
