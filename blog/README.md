# Yena.Lee Blog

Cursor로 작성한 마크다운 문서를 CLI로 빠르게 저장하고 웹에서 보는 개인 블로그 시스템

**Production**: https://blog.yena.io.kr

## Structure

```
blog/
├── cli/                   # CLI 명령어
│   ├── command/
│   │   ├── call.js        # 프롬프트 복사
│   │   ├── add.js         # 문서 추가
│   │   └── open.js        # 프로젝트 열기
│   ├── prompt/            # 프롬프트 템플릿
│   └── config.js          # 설정 관리
├── post/                  # 마크다운 문서들
├── client/                # React + Vite (Frontend)
├── api/                   # Vercel Serverless Functions (Backend)
├── package.json           # Root dependencies
└── setup.js               # 초기 설정
```

## Setup

### Installation

#### 공통

```
# 프로젝트 클론
git clone https://github.com/i2na/i2na.git
cd i2na/blog

# 의존성 설치
yarn install
```

#### CLI Setup

```bash
cd blog

# 초기 설정 (Blog 경로, Git 저장소, 배포 URL)
node setup.js

# CLI 전역 등록
yarn link

# 설치 확인
blog call
```

설정 파일이 `~/.blog-config.json`에 생성됩니다:

```json
{
    "blogPath": "/현재/프로젝트/경로", // setup.js 실행 시 자동 인식
    "gitRemote": "https://github.com/i2na/i2na.git",
    "baseUrl": "https://blog.yena.io.kr"
}
```

#### Web Development Setup

```bash
cd blog

# Vercel 로그인 (최초 1회)
yarn vercel login

# 프로젝트 연결 (최초 1회)
yarn vercel link

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

### Google OAuth

Google Cloud Console (https://console.cloud.google.com/)에서 설정:

1. OAuth 클라이언트 ID 생성
2. **승인된 JavaScript 원본**:
    - `http://localhost:5173`
    - `https://blog.yena.io.kr`
3. **승인된 리디렉션 URI**:
    - `http://localhost:5173/api/auth/google`
    - `https://blog.yena.io.kr/api/auth/google`

### Environment Variables

루트에 `.env` 파일을 생성:

```bash
# Google OAuth 클라이언트 ID (프론트엔드용)
VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com

# Google OAuth 크레덴셜 (백엔드 API용)
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_client_secret

# 애플리케이션 Base URL
VITE_BASE_URL=base-url
BASE_URL=base-url
```

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

# 2. Cursor에 붙여넣기 → .blog.md 파일 생성됨

# 3. 블로그에 추가
$ blog add /Users/leeyena/dev/project/doc.blog.md
→ Syncing with remote...
✓ Up to date
✓ Saved → post/doc.blog.md
✓ Committed & pushed
→ https://blog.yena.io.kr/doc.blog.md

# 원본 파일도 삭제하려면
$ blog add /Users/leeyena/dev/project/doc.blog.md -d
→ Syncing with remote...
✓ Up to date
✓ Saved → post/doc.blog.md
✓ Committed & pushed
✓ Removed original file
→ https://blog.yena.io.kr/doc.blog.md

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

#### Private Post

```yaml
---
visibility: private
sharedWith: [name1@gmail.com, name2@gmail.com]
createdAt: 2025.12.31 14:30
---
```

#### Default Values

Frontmatter가 없으면 기본값이 적용됩니다:

-   `visibility: public`
-   `sharedWith: []`

`blog add` CLI로 추가할 때는 다음 기본값이 적용됩니다:

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
