# Yena.Lee Blog

> Blog project - Work in Progress

Cursor로 작성한 마크다운 문서를 CLI로 빠르게 저장하고 웹에서 보는 개인 블로그 시스템

**Production**: https://blog.yena.io.kr

## Architecture

이 블로그는 **코드는 Public, 컨텐츠는 Private** 방식으로 운영됩니다:

-   **Public Repo (i2na/i2na)**: 블로그 애플리케이션 코드
-   **Private Repo (i2na/i2na-blog-md)**: 마크다운 포스트 파일
-   **API**: GitHub API를 통해 private repo의 포스트를 동적으로 fetch
-   **Access Control**: Frontmatter 기반 권한 관리 (public/private + shared users)

## Structure

```
blog/
├── cli/                   # CLI 명령어
│   ├── command/
│   │   ├── call.js        # 프롬프트 복사
│   │   ├── add.js         # 문서 추가 (Private repo에 push)
│   │   └── open.js        # 프로젝트 열기
│   ├── prompt/            # 프롬프트 템플릿
│   └── config.js          # 설정 관리
├── client/                # React + Vite (Frontend)
├── api/                   # Vercel Serverless Functions (Backend)
│   ├── posts.ts           # 포스트 API (목록 + 개별)
│   ├── auth/              # OAuth 인증
│   └── utils/             # 유틸리티 (GitHub API, 권한 체크 등)
├── constants.js           # 전역 상수 관리
├── package.json           # Root dependencies
└── setup.js               # 초기 설정

Separate Private Repository (i2na/i2na-blog-md):
posts/                     # GitHub Private Repository
├── doc1.md                # 마크다운 파일들
├── doc2.md
└── ...
```

## Setup

### 1. Private Repository Setup

먼저 포스트를 저장할 private repository를 생성합니다:

```bash
# 1. GitHub에서 Private Repo 생성
# Repository: i2na/i2na-blog-md
# Visibility: Private

# 2. Personal Access Token 생성
# GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
# Note: "Blog Posts API Access"
# Scopes: repo (Full control of private repositories)
# 토큰을 복사해서 안전하게 보관

# 3. 로컬에 클론
git clone https://github.com/i2na/i2na-blog-md.git
```

### 2. Installation

#### 공통

```bash
# 프로젝트 클론
git clone https://github.com/i2na/i2na.git
cd i2na/blog

# 의존성 설치
yarn install
```

#### CLI Setup

```bash
cd blog

# 초기 설정 (Blog 경로, Posts Repo 경로, Git 저장소, 배포 URL)
node setup.js

# CLI 전역 등록
yarn link

# 설치 확인
blog call
```

설정 파일이 `~/.blog-config.json`에 생성됩니다:

```json
{
    "blogPath": "/Users/leeyena/dev/i2na/blog",
    "postsRepoPath": "/Users/leeyena/dev/i2na-blog-md",
    "blogGitRemote": "https://github.com/i2na/i2na.git",
    "postsGitRemote": "https://github.com/i2na/i2na-blog-md.git",
    "baseUrl": "https://blog.yena.io.kr"
}
```

#### Web Development Setup

```bash
cd blog

# Vercel 로그인 (최초 1회)
yarn vercel login

# 프로젝트 연결 (최초 1회)
yarn vercel link --yes --project <project_name>

# 개발 서버 실행
yarn start
# → Frontend: http://localhost:5173
# → Backend API: http://localhost:3000

# 빌드
yarn build

# 프리뷰
yarn preview
```

**About Vercel Dev**

이 프로젝트는 Vercel 플랫폼에 배포되며, `/api` 폴더의 파일들이 자동으로 서버리스 함수로 변환됩니다. 로컬 개발 환경에서도 프로덕션과 동일한 서버리스 아키텍처를 재현하기 위해 Vercel Dev CLI를 사용합니다. `yarn start` 명령어는 `vercel dev`(Backend API)와 `vite`(Frontend)를 동시에 실행하여 통합 개발 환경을 제공합니다.

### 3. Environment Variables

`/blog/.env`

```bash
# GitHub Private Repository Access Token (Step 1에서 생성한 토큰)
BLOG_POSTS_GITHUB_TOKEN=ghp_your_github_personal_access_token

# Google OAuth (Step 4에서 설정)
VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_client_secret

# 애플리케이션 Base URL
VITE_BASE_URL=http://localhost:5173
BASE_URL=http://localhost:5173
```

