export const ROUTES = {
    HOME: "/",
    NEW_POST: "/new",
    POST: (slug: string) => `/${slug}`,
    SETTINGS: (slug: string) => `/${slug}/settings`,
    AUTH_CALLBACK: "/auth/callback",
} as const;

export const API_ROUTES = {
    POSTS: "/api/posts",
    POST: (slug: string) => `/api/posts/${slug}`,
    POST_VIEW: (slug: string) => `/api/posts/${slug}/view`,
    POST_COMMENTS: (slug: string) => `/api/posts/${slug}/comments`,
    POST_COMMENT: (slug: string, commentId: string) => `/api/posts/${slug}/comments/${commentId}`,
    SUBSCRIPTIONS: "/api/subscriptions",
    ANALYTICS_HOME: "/api/analytics/home",
    ANALYTICS_TRACK: "/api/analytics/track",
    MEDIA_UPLOAD: "/api/media/upload",
    ADMIN_EMAILS: "/api/admin/emails",
    ADMIN_SYNC: "/api/admin/sync",
    ADMIN_VISIBILITY: "/api/admin/posts/visibility",
    ADMIN_SHARE: "/api/admin/posts/share",
    ADMIN_DELETE: "/api/admin/posts/delete",
    AUTH_GOOGLE: "/api/auth/google",
} as const;
