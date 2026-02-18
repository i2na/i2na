import { NextRequest } from "next/server";
import { getUserEmailFromRequest } from "@server/auth/session";
import {
    createCommentController,
    listCommentsController,
} from "@server/controllers/comments.controller";
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
        const data = await listCommentsController(slug, userEmail);

        return createSuccessResponse(data);
    } catch (error) {
        return createErrorResponse(error);
    }
}

export async function POST(request: NextRequest, context: IRouteContext) {
    try {
        const { slug } = await context.params;
        const userEmail = getUserEmailFromRequest(request.headers);
        const body = await request.json();
        const data = await createCommentController(slug, body, userEmail);

        return createSuccessResponse(data, 201);
    } catch (error) {
        return createErrorResponse(error);
    }
}
