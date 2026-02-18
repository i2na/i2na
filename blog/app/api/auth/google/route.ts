import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken, fetchGoogleUserInfo, generateAuthData } from "@server/auth/google";
import { ENV_VARS, URLS } from "@server/config/constants";

function getPublicBaseUrl(request: NextRequest): string {
    const configured = (ENV_VARS.PUBLIC_BASE_URL || "").trim();
    if (configured.length > 0) {
        return configured.replace(/\/$/, "");
    }

    return new URL(request.url).origin;
}

function createGoogleAuthorizeUrl(input: {
    clientId: string;
    redirectUri: string;
    state: string;
}): string {
    const authorizeUrl = new URL(URLS.GOOGLE_AUTH_ENDPOINT);

    authorizeUrl.searchParams.set("client_id", input.clientId);
    authorizeUrl.searchParams.set("redirect_uri", input.redirectUri);
    authorizeUrl.searchParams.set("response_type", "code");
    authorizeUrl.searchParams.set("scope", "email profile");
    authorizeUrl.searchParams.set("state", input.state);

    return authorizeUrl.toString();
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    const redirectPath = state ? decodeURIComponent(state) : "/";
    const baseUrl = getPublicBaseUrl(request);
    const redirectUri = `${baseUrl}/api/auth/google`;

    const clientId = ENV_VARS.GOOGLE_CLIENT_ID;
    if (!clientId) {
        return NextResponse.json({ error: "Missing GOOGLE_CLIENT_ID" }, { status: 500 });
    }

    if (!code) {
        const authorizeUrl = createGoogleAuthorizeUrl({
            clientId,
            redirectUri,
            state: redirectPath,
        });

        return NextResponse.redirect(authorizeUrl);
    }

    try {
        const tokenData = await exchangeCodeForToken(code, redirectUri);
        const user = await fetchGoogleUserInfo(tokenData.access_token);
        const authData = generateAuthData(user);

        const callbackUrl = `${baseUrl}/auth/callback?data=${encodeURIComponent(
            JSON.stringify(authData)
        )}&redirect=${encodeURIComponent(redirectPath)}`;

        return NextResponse.redirect(callbackUrl);
    } catch (error) {
        console.error("Auth error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
