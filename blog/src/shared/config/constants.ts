export const APP_CONFIG = {
    SITE_TITLE: "Yena",
} as const;

export const STORAGE_KEYS = {
    TOKEN: "i2na-blog_auth_token",
    EMAIL: "i2na-blog_user_email",
    NAME: "i2na-blog_user_name",
    EXPIRES: "i2na-blog_expires",
    AUTH_RETURN_PATH: "auth_return_path",
} as const;

export const SITE_CONFIG = {
    TITLE: APP_CONFIG.SITE_TITLE,
} as const;

export const SCROLL_CONFIG = {
    duration: 1000,
    offset: -100,
    delay: 100,
} as const;

export const AUTH_COPY = {
    GOOGLE_CTA: "Continue with Google",
} as const;

export const FOOTER_LINKS = [
    { href: "https://github.com/i2na", label: "https://github.com/i2na" },
    { href: "https://yena.io.kr", label: "https://yena.io.kr" },
    { href: "https://blog.yena.io.kr", label: "https://blog.yena.io.kr" },
    { href: "mailto:yena@moss.land", label: "yena@moss.land" },
    { href: "https://instagram.com/2ye._na", label: "https://instagram.com/2ye._na" },
] as const;
