# Archive Guide

## 📁 프로젝트 구조

```
archive/
  cli/                   # CLI (archive 명령어)
    prompt/              # Prompt 템플릿
    command/             # CLI 명령어
  web/
    frontend/            # React + Vite 소스 코드
    backend/             # Vercel Serverless Functions
  api/                   # web/backend 심볼릭 링크 (Vercel용)
  docs/                  # 마크다운 문서
  package.json           # 모든 의존성 통합 관리
  .env.local             # 로컬 환경변수
```

**단일 package.json:**

-   CLI + Frontend + Backend 모든 의존성 하나로 관리
-   `yarn install` 한 번으로 모든 패키지 설치
-   간단하고 명확한 구조

---

## 🚀 빠른 시작

### 1. Google OAuth 설정

Google Cloud Console에서 OAuth 앱 생성:

1. https://console.cloud.google.com/ 접속
2. 프로젝트 생성
3. **API 및 서비스** → **사용자 인증 정보** → **OAuth 클라이언트 ID** 생성
4. 웹 애플리케이션 선택 후:

    ```
    승인된 자바스크립트 원본:
      https://archive.yena.io.kr
      http://localhost:5173

    승인된 리디렉션 URI:
      https://archive.yena.io.kr/api/auth/google
      http://localhost:8080/api/auth/google
    ```

5. **Client ID**와 **Client Secret** 복사

---

### 2. 환경변수 설정

#### 로컬 개발

`.env.local` (루트에 생성)

```bash
# Backend
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnop
BACKEND_URL=http://localhost:8080
FRONTEND_URL=http://localhost:5173

# Frontend
VITE_GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
VITE_BACKEND_URL=http://localhost:8080
```

**하나의 파일로 Frontend + Backend 환경변수 모두 관리**

#### Vercel (프로덕션)

대시보드 → Settings → Environment Variables:

```bash
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnop
BACKEND_URL=https://archive.yena.io.kr
FRONTEND_URL=https://archive.yena.io.kr
VITE_GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
VITE_BACKEND_URL=https://archive.yena.io.kr
```

---

### 3. 로컬 실행

```bash
# 루트에서 한 번에 설치
yarn install

# 심볼릭 링크 생성 (최초 1회만)
ln -s web/backend api
cd web/frontend && ln -s ../../node_modules node_modules && cd ../..

# 프론트엔드 실행
yarn dev:frontend

# 백엔드 테스트 필요 시 (별도 터미널)
vercel login        # 최초 1회만
yarn dev:backend
```

**개발 서버:**

-   Frontend: http://localhost:5173
-   Backend API: http://localhost:8080 (별도 터미널에서 실행)

**Backend 테스트 시:**

```bash
# Vercel 로그인 (최초 1회)
yarn vercel login

# Frontend + Backend 실행
yarn dev:full
```

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

### Public 탭 (기본)

-   로그인 불필요
-   `visibility: public`인 게시물만 표시
-   누구나 URL 공유 가능

### Shared 탭

-   **비로그인**: 클릭 시 Google 로그인 요청
-   **로그인**: `sharedWith`에 내 이메일이 포함된 게시물만 표시
-   탭에 개수 표시: `Shared (3)`

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
      └─ sharedWith에 없음 → 에러 메시지 + 2초 후 홈으로
```

### 세션 관리

-   로그인 후 30일간 유지
-   로그아웃 버튼으로 수동 해제

---

## 📁 파일 구조

### 새로 추가된 파일

```
web/backend/auth/google.ts        # Google OAuth API
web/frontend/src/
  utils/auth.ts                   # 로그인 상태 관리
  pages/
    ListPage.tsx                  # Public/Shared 탭 UI
    ListPage.module.scss          # 스타일
    ViewPage.tsx                  # 권한 체크
    ViewPage.module.scss          # 스타일
docs/
  EXAMPLE_PUBLIC.md               # Public 예시
  EXAMPLE_PRIVATE.md              # Private 예시
cli/prompt/                       # Prompt 템플릿 (이전 templates)
```

### 수정된 파일

```
web/frontend/src/
  types/index.ts                  # PostMetadata, UserInfo 타입
  utils/markdown.ts               # Frontmatter 파싱 + 권한 체크
package.json                      # @vercel/node 추가, 경로 수정
vercel.json                       # 빌드 경로 수정
```

---

## 📦 의존성 관리

### 단일 package.json

모든 의존성이 루트 `package.json`에 통합되어 있습니다.

### 패키지 추가

```bash
# 프로덕션 의존성
yarn add 패키지명

# 개발 의존성
yarn add -D 패키지명
```

---

## 🧪 테스트

### 확인 사항

1. **Public 탭**

    - `EXAMPLE_PUBLIC.md` 보임
    - 로그인 없이 접근 가능

2. **Shared 탭**

    - 비로그인: 클릭 시 Google 로그인 화면
    - 로그인: `EXAMPLE_PRIVATE.md` 보임 (sharedWith에 이메일 추가 후)

3. **직접 URL**
    ```
    /view/EXAMPLE_PRIVATE.md
      → 로그인 요청
      → 권한 확인
      → 콘텐츠 표시 or 접근 거부
    ```

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

### 탭 URL 쿼리

```
/?tab=public   → Public 탭
/?tab=shared   → Shared 탭 (로그인 필요)
```

### 배포 시

1. `docs/` 폴더에 `.md` 추가/수정
2. Frontmatter 설정
3. Git push → Vercel 자동 배포

---

## 🔍 주요 코드

| 기능        | 파일                                  | 함수                |
| ----------- | ------------------------------------- | ------------------- |
| 로그인 상태 | `web/frontend/src/utils/auth.ts`      | `isAuthenticated()` |
| 권한 체크   | `web/frontend/src/utils/markdown.ts`  | `canAccessPost()`   |
| 탭 UI       | `web/frontend/src/pages/ListPage.tsx` | -                   |
| 접근 제어   | `web/frontend/src/pages/ViewPage.tsx` | -                   |
| OAuth API   | `web/backend/auth/google.ts`          | -                   |
