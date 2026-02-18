# Backend Guide

## Tech Stack

Next.js API Routes, Node.js, TypeScript, MongoDB (MONGO_URI), Yarn

## Project Structure

```
i2na-blog/
├── app/
│   └── api/               # Route Handlers → /api/...
│       └── [endpoint]/
│           └── route.ts   # GET, POST, etc.
├── server/
│   ├── controllers/       # HTTP use-case orchestration
│   ├── models/            # MongoDB persistence layer
│   ├── utils/             # Shared backend utilities
│   └── [domain]/          # auth, config, github, markdown, ...
```

## Design Pattern

API Routes handle HTTP; server holds reusable logic.

### Layers

`app/api/` (route) → `server/controllers` → `server/models`

- **app/api/** — HTTP boundary. `route.ts` per path; export GET, POST, etc.
- **server/controllers/** — Input normalization, authorization, and response data shaping.
- **server/models/** — MongoDB read/write operations.
- **server/utils/** — Cross-cutting helpers (errors, media lifecycle, backup delivery).

### Import Rules

- `app/api/` may import from `server/`
- `src/` must not import from `server/`
- `app/api/` must not import from `src/`

## Architecture

### app/api/[endpoint]/

One `route.ts` per path. Export method handlers; dynamic `[param]` in the second argument. Use `NextResponse.json` and status for errors.

### server/[domain]/

One folder per domain (auth, config, github, markdown). Structure varies; `app/api/` calls into these.

## Built-in Setup

### Path Alias

Use `@server/` for server imports:

```typescript
import { fetchGitHubFile } from "@server/github/client";
import { parseFrontmatter } from "@server/markdown/parse";
```

## Google OAuth Setup

Create an OAuth client in [Google Cloud Console](https://console.cloud.google.com/):

1. **APIs & Services → Credentials → Create Credentials → OAuth client ID**
2. **Application type**: Web application
3. **Authorized JavaScript origins**:
    - `http://localhost:3000` (local)
    - `https://your-blog-url.com` (production)
4. **Authorized redirect URIs**:
    - `http://localhost:3000/api/auth/google` (local)
    - `https://your-blog-url.com/api/auth/google` (production)

Set non-secret runtime values in `server/config/constants.ts` and `src/shared/config/constants.ts`.

Use `.env.local` only for runtime environment values and secrets:

- `PUBLIC_BASE_URL` (`http://localhost:3000` for local, `https://blog.yena.io.kr` for production)
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `MONGO_URI`
- `POSTS_GITHUB_TOKEN` (for GitHub backup)
- `RESEND_API_KEY` (optional, for publication email delivery)
