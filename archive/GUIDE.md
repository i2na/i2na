# Archive Guide

## 📁 프로젝트 구조

```
archive/
  cli/                   # CLI (archive 명령어)
    prompt/              # Prompt 템플릿
    command/             # CLI 명령어
  client/                # React + Vite (Frontend)
    src/
      pages/             # ListPage, ViewPage, AuthCallbackPage
      components/        # MarkdownViewer, TableOfContents
      utils/             # auth.ts, markdown.ts, scroll.ts
      styles/            # SCSS 스타일
  api/                   # Vercel Serverless Functions (Backend)
    auth/
      google.ts          # Google OAuth 콜백
  docs/                  # 마크다운 문서
  package.json           # Root + Yarn Workspaces
  vercel.json            # Vercel 배포 설정
```

**Yarn Workspaces:**

-   Root: CLI dependencies + Vercel CLI
-   Client: React, Vite, Frontend dependencies

---

## 🚀 빠른 시작

### 1. Google OAuth 설정

Google Cloud Console에서 OAuth 앱 생성:

1. https://console.cloud.google.com/ 접속
2. 프로젝트 생성
3. **API 및 서비스** → **사용자 인증 정보** → **OAuth 클라이언트 ID** 생성
4. 웹 애플리케이션 선택 후:

    ```
    승인된 JavaScript 원본:
      https://archive.yena.io.kr
      http://localhost:5173

    승인된 리디렉션 URI:
      https://archive.yena.io.kr/api/auth/google
      http://localhost:5173/api/auth/google
    ```

5. **Client ID**와 **Client Secret** 복사

---

### 2. 환경변수 설정

#### 로컬 개발

`.env` (루트에 생성)

```bash
# Frontend
VITE_GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
VITE_BASE_URL=http://localhost:5173

# Backend
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnop
BASE_URL=http://localhost:5173
```

#### Vercel (프로덕션)

대시보드 → i2na-archive → Settings → Environment Variables:

```bash
VITE_GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
VITE_BASE_URL=https://archive.yena.io.kr

GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnop
BASE_URL=https://archive.yena.io.kr
```

**Environment**: Production & Preview 모두 체크

---

### 3. 로컬 실행

```bash
# 루트에서 한 번에 설치
yarn install

# Vercel 로그인 (최초 1회만)
yarn vercel login

# Vercel 프로젝트 연결 (최초 1회만)
yarn vercel link
# → 개발용 프로젝트 선택: i2na-archive-dev
# → Root Directory는 비워두기

# 개발 서버 실행
yarn start
```

**개발 서버:**

-   Frontend: http://localhost:5173 (Vite)
-   Backend API: http://localhost:3000 (Vercel Dev)
-   Vite가 `/api/*` 요청을 자동으로 3000 포트로 프록시

**Vercel Dev:**
- `yarn start`는 `vercel dev`와 `vite`를 동시에 실행
- Vercel CLI가 `/api` 폴더의 서버리스 함수를 로컬에서 실행
- 프로덕션 환경과 동일한 방식으로 API 테스트 가능

**프로젝트 구분:**
- **i2na-archive-dev**: 로컬 개발용 (Root Directory 비움)
- **i2na-archive**: 배포용 (Root Directory: `archive`)

---

## 📝 게시물 관리

### Frontmatter 형식

모든 `.md` 파일 상단에 작성:

#### Public (누구나 접근)

```yaml
---
visibility: public
sharedWith: []
createdAt: 2025.12.31 14:30
---
```

#### Private (특정 이메일만)

```yaml
---
visibility: private
sharedWith: [friend@gmail.com, coworker@company.com]
createdAt: 2025.12.31 14:30
---
```

### 필드 설명

| 필드         | 타입                  | 필수 | 설명                                |
| ------------ | --------------------- | ---- | ----------------------------------- |
| `visibility` | `public` \| `private` | ❌   | 공개 여부 (기본값: `public`)        |
| `sharedWith` | string[]              | ❌   | 공유할 이메일 목록 (배열)           |
| `createdAt`  | string                | ❌   | 생성 시간 (`YYYY.MM.DD HH:mm` 형식) |

**주의**: `sharedWith`는 Google 계정 이메일과 정확히 일치해야 함

---

## 🎯 동작 방식

### 메인 페이지

-   **비로그인**: Public 문서만 표시
-   **로그인**: Public + 자신에게 공유된 Private 문서 표시
-   Private 문서에는 "Shared" 배지 표시

