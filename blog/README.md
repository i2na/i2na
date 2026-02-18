# i2na-blog

> Markdown-based blog and document publishing project for the i2na monorepo.

## Overview

i2na-blog is a markdown-centric web application for publishing and sharing posts.
It provides public/private visibility controls, email-based access management, and rendering optimized for technical documents.

### Rationale

In AI-driven workflows, well-structured markdown is a high-value asset.
i2na-blog keeps markdown publishing and access control in the web application with a single operational flow.

## Tech Stack

| Layer    | Technologies                                                                              |
| -------- | ----------------------------------------------------------------------------------------- |
| Frontend | Next.js (App Router), React, TypeScript, SCSS Modules, Zustand                            |
| Backend  | Next.js API Routes, layered server controllers/models, MongoDB (MONGO_URI), GitHub backup |

## Features

- **MongoDB runtime data layer** — Post, comment, analytics, subscription, and media persistence
- **GitHub real-time backup** — Post content backup commits on create/update/delete
- **Google OAuth only access** — Single login path with `Continue with Google`
- **Discovery and engagement** — Search, visibility filter, sorting, view count, comments, replies
- **Media workflow** — Drag-and-drop upload with extension/size policy and local storage lifecycle

## Run locally

```bash
yarn install
cp .env.example .env.local  # secrets only
# non-secret runtime values: server/config/constants.ts and src/shared/config/constants.ts
yarn dev
```

## Documentation

- [Frontend Guide](README.frontend.md)
- [Backend Guide](README.backend.md)
- [On-Premise Mac mini Deployment](docs/on-premise-mac-mini.md)
