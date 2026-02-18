import { NextRequest } from "next/server";
import { getUserEmailFromRequest } from "@server/auth/session";
import {
    deletePostController,
    getPostController,
    updatePostController,
} from "@server/controllers/posts.controller";
import { createErrorResponse, createSuccessResponse } from "@server/utils/route";

interface IRouteContext {
    params: Promise<{
        slug: string;
    }>;
}

export async function GET(request: NextRequest, context: IRouteContext) {
    try {
        const { slug } = await context.params;
        const userEmail = getUserEmailFromRequest(request.headers);
        const data = await getPostController(slug, userEmail);

        return createSuccessResponse(data);
    } catch (error) {
        return createErrorResponse(error);
    }
}

export async function PUT(request: NextRequest, context: IRouteContext) {
    try {
        const { slug } = await context.params;
        const userEmail = getUserEmailFromRequest(request.headers);
        const body = await request.json();

        const data = await updatePostController(slug, body, userEmail);
        return createSuccessResponse(data);
    } catch (error) {
        return createErrorResponse(error);
    }
}

export async function DELETE(request: NextRequest, context: IRouteContext) {
    try {
        const { slug } = await context.params;
        const userEmail = getUserEmailFromRequest(request.headers);
        const data = await deletePostController(slug, userEmail);

        return createSuccessResponse(data);
    } catch (error) {
        return createErrorResponse(error);
    }
}
