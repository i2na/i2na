import { NextResponse } from "next/server";
import { isHttpError } from "./http-error";

interface IErrorResponseBody {
    success: false;
    error: string;
}

export function createSuccessResponse<T>(data: T, status = 200): NextResponse {
    return NextResponse.json({ success: true, data }, { status });
}

export function createErrorResponse(error: unknown): NextResponse<IErrorResponseBody> {
    if (isHttpError(error)) {
        return NextResponse.json(
            {
                success: false,
                error: error.message,
            },
            { status: error.status }
        );
    }

    console.error("Unhandled route error", error);

    return NextResponse.json(
        {
            success: false,
            error: "Internal server error",
        },
        { status: 500 }
    );
}
