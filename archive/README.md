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

# 3. CLI 실행 권한 부여 (Mac만 필요, Windows는 건너뛰기)
chmod +x cli/index.js

# 4. 초기 설정 (Archive 경로, Git 저장소, 배포 URL)
node setup.js

# 5. CLI 전역 등록
yarn link

# 6. 완료
archive call
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
│   ├── commands/
│   │   ├── call.js        # 프롬프트 복사
│   │   ├── add.js         # 문서 추가
│   │   └── open.js        # 프로젝트 열기
│   └── config.js          # 설정 관리
├── docs/                  # 마크다운 문서들
├── templates/             # 프롬프트 템플릿
│   ├── archive_prompt.md
│   └── duplicate_check.md
├── web/                   # React 웹 뷰어
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
# 웹 의존성 설치
cd web && yarn install

# 로컬 개발 서버
yarn dev

# 빌드
yarn build
```
