import { NextRequest } from "next/server";
import { trackAnalyticsController } from "@server/controllers/analytics.controller";
import { createErrorResponse, createSuccessResponse } from "@server/utils/route";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const data = await trackAnalyticsController(body);

        return createSuccessResponse(data, 201);
    } catch (error) {
        return createErrorResponse(error);
    }
}
