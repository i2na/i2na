export const APP_CONFIG = {
    GITHUB: {
        REPO_OWNER: "i2na",
        POSTS_REPO_NAME: "i2na-posts",
    },
    MONGODB: {
        DATABASE: "i2na-blog",
        COLLECTIONS: {
            POSTS: "posts",
            COMMENTS: "comments",
            SUBSCRIPTIONS: "subscriptions",
            ANALYTICS_EVENTS: "analytics_events",
            MEDIA: "media",
            ALERT_LOGS: "alert_logs",
        },
    },
    MEDIA: {
        ROOT_DIR: "public/uploads",
        PUBLIC_BASE_PATH: "/uploads",
    },
    ALERTS: {
        FROM_EMAIL: "blog@yena.io.kr",
    },
    ACCESS: {
        ADMIN_EMAILS: [] as string[],
        ARCHIVE_EMAILS: [] as string[],
    },
} as const;

export const GITHUB = {
    REPO_OWNER: APP_CONFIG.GITHUB.REPO_OWNER,
    POSTS_REPO_NAME: APP_CONFIG.GITHUB.POSTS_REPO_NAME,
    API_BASE_URL: "https://api.github.com",
    USER_AGENT: "i2na-blog-api",
} as const;

export const MONGODB = {
    URI: process.env.MONGO_URI,
    DATABASE: APP_CONFIG.MONGODB.DATABASE,
    COLLECTIONS: APP_CONFIG.MONGODB.COLLECTIONS,
} as const;

export const MEDIA = {
    ROOT_DIR: APP_CONFIG.MEDIA.ROOT_DIR,
    PUBLIC_BASE_PATH: APP_CONFIG.MEDIA.PUBLIC_BASE_PATH,
} as const;

export const ALERTS = {
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    FROM_EMAIL: APP_CONFIG.ALERTS.FROM_EMAIL,
} as const;

export const ENV_VARS = {
    PUBLIC_BASE_URL: process.env.PUBLIC_BASE_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    POSTS_GITHUB_TOKEN: process.env.POSTS_GITHUB_TOKEN,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
} as const;

export const URLS = {
    GOOGLE_AUTH_ENDPOINT: "https://accounts.google.com/o/oauth2/v2/auth",
    GOOGLE_TOKEN_ENDPOINT: "https://oauth2.googleapis.com/token",
    GOOGLE_USERINFO_ENDPOINT: "https://www.googleapis.com/oauth2/v2/userinfo",
    RESEND_EMAIL_ENDPOINT: "https://api.resend.com/emails",
} as const;

export const DEFAULTS = {
    AUTH_TOKEN_EXPIRY_DAYS: 30,
} as const;
