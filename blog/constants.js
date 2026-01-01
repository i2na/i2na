export const GITHUB = {
    REPO_OWNER: "i2na",
    POSTS_REPO_NAME: "i2na-blog-md",
    BLOG_REPO_NAME: "i2na",
    POSTS_REPO_URL: "https://github.com/i2na/i2na-blog-md.git",
    BLOG_REPO_URL: "https://github.com/i2na/i2na.git",
    API_BASE_URL: "https://api.github.com",
    USER_AGENT: "blog-api",
};

export const ENV_VARS = {
    BLOG_POSTS_GITHUB_TOKEN: process.env.BLOG_POSTS_GITHUB_TOKEN,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    BASE_URL: process.env.BASE_URL,
    VITE_GOOGLE_CLIENT_ID: process.env.VITE_GOOGLE_CLIENT_ID,
    VITE_BASE_URL: process.env.VITE_BASE_URL,
};

export const URLS = {
    DEPLOYMENT_BASE: "https://blog.yena.io.kr",
    GOOGLE_TOKEN_ENDPOINT: "https://oauth2.googleapis.com/token",
    GOOGLE_USERINFO_ENDPOINT: "https://www.googleapis.com/oauth2/v2/userinfo",
};

export const DEFAULTS = {
    DEFAULT_AUTHOR_EMAIL: "yena@moss.land",
    DEFAULT_VISIBILITY: "private",
    AUTH_TOKEN_EXPIRY_DAYS: 30,
};

export const GIT = {
    COMMIT_MESSAGE_PREFIX: "post: add",
    DEFAULT_BRANCH: "main",
};

export const FILE = {
    MD_EXTENSION: ".md",
    CONFIG_FILE_NAME: "~/.blog-config.json",
};

export const FRONTMATTER = {
    VISIBILITY_PUBLIC: "public",
    VISIBILITY_PRIVATE: "private",
};
