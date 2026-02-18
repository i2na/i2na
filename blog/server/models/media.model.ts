import { MONGODB } from "@server/config/constants";
import { getIsoTimestamp } from "@server/utils/date";
import { deleteMany, findMany, insertOne } from "./mongo-data-api";
import type { IMediaDocument } from "./types";

export const MEDIA_LIMITS = {
    jpg: 20 * 1024 * 1024,
    jpeg: 20 * 1024 * 1024,
    png: 30 * 1024 * 1024,
    webp: 20 * 1024 * 1024,
    gif: 50 * 1024 * 1024,
    mp4: 500 * 1024 * 1024,
    mov: 500 * 1024 * 1024,
    webm: 300 * 1024 * 1024,
} as const;

export type TSupportedMediaExtension = keyof typeof MEDIA_LIMITS;

export function isSupportedMediaExtension(
    extension: string
): extension is TSupportedMediaExtension {
    return extension in MEDIA_LIMITS;
}

export function getMediaLimitBytes(extension: TSupportedMediaExtension): number {
    return MEDIA_LIMITS[extension];
}

export async function createMediaRecord(input: {
    fileName: string;
    publicUrl: string;
    mimeType: string;
    extension: string;
    bytes: number;
}): Promise<void> {
    await insertOne<IMediaDocument>(MONGODB.COLLECTIONS.MEDIA, {
        fileName: input.fileName,
        publicUrl: input.publicUrl,
        mimeType: input.mimeType,
        extension: input.extension,
        bytes: input.bytes,
        uploadedAt: getIsoTimestamp(),
    });
}

export async function listAllMediaRecords(): Promise<IMediaDocument[]> {
    return await findMany<IMediaDocument>(MONGODB.COLLECTIONS.MEDIA, {
        sort: { uploadedAt: -1 },
    });
}

export async function deleteMediaRecordsByUrls(publicUrls: string[]): Promise<void> {
    if (publicUrls.length === 0) {
        return;
    }

    await deleteMany(MONGODB.COLLECTIONS.MEDIA, {
        publicUrl: {
            $in: publicUrls,
        },
    });
}
