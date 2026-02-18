import { APP_CONFIG, ENV_VARS } from "./constants";

const REQUIRED_ENV_KEYS = [
    "PUBLIC_BASE_URL",
    "GOOGLE_CLIENT_ID",
    "MONGO_URI",
    "GOOGLE_CLIENT_SECRET",
] as const;

export function validateEnv(): void {
    const missingSecretKeys = REQUIRED_ENV_KEYS.filter((key) => !process.env[key]);

    if (missingSecretKeys.length > 0) {
        throw new Error(`Missing secret environment variables: ${missingSecretKeys.join(", ")}`);
    }
}

export function isGitHubBackupEnabled(): boolean {
    return Boolean(process.env.POSTS_GITHUB_TOKEN && APP_CONFIG.GITHUB.POSTS_REPO_NAME);
}

export { ENV_VARS };
