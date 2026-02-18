import { randomBytes } from "crypto";
import { ENV_VARS, URLS, DEFAULTS } from "../config/constants";
import type { IGoogleTokenResponse, IGoogleUserInfo, IAuthData } from "./types";

const GOOGLE_CLIENT_ID = ENV_VARS.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = ENV_VARS.GOOGLE_CLIENT_SECRET;

export async function exchangeCodeForToken(
    code: string,
    redirectUri: string
): Promise<IGoogleTokenResponse> {
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.includes("your-google-client-id")) {
        throw new Error("Set Google Client ID in server/config/constants.ts");
    }

    const tokenResponse = await fetch(URLS.GOOGLE_TOKEN_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            code,
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET || "",
            redirect_uri: redirectUri,
            grant_type: "authorization_code",
        }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
        throw new Error("Failed to exchange code for token");
    }

    return tokenData;
}

export async function fetchGoogleUserInfo(accessToken: string): Promise<IGoogleUserInfo> {
    const userResponse = await fetch(URLS.GOOGLE_USERINFO_ENDPOINT, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!userResponse.ok) {
        throw new Error("Failed to fetch user info");
    }

    return await userResponse.json();
}

export function generateAuthData(userInfo: IGoogleUserInfo): IAuthData {
    const authToken = randomBytes(32).toString("hex");
    const expires = Date.now() + DEFAULTS.AUTH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

    return {
        token: authToken,
        email: userInfo.email.trim().toLowerCase(),
        name: userInfo.name || "",
        expires,
    };
}
