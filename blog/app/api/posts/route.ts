import { NextRequest } from "next/server";
import { getUserEmailFromRequest } from "@server/auth/session";
import { createPostController, listPostsController } from "@server/controllers/posts.controller";
import { createErrorResponse, createSuccessResponse } from "@server/utils/route";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const search = searchParams.get("search") || undefined;
        const visibilityParam = searchParams.get("visibility");
        const sortParam = searchParams.get("sort");
        const userEmail = getUserEmailFromRequest(request.headers);

        const visibility =
            visibilityParam === "public" ||
            visibilityParam === "private" ||
            visibilityParam === "all"
                ? visibilityParam
                : undefined;

        const sort =
            sortParam === "latest" ||
            sortParam === "oldest" ||
            sortParam === "viewCount" ||
            sortParam === "name"
                ? sortParam
                : undefined;

        const data = await listPostsController({
            viewerEmail: userEmail,
            search,
            visibility,
            sort,
        });

        return createSuccessResponse(data);
    } catch (error) {
        return createErrorResponse(error);
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const viewerEmail = getUserEmailFromRequest(request.headers);
        const viewerName = request.headers.get("x-user-name") || undefined;

        const data = await createPostController(body, viewerEmail, viewerName);
        return createSuccessResponse(data, 201);
    } catch (error) {
        return createErrorResponse(error);
    }
}
