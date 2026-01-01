# Blog Setup Guide - Private Repository 구조

이 가이드는 blog 프로젝트를 Private Git Repository 기반으로 전환하는 방법을 설명합니다.

## 구조 개요

```
Public Repo (i2na/i2na)
└── blog/                    # 블로그 애플리케이션 코드
    ├── client/              # React Frontend
    ├── api/                 # Vercel Serverless API
    └── cli/                 # CLI 도구

Private Repo (i2na/i2na-blog-md)
├── 01_data_system.md        # 마크다운 포스트들
├── 02_viewer_initialization.md
└── ...
```

## 3. GitHub Personal Access Token 생성

API가 Private repo에 접근하려면 토큰이 필요합니다.

1. GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. "Generate new token (classic)" 클릭
3. Note: `blog-api-access`
4. Expiration: No expiration (또는 원하는 기간)
5. Scopes:
    - ✅ **repo** (Full control of private repositories)
6. Generate token
7. **토큰을 안전한 곳에 복사** (다시 볼 수 없음!)

## 4. 환경 변수 설정

### 로컬 개발 환경:

`/Users/leeyena/dev/i2na/blog/.env` 파일 생성:

```bash
# Google OAuth (프론트엔드)
VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com

# Google OAuth (백엔드)
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_client_secret

# GitHub Private Repo Access
BLOG_POSTS_GITHUB_TOKEN=ghp_your_github_personal_access_token

# Base URL
VITE_BASE_URL=http://localhost:5173
BASE_URL=http://localhost:5173
```

### Vercel 프로덕션 환경:

1. Vercel Dashboard → 프로젝트 선택
2. Settings → Environment Variables
3. 다음 변수 추가:
    - `GOOGLE_CLIENT_ID`
    - `GOOGLE_CLIENT_SECRET`
    - `BLOG_POSTS_GITHUB_TOKEN` ← **중요!**
    - `VITE_GOOGLE_CLIENT_ID`
    - `BASE_URL`

## 5. CLI 설정

```bash
cd /Users/leeyena/dev/i2na/blog

# 설정 실행
node setup.js
```

프롬프트에 다음 정보 입력:

```
Blog project path: /Users/leeyena/dev/i2na/blog
Posts repository path: /Users/leeyena/dev/i2na-blog-md
Git repository URL: https://github.com/i2na/i2na.git
Posts Git repository URL: https://github.com/i2na/i2na-blog-md.git
Deployment URL: https://blog.yena.io.kr
```

설정이 `~/.blog-config.json`에 저장됩니다.

### CLI 전역 등록:

```bash
yarn link

# 테스트
blog call
```

## 6. 기존 post 폴더 제거

**⚠️ 주의: 이 작업 전에 모든 포스트가 Private repo로 이동되었는지 확인하세요!**

```bash
cd /Users/leeyena/dev/i2na/blog

# post 폴더 삭제
rm -rf post

# 변경사항 커밋
git add .
git commit -m "Remove post folder (moved to private repo)"
git push
```

## 7. 테스트

### 로컬 개발 서버 실행:

```bash
cd /Users/leeyena/dev/i2na/blog
yarn start
```

-   Frontend: http://localhost:5173
-   Backend: http://localhost:3000

### 포스트 추가 테스트:

```bash
# 테스트 포스트 생성
echo "---
visibility: private
sharedWith: [yena@moss.land]
---

# Test Post

This is a test." > /tmp/test-post.md

# 블로그에 추가
blog add /tmp/test-post.md

# 출력 확인:
# → Syncing with remote...
# ✓ Up to date
# ✓ Saved → test-post.md
# ✓ Committed & pushed to private repo
# → https://blog.yena.io.kr/test-post
```

### 브라우저에서 확인:

1. http://localhost:5173 접속
2. 포스트 목록 확인
3. 포스트 클릭하여 내용 확인

## 8. Vercel 배포

```bash
cd /Users/leeyena/dev/i2na/blog

# 배포
vercel --prod
```

## 트러블슈팅

### API에서 404 오류

-   GitHub Token이 올바르게 설정되었는지 확인
-   Token에 `repo` 권한이 있는지 확인
-   Private repo 이름이 `i2na-blog-md`가 맞는지 확인
-   Vercel 환경 변수에 `BLOG_POSTS_GITHUB_TOKEN`이 설정되어 있는지 확인

### CLI에서 Git 오류

-   `postsRepoPath`가 올바른지 확인
-   Private repo를 클론했는지 확인
-   Git 인증이 설정되어 있는지 확인

### 포스트가 표시되지 않음

-   Private 포스트는 로그인 후 `sharedWith`에 포함된 이메일로만 확인 가능
-   Public 포스트로 테스트: `visibility: public`

## 작동 원리

### 포스트 추가 (`blog add`)

1. Private repo를 최신 상태로 pull
2. MD 파일을 Private repo에 저장
3. Git commit & push
4. Vercel이 자동으로 배포 (Public repo 변경 없음)

### 포스트 읽기 (API)

1. 클라이언트가 `/api/posts` 요청
2. API가 GitHub API로 Private repo 접근
3. 파일 목록/내용 가져오기
4. Frontmatter 파싱하여 권한 체크
5. 권한 있는 사용자에게만 응답

### 보안

-   MD 파일은 Private repo에만 존재
-   Public repo에는 코드만 존재
-   API 레벨에서 권한 체크
-   GitHub Token은 환경 변수로 안전하게 관리

## 다음 단계

### 폴더 구조로 확장 (향후):

```
i2na-blog-md/
├── data-system-series/
│   ├── 01_data_system.md
│   ├── 02_viewer_initialization.md
│   └── 03_viewer_control.md
├── architecture/
│   └── Feature_Sliced_Design.md
└── standalone/
    └── random-post.md
```

API는 이미 폴더 구조를 지원하므로 언제든지 확장 가능합니다!
