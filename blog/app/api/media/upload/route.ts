import { NextRequest } from "next/server";
import { getUserEmailFromRequest } from "@server/auth/session";
import { uploadMediaController } from "@server/controllers/media.controller";
import { createErrorResponse, createSuccessResponse } from "@server/utils/route";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const userEmail = getUserEmailFromRequest(request.headers);
        const data = await uploadMediaController(formData, userEmail);

        return createSuccessResponse(data, 201);
    } catch (error) {
        return createErrorResponse(error);
    }
}
