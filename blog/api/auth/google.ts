import type { VercelRequest, VercelResponse } from "@vercel/node";
import { randomBytes } from "crypto";
import { ENV_VARS, URLS, DEFAULTS } from "../../constants.js";

const GOOGLE_CLIENT_ID = ENV_VARS.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = ENV_VARS.GOOGLE_CLIENT_SECRET;
const BASE_URL = ENV_VARS.BASE_URL;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { code, state } = req.query;

    if (!code) {
        return res.status(400).json({ error: "No code provided" });
    }

    const redirectPath = state ? decodeURIComponent(state as string) : "/";

    try {
        const tokenResponse = await fetch(URLS.GOOGLE_TOKEN_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                code: code as string,
                client_id: GOOGLE_CLIENT_ID!,
                client_secret: GOOGLE_CLIENT_SECRET!,
                redirect_uri: `${BASE_URL}/api/auth/google`,
                grant_type: "authorization_code",
            }),
        });

        const tokenData = await tokenResponse.json();

        if (!tokenData.access_token) {
            console.error("OAuth token exchange failed:", tokenData.error);
            return res.status(401).json({ error: "Authentication failed" });
        }

        const userResponse = await fetch(URLS.GOOGLE_USERINFO_ENDPOINT, {
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`,
            },
        });

        const user = await userResponse.json();
        const authToken = randomBytes(32).toString("hex");
        const expires = Date.now() + DEFAULTS.AUTH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

        const authData = {
            token: authToken,
            email: user.email,
            name: user.name || "",
            expires: expires,
        };

        const callbackUrl = `${BASE_URL}/auth/callback?data=${encodeURIComponent(
            JSON.stringify(authData)
        )}&redirect=${encodeURIComponent(redirectPath)}`;

        return res.redirect(callbackUrl);
    } catch (error) {
        console.error("Auth error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}