### 로그인

-   상단 우측 Login 버튼 → Google OAuth
-   로그인 후 30일간 세션 유지
-   로그인하면 이메일과 Logout 버튼 표시

### 직접 URL 접근

#### Public 게시물

```
/view/01_data_system.md → 바로 접근 가능
```

#### Private 게시물

```
/view/secret.md
  ├─ 비로그인 → Google 로그인 요청
  │             → 로그인 후 이 페이지로 돌아옴
  │
  └─ 로그인
      ├─ sharedWith에 포함 → 콘텐츠 표시
      └─ sharedWith에 없음 → Toast 알림 + 홈으로 리다이렉트
```

---

## 🏗️ 주요 기능

### Google OAuth

-   **frontend**: `client/src/utils/auth.ts` - 로그인 상태 관리
-   **backend**: `api/auth/google.ts` - OAuth 콜백 처리
-   **callback**: `client/src/pages/AuthCallbackPage.tsx` - localStorage 저장

### 권한 체크

-   `client/src/utils/markdown.ts`
    -   `canAccessPost()`: 개별 게시물 접근 권한
    -   `filterPostsByVisibility()`: 리스트 필터링

### UI/UX

-   **단일 리스트**: Public/Private 통합 표시
-   **Shared 배지**: Private 문서 식별
-   **Toast 알림**: 권한 없을 때 사용자 피드백
-   **자동 리다이렉트**: 권한 없으면 홈으로

---

## 📦 스크립트

```bash
yarn start       # 개발 서버 (Frontend + Backend)
yarn build       # 프로덕션 빌드
yarn preview     # 빌드 결과 프리뷰
```

---

## 🚀 배포

### Vercel 프로젝트 설정

**i2na-archive (프로덕션용)**

```
Root Directory: archive
Framework Preset: Other

Build Command: (Override 끄기 - vercel.json 사용)
Output Directory: (Override 끄기 - vercel.json 사용)
Install Command: (Override 끄기 - vercel.json 사용)
Development Command: None (Override 끄기)
```

### 배포 과정

```bash
git add .
git commit -m "feat: update"
git push origin main
```

Vercel이 자동으로:

1. `archive` 폴더로 이동
2. `yarn install` 실행
3. `yarn build` 실행
4. `client/dist` 배포
5. `api/` 폴더를 서버리스 함수로 배포

---

## 💡 팁

### CLI로 추가 시 (`archive add`)

-   `visibility: private` (기본값)
-   `sharedWith: [yena@moss.land]` (기본값)
-   `createdAt: 현재시간` (자동 생성)

### Frontmatter 없으면?

-   기본값 자동 적용: `visibility: public`, `sharedWith: []`

### 배열 표기법

```yaml
sharedWith: []
sharedWith: [friend@gmail.com, coworker@company.com]
```

### 개발 팁

-   환경 변수 수정 후 서버 재시작 필요
-   Google OAuth 에러 시 새로고침으로 해결
-   콘솔에서 redirect URI 확인 가능 (DEV 모드)

---

## 🔍 주요 코드

| 기능        | 파일                                    | 함수                      |
| ----------- | --------------------------------------- | ------------------------- |
| 로그인 상태 | `client/src/utils/auth.ts`              | `isAuthenticated()`       |
| 로그인 시작 | `client/src/utils/auth.ts`              | `startGoogleLogin()`      |
| 권한 체크   | `client/src/utils/markdown.ts`          | `canAccessPost()`         |
| 리스트 UI   | `client/src/pages/ListPage.tsx`         | -                         |
| 접근 제어   | `client/src/pages/ViewPage.tsx`         | -                         |
| OAuth 콜백  | `api/auth/google.ts`                    | `handler()`               |
| 콜백 처리   | `client/src/pages/AuthCallbackPage.tsx` | -                         |
| 스크롤      | `client/src/utils/scroll.ts`            | `smoothScrollToElement()` |

---

## 🐛 문제 해결

### redirect_uri_mismatch 에러

-   Google Cloud Console에서 URI 확인
-   `http://localhost:5173/api/auth/google` 등록 확인
-   개발자 도구 콘솔에서 실제 URI 확인

### 로그인 후 버튼 안 사라짐

-   브라우저 창 포커스 변경 시 자동 갱신
-   또는 새로고침

### 게시물 안 나옴

-   `docs/` 폴더 경로 확인
-   Frontmatter 형식 확인
-   콘솔 에러 확인
