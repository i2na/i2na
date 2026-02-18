import { NextRequest } from "next/server";
import { subscribeController } from "@server/controllers/subscriptions.controller";
import { createErrorResponse, createSuccessResponse } from "@server/utils/route";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const data = await subscribeController(body);

        return createSuccessResponse(data, 201);
    } catch (error) {
        return createErrorResponse(error);
    }
}
