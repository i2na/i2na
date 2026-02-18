import { getAdminEmails, isAdmin } from "@server/auth/access";
import { listAllPosts } from "@server/models/posts.model";
import {
    extractMediaUrlsFromMarkdown,
    removeUnusedMediaFiles,
    saveMediaFile,
} from "@server/utils/media";
import { HttpError } from "@server/utils/http-error";

async function assertAdminAccess(userEmail: string | undefined): Promise<void> {
    if (!userEmail) {
        throw new HttpError(401, "Unauthorized");
    }

    const adminEmails = await getAdminEmails();
    const viewerIsAdmin = isAdmin(userEmail, adminEmails);

    if (!viewerIsAdmin) {
        throw new HttpError(403, "Admin access required");
    }
}

export async function uploadMediaController(formData: FormData, userEmail: string | undefined) {
    await assertAdminAccess(userEmail);

    const fileValue = formData.get("file");

    if (!(fileValue instanceof File)) {
        throw new HttpError(400, "file is required");
    }

    const savedMedia = await saveMediaFile(fileValue);
    const posts = await listAllPosts();
    const usedUrls = new Set<string>();

    posts.forEach((post) => {
        extractMediaUrlsFromMarkdown(post.content).forEach((url) => {
            usedUrls.add(url);
        });
    });

    await removeUnusedMediaFiles(Array.from(usedUrls), {
        excludeRecentMinutes: 60,
    });

    return {
        url: savedMedia.publicUrl,
        fileName: savedMedia.fileName,
        bytes: savedMedia.bytes,
        mimeType: savedMedia.mimeType,
    };
}
