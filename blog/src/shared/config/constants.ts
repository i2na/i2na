export const STORAGE_KEYS = {
    TOKEN: "i2na_blog_auth_token",
    EMAIL: "i2na_blog_user_email",
    NAME: "i2na_blog_user_name",
    EXPIRES: "i2na_blog_expires",
    AUTH_RETURN_PATH: "auth_return_path",
    AUTH_IN_PROGRESS: "auth_in_progress",
} as const;

export const OAUTH = {
    GOOGLE_AUTH_URL: "https://accounts.google.com/o/oauth2/v2/auth",
    SCOPE: "email profile",
} as const;

export const SCROLL_CONFIG = {
    duration: 1000,
    offset: -100,
    delay: 100,
} as const;
