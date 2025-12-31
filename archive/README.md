# Archive

Cursor로 생성한 마크다운 문서를 CLI로 빠르게 저장하고 웹에서 보는 개인 아카이브 시스템

**웹 뷰어**: https://archive.yena.io.kr

## CLI 명령어

```bash
# 문서 작성용 프롬프트를 클립보드에 복사
archive call

# 문서를 아카이브에 추가 (절대 경로 필요)
archive add <filepath>              # 원본 파일 유지
archive add <filepath> --delete     # 원본 파일 삭제
archive add <filepath> -d           # 원본 파일 삭제 (단축)

# 아카이브 프로젝트를 Cursor로 열기
archive open
```

## 설치

```bash
# 1. 프로젝트 클론
git clone https://github.com/i2na/i2na.git
cd i2na/archive

# 2. 의존성 설치
yarn install

# 3. 초기 설정 (Archive 경로, Git 저장소, 배포 URL)
node setup.js

# 4. CLI 전역 등록
yarn link

# 5. 완료
archive call
```

## 문제 해결

### 권한 오류가 날 경우 (Mac만)

```bash
# CLI 실행 권한 부여
chmod +x cli/index.js
```

### archive 명령어가 인식 안 될 경우 (Windows만)

```powershell
# PowerShell에서 아래 명령어를 그대로 복사해서 실행하고 PowerShell 재시작
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";$(yarn global bin)", "User")
```

## 사용법

```bash
# 1. Cursor에서 문서 작성 프롬프트 복사
$ archive call
✓ Prompt copied to clipboard

# 2. Cursor에 붙여넣기 → .archive.md 파일 생성됨

# 3. 아카이브에 추가
$ archive add /Users/leeyena/dev/project/doc.archive.md
✓ Saved → docs/react_hooks_guide.md
✓ Committed & pushed
→ https://archive.yena.io.kr

# 원본 파일도 삭제하려면
$ archive add /Users/leeyena/dev/project/doc.archive.md --delete
✓ Removed original file

# 4. 아카이브 프로젝트 열기
$ archive open
```

## 구조

```
archive/
├── cli/                   # CLI 명령어
│   ├── command/
│   │   ├── call.js        # 프롬프트 복사
│   │   ├── add.js         # 문서 추가
│   │   └── open.js        # 프로젝트 열기
│   ├── prompt/            # 프롬프트 템플릿
│   └── config.js          # 설정 관리
├── docs/                  # 마크다운 문서들
├── client/                # React + Vite (Frontend)
├── api/                   # Vercel Serverless Functions (Backend)
├── package.json           # Root dependencies
└── setup.js               # 초기 설정
```

## 설정 파일

`~/.archive-config.json` (각 컴퓨터마다 독립적)

```json
{
    "archivePath": "/현재/프로젝트/경로", // setup.js 실행 시 자동 인식
    "gitRemote": "https://github.com/i2na/i2na.git",
    "baseUrl": "https://archive.yena.io.kr"
}
```

## 웹 뷰어 개발

```bash
cd archive

# 모든 의존성 한 번에 설치 (Yarn Workspaces)
yarn install

# Vercel 로그인 (최초 1회만)
yarn vercel login

# Vercel 개발용 프로젝트에 연결 (최초 1회만)
yarn vercel link

# 개발 서버 실행 (Vercel Dev + Vite)
yarn start
# → Frontend: http://localhost:5173
# → Backend API: http://localhost:3000 (Vercel Dev가 자동으로 실행)

# 빌드
yarn build

# 프리뷰
yarn preview
```

**Vercel Dev 실행:**

-   `yarn start`는 내부적으로 `vercel dev`와 `vite`를 동시에 실행
-   Vercel CLI가 로컬에서 프로덕션 환경을 시뮬레이션
-   API 함수(`/api/*`)를 서버리스 함수로 실행

## 환경 변수 설정

### 로컬 개발

`.env` 파일을 루트에 생성:

```bash
VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_client_secret

VITE_BASE_URL=http://localhost:5173
BASE_URL=http://localhost:5173
```

### Vercel 배포

Vercel Dashboard → Settings → Environment Variables:

```bash
VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_client_secret

VITE_BASE_URL=https://archive.yena.io.kr
BASE_URL=https://archive.yena.io.kr
```

## Google OAuth 설정

Google Cloud Console (https://console.cloud.google.com/):

1. OAuth 클라이언트 ID 생성
2. **승인된 JavaScript 원본**:
    - `https://archive.yena.io.kr`
    - `http://localhost:5173`
3. **승인된 리디렉션 URI**:
    - `https://archive.yena.io.kr/api/auth/google`
    - `http://localhost:5173/api/auth/google`

## 배포

```bash
git add .
git commit -m "feat: update"
git push origin main
```
