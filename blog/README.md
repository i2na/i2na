# i2na-blog

> Markdown-based blog and document publishing project for the i2na monorepo.

## Overview

i2na-blog is a markdown-centric web application for publishing and sharing posts.
It provides public/private visibility controls, email-based access management, and rendering optimized for technical documents.

### Rationale

In AI-driven workflows, well-structured markdown is a high-value asset.
i2na-blog keeps markdown publishing and access control in the web application with a single operational flow.

## Tech Stack

| Layer    | Technologies                                                   |
| -------- | -------------------------------------------------------------- |
| Frontend | Next.js (App Router), React, TypeScript, SCSS Modules, Zustand |
| Backend  | Next.js API Routes, server utilities, GitHub API               |

## Features

- **Frontmatter-based access control** — Public/private visibility and email-based sharing
- **Git-backed versioning** — Change history and rollback via the posts repository
- **Automatic table of contents** — TOC and anchors from markdown headings
- **Admin tools** — Delete, visibility, and sharing management

## Run locally

```bash
yarn install
cp .env.example .env.local  # edit with your values
yarn dev
```

## Documentation

- [Frontend Guide](README.frontend.md)
- [Backend Guide](README.backend.md)