**Important:**

-   로컬 개발: `.env` 파일에 설정
-   프로덕션: Vercel Dashboard에도 동일하게 설정 필요

### 4. Google OAuth Setup

Google Cloud Console (https://console.cloud.google.com/)에서 설정:

1. OAuth 클라이언트 ID 생성
2. **승인된 JavaScript 원본**:
    - `http://localhost:5173`
    - `https://blog.yena.io.kr`
3. **승인된 리디렉션 URI**:
    - `http://localhost:5173/api/auth/google`
    - `https://blog.yena.io.kr/api/auth/google`

## How It Works

### Data Flow

```
┌─────────────────┐
│  Public Repo    │  코드 (오픈소스)
│  i2na/i2na      │
└─────────────────┘
        │
        │ Deploy
        ▼
┌─────────────────┐
│     Vercel      │  호스팅 + Serverless API
└─────────────────┘
        │
        │ GitHub API
        ▼
┌─────────────────┐
│  Private Repo   │  컨텐츠 (비공개)
│  i2na-blog-md   │  *.md files
└─────────────────┘
```

### API Routes

-   **GET `/api/posts`**: 포스트 목록 (권한에 따라 필터링)
-   **GET `/api/posts?file=<filename>.md`**: 개별 포스트 (권한 체크)

### Security

-   GitHub Personal Access Token으로 private repo 접근
-   Frontmatter 기반 권한 관리
-   Google OAuth로 사용자 인증

## Usage

### CLI Commands

```bash
# 문서 작성용 프롬프트를 클립보드에 복사
blog call

# 문서를 블로그에 추가 (절대 경로 필요)
blog add <filepath>              # 원본 파일 유지
blog add <filepath> --delete     # 원본 파일 삭제
blog add <filepath> -d           # 원본 파일 삭제 (단축)

# 블로그 프로젝트를 Cursor로 열기
blog open
```

**예시:**

```bash
# 1. Cursor에서 문서 작성 프롬프트 복사
$ blog call
✓ Prompt copied to clipboard
→ Paste it in Cursor

# 2. Cursor에 붙여넣기 → doc.md 파일 생성됨

# 3. 블로그에 추가
$ blog add /Users/leeyena/dev/project/doc.md
→ Syncing with remote...
✓ Up to date
✓ Saved → doc.md
✓ Formatted with Prettier
✓ Committed & pushed to private repo
→ https://blog.yena.io.kr/doc.md

# 원본 파일도 삭제하려면
$ blog add /Users/leeyena/dev/project/doc.md -d
→ Syncing with remote...
✓ Up to date
✓ Saved → doc.md
✓ Formatted with Prettier
✓ Committed & pushed to private repo
✓ Removed original file
→ https://blog.yena.io.kr/doc.md

# 4. 블로그 프로젝트를 Cursor로 열기
$ blog open
✓ Opening blog project in Cursor...
```

#### Troubleshooting

**Mac: 권한 오류**

```bash
chmod +x cli/index.js
```

**Windows: blog 명령어 인식 안 됨**

PowerShell에서 실행 후 재시작:

```powershell
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";$(yarn global bin)", "User")
```

### Post Format

모든 `.md` 파일 상단에 Frontmatter를 작성합니다.

#### Public Post

```yaml
---
visibility: public
sharedWith: []
createdAt: 2025.12.31 14:30
---
```

#### Private Post (Shared)

```yaml
---
visibility: private
sharedWith: [user1@gmail.com, user2@gmail.com]
createdAt: 2025.12.31 14:30
---
```

**Default Values**

`blog add` CLI로 추가할 때 기본값:

-   `visibility: private`
-   `sharedWith: [yena@moss.land]`
-   `createdAt: 현재시간`

### Access Control

#### Main Page

-   **비로그인**: Public 문서만 표시
-   **로그인**: Public + 자신에게 공유된 Private 문서 표시

#### Direct Post URL Access

**Public 게시물**

```
/document.md → 바로 접근 가능
```

**Private 게시물**

```
/document.md
  ├─ 비로그인 → Google 로그인 요청
  │
  └─ 로그인
      ├─ sharedWith에 포함 → 콘텐츠 표시
      └─ sharedWith에 없음 → Toast 알림 + 홈으로 리다이렉트
```
