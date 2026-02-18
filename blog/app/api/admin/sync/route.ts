import { NextRequest } from "next/server";
import { getUserEmailFromRequest } from "@server/auth/session";
import { syncRepositoryAndDatabaseController } from "@server/controllers/admin-sync.controller";
import { createErrorResponse, createSuccessResponse } from "@server/utils/route";

export async function POST(request: NextRequest) {
    try {
        const userEmail = getUserEmailFromRequest(request.headers);
        const data = await syncRepositoryAndDatabaseController(userEmail);

        return createSuccessResponse(data);
    } catch (error) {
        return createErrorResponse(error);
    }
}
