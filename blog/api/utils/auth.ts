import { PostMetadata } from "./markdown";

export function hasAccessToPost(
    metadata: PostMetadata,
    userEmail: string | null | undefined,
    adminEmails: string[] = []
): boolean {
    if (metadata.visibility === "public") {
        return true;
    }

    if (!userEmail) {
        return false;
    }

    if (adminEmails.includes(userEmail)) {
        return true;
    }

    return metadata.sharedWith.includes(userEmail);
}

export function getUserEmailFromRequest(headers: any): string | undefined {
    return headers["x-user-email"] as string | undefined;
}
