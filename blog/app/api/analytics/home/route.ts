import { getHomeAnalyticsController } from "@server/controllers/analytics.controller";
import { createErrorResponse, createSuccessResponse } from "@server/utils/route";

export async function GET() {
    try {
        const data = await getHomeAnalyticsController();
        return createSuccessResponse(data);
    } catch (error) {
        return createErrorResponse(error);
    }
}
