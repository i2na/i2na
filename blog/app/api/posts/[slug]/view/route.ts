import { NextRequest } from "next/server";
import { incrementPostViewController } from "@server/controllers/posts.controller";
import { createErrorResponse, createSuccessResponse } from "@server/utils/route";

interface IRouteContext {
    params: Promise<{
        slug: string;
    }>;
}

export async function POST(request: NextRequest, context: IRouteContext) {
    try {
        const { slug } = await context.params;
        const body = await request.json().catch(() => ({}));
        const viewerKey = typeof body.viewerKey === "string" ? body.viewerKey : undefined;

        const data = await incrementPostViewController(slug, viewerKey);
        return createSuccessResponse(data);
    } catch (error) {
        return createErrorResponse(error);
    }
}
