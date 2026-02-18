import { NextRequest } from "next/server";
import { getUserEmailFromRequest } from "@server/auth/session";
import {
    deleteCommentController,
    updateCommentController,
} from "@server/controllers/comments.controller";
import { createErrorResponse, createSuccessResponse } from "@server/utils/route";

interface IRouteContext {
    params: Promise<{
        slug: string;
        commentId: string;
    }>;
}

export async function PUT(request: NextRequest, context: IRouteContext) {
    try {
        const { slug, commentId } = await context.params;
        const userEmail = getUserEmailFromRequest(request.headers);
        const body = await request.json();
        const data = await updateCommentController(slug, commentId, body, userEmail);

        return createSuccessResponse(data);
    } catch (error) {
        return createErrorResponse(error);
    }
}

export async function DELETE(request: NextRequest, context: IRouteContext) {
    try {
        const { slug, commentId } = await context.params;
        const userEmail = getUserEmailFromRequest(request.headers);
        const data = await deleteCommentController(slug, commentId, userEmail);

        return createSuccessResponse(data);
    } catch (error) {
        return createErrorResponse(error);
    }
}
