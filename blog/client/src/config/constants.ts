// localStorage 키
export const STORAGE_KEYS = {
    TOKEN: "blog_auth_token",
    EMAIL: "blog_user_email",
    NAME: "blog_user_name",
    EXPIRES: "blog_expires",
    AUTH_RETURN_PATH: "auth_return_path",
    AUTH_IN_PROGRESS: "auth_in_progress",
} as const;

// 환경 변수
export const ENV = {
    GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    BASE_URL: import.meta.env.VITE_BASE_URL,
} as const;

// OAuth 관련
export const OAUTH = {
    GOOGLE_AUTH_URL: "https://accounts.google.com/o/oauth2/v2/auth",
    SCOPE: "email profile",
} as const;

// 스크롤 설정
export const SCROLL_CONFIG = {
    duration: 1000,
    offset: -100,
    delay: 100,
} as const;
