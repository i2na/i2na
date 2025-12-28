# Archive

## 개요

Cursor로 생성한 MD 문서를 빠르게 개인 아카이브에 저장하고 관리하는 CLI 기반 시스템.

**핵심 기능**:

-   CLI 명령어로 문서 표준화 프롬프트 복사
-   문서를 아카이브에 자동 추가 (Git 커밋/푸시)
-   VitePress 사이트로 온라인 배포

---

## 워크플로우

```bash
# 1. 개발 중 Cursor가 MD 생성 → 아카이브용 프롬프트 복사
$ archive call
✓ Prompt copied to clipboard
→ Cursor에 붙여넣기

# 2. Cursor가 .archive.md 생성 → 아카이브에 추가
$ archive add /absolute/path/to/file.archive.md
✓ Saved → docs/react_hooks_pattern.md
✓ Committed & pushed
✓ Removed original file
→ https://archive.yena.io.kr/react_hooks_pattern

# 3. 주기적으로 아카이브 프로젝트 열어서 정리
$ archive open
✓ Opening archive project in Cursor...
```

---

## 프로젝트 구조

```
archive/
├── cli/
│   ├── index.js              # CLI 진입점 (#!/usr/bin/env node)
│   ├── commands/
│   │   ├── call.js           # 프롬프트 복사
│   │   ├── add.js            # 문서 추가
│   │   └── open.js           # 프로젝트 열기
│   ├── utils/
│   │   └── git.js            # Git 자동화
│   └── config.js             # 설정 관리
├── templates/
│   ├── archive_prompt.md     # 문서 표준화 프롬프트
│   └── duplicate_check.md    # 중복 검토 프롬프트
├── docs/
│   ├── .vitepress/
│   │   └── config.js         # VitePress 설정
│   └── index.md              # 홈페이지
├── package.json
├── setup.js                   # 초기 설정 스크립트
└── README.md
```

---

## CLI 명령어 스펙

### archive call

**기능**: `templates/archive_prompt.md`를 클립보드에 복사

**구현**:

-   템플릿 파일 읽기
-   clipboardy로 클립보드 복사
-   성공 메시지 출력

### archive add <filepath>

**기능**: `.archive.md` 파일을 아카이브에 저장하고 원본 삭제

**구현**:

1. 파일 읽기 및 gray-matter로 frontmatter 파싱
2. title 기반 slug 생성 (소문자, 특수문자→언더스코어)
3. 생성 날짜를 frontmatter에 추가
4. `docs/{slug}.md`로 저장
5. Git add, commit, push
6. 배포 URL 출력
7. **원본 `.archive.md` 파일 삭제** (아카이브에 저장되었으므로)

### archive open

**기능**: 아카이브 프로젝트를 Cursor로 열기

**구현**:

-   설정에서 경로 읽기
-   `cursor {path}` 명령 실행

---

## 템플릿 파일

### templates/archive_prompt.md

```markdown
위 내용을 같은 경로에 아카이브용 문서로 생성해줘.

규칙:

1. 파일명: {원본파일명}.archive.md

    - 공백이나 하이픈(-) 대신 언더스코어(\_) 사용
    - 예: react_hooks_guide.archive.md

2. Frontmatter:

    - title: 파일명과 동일하게 (언더스코어 사용, .archive.md 제외)
    - tags: 핵심 키워드 2-4개
    - sources: 유용한 참고자료 1-3개 (선택사항)

3. 내용 스타일:

    - 이모지 사용 금지
    - 전문적이고 간결하게
    - 핵심 용어는 영어, 설명은 한글
    - 일상 예시 금지, 기술적 설명만
    - 같은 말 반복 금지
    - 이미지/동영상 사용 금지

4. 구조:

# {title과 동일한 제목 (언더스코어 사용)}

예: # react_hooks_guide

## 개요

개념을 2-3문장으로 명확하게 정의

## 주요 내용

핵심 내용을 섹션별로 구분하여 설명
필요시 코드 예제 포함 (최소한으로)

## 요약

핵심 포인트 정리

## 참고

-   출처 링크들

5. 코드:

    - 최소한으로 간결하게
    - 핵심만 보여주기
    - 주석은 필요한 부분만

6. 길이:
    - 너무 길면 안 되지만
    - 필요한 내용은 모두 포함
    - 읽기 쉽게 섹션 분리

완성되면 보여줘.
```

### templates/duplicate_check.md

```markdown
아카이브 전체 문서를 분석해서 중복되거나 통합 가능한 문서들을 찾아줘.

분석 기준:

1. 같은 주제를 다루는 문서들
2. 내용이 70% 이상 유사한 문서들
3. 하나로 통합하면 더 좋을 문서들

결과 형식:

## 중복 문서 그룹 1

-   docs/hooks_basic.md (생성일: 2025-01-15)
-   docs/react_hooks_intro.md (생성일: 2025-02-03)
-   유사도: 85%
-   제안: 두 문서를 "React Hooks Fundamentals"로 통합
-   이유: 거의 동일한 내용을 다루고 있으며, 두 번째 문서가 더 최신이고 자세함

## 중복 문서 그룹 2

...

작업 순서:

1. 각 그룹별로 어떻게 통합할지 제안
2. 내가 승인하면 통합된 새 문서 작성
3. 기존 문서 삭제 전 확인

시작해줘.
```

---

## 구현 가이드

### 1. package.json

```json
{
    "name": "archive",
    "version": "1.0.0",
    "type": "module",
    "bin": {
        "archive": "./cli/index.js"
    },
    "scripts": {
        "dev": "vitepress dev docs",
        "build": "vitepress build docs",
        "preview": "vitepress preview docs",
        "setup": "node setup.js",
        "link": "yarn link"
    },
    "dependencies": {
        "chalk": "^5.3.0",
        "clipboardy": "^4.0.0",
        "gray-matter": "^4.0.3",
        "simple-git": "^3.22.0",
        "commander": "^11.1.0",
        "inquirer": "^9.2.12"
    },
    "devDependencies": {
        "vitepress": "^1.0.0",
        "vue": "^3.4.0"
    }
}
```

### 2. CLI 진입점 (cli/index.js)

```javascript
#!/usr/bin/env node
import { Command } from "commander";
import callCommand from "./commands/call.js";
import addCommand from "./commands/add.js";
import openCommand from "./commands/open.js";

const program = new Command();

program.name("archive").description("Personal knowledge archive CLI").version("1.0.0");

program
    .command("call")
    .description("Generate Cursor prompt and copy to clipboard")
    .action(callCommand);

program.command("add <filepath>").description("Add document to archive").action(addCommand);

program.command("open").description("Open archive project in Cursor").action(openCommand);

program.parse();
```

### 3. 설정 관리 (cli/config.js)

-   `~/.archive-config.json` 파일 읽기/쓰기
-   설정 없으면 에러 메시지 출력
-   `ARCHIVE_PATH`, `BASE_URL`, `GIT_REMOTE` export

### 4. Git 자동화 (cli/utils/git.js)

-   simple-git 사용
-   `commitAndPush(message)` 함수 제공
-   add → commit → push 순차 실행

### 5. 초기 설정 (setup.js)

-   inquirer로 대화형 입력 받기
    -   Archive 프로젝트 경로 (기본: `~/dev/archive`)
    -   Git 저장소 URL (기본: `https://github.com/i2na/archive.git`)
    -   배포 URL (기본: `https://archive.yena.io.kr`)
-   `~/.archive-config.json`에 저장

### 6. VitePress 설정 (docs/.vitepress/config.js)

```javascript
export default {
    title: "Archive",
    description: "Personal knowledge base",
    themeConfig: {
        nav: [{ text: "Home", link: "/" }],
        socialLinks: [{ icon: "github", link: "https://github.com/i2na/archive" }],
    },
};
```

### 7. 배포 설정 (vercel.json)

```json
{
    "buildCommand": "yarn build",
    "outputDirectory": "docs/.vitepress/dist",
    "framework": "vitepress"
}
```

**참고**: 실제 배포는 커스텀 도메인 `archive.yena.io.kr`을 사용하며, Vercel 대시보드에서 도메인 연결 설정 필요

---

## 설치 및 사용

### 초기 설정

```bash
# 1. GitHub에서 프로젝트 클론
cd ~/dev
git clone https://github.com/i2na/archive.git
cd archive

# 2. 의존성 설치
yarn install

# 3. 초기 설정 실행
node setup.js
# → 경로 (기본: ~/dev/archive)
# → Git URL (기본: https://github.com/i2na/archive.git)
# → 배포 URL (기본: https://archive.yena.io.kr)

# 4. CLI 전역 등록
yarn link

# 5. Vercel 배포 (최초 1회)
# Vercel CLI 설치 및 배포
yarn global add vercel
vercel
# → 커스텀 도메인 archive.yena.io.kr 연결
```

### 실제 사용 예시

```bash
# React 프로젝트에서 작업 중
cd ~/dev/my-react-app

# Cursor가 HOOKS_GUIDE.md 생성함

# 1. 아카이브 프롬프트 복사
archive call
# → Cursor에 붙여넣기
# → Cursor가 HOOKS_GUIDE.archive.md 생성

# 2. 아카이브에 추가
archive add /Users/me/dev/my-react-app/docs/HOOKS_GUIDE.archive.md
# ✓ Saved → docs/react_hooks_guide.md
# ✓ Committed & pushed
# ✓ Removed original file
# → https://archive.yena.io.kr/react_hooks_guide

# 3. 주말에 중복 검토
archive open
# Cursor 열림 → templates/duplicate_check.md 복사해서 사용
```

---

## 핵심 동작 로직

### archive add의 핵심 로직

```javascript
// 1. 파일 읽기 및 파싱
const content = await fs.readFile(filepath, "utf-8");
const { data: frontmatter, content: body } = matter(content);

// 2. slug 생성
const title = frontmatter.title || "untitled";
const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "_")
    .replace(/^_|_$/g, "");

// 3. 날짜 추가
const updatedFrontmatter = {
    ...frontmatter,
    created: new Date().toISOString().split("T")[0],
};

// 4. 파일 저장
const targetPath = path.join(ARCHIVE_PATH, "docs", `${slug}.md`);
const finalContent = matter.stringify(body, updatedFrontmatter);
await fs.writeFile(targetPath, finalContent);

// 5. Git 처리
await commitAndPush(`docs: add ${slug}`);

// 6. URL 출력
console.log(`→ ${BASE_URL}/${slug}`);

// 7. 원본 파일 삭제 (아카이브에 저장 완료)
await fs.unlink(filepath);
console.log(`✓ Removed original file: ${filepath}`);
```

---

## 구현 시 주의사항

1. **ESM 사용**: `type: "module"` 설정, `import/export` 사용
2. **절대 경로**: `archive add`는 절대 경로로 파일 받기
3. **원본 파일 삭제**: 아카이브 저장 성공 후 원본 `.archive.md` 파일을 `fs.unlink`로 삭제
4. **설정 검증**: CLI 실행 시 설정 파일 존재 여부 확인
5. **에러 처리**: 파일 없음, Git 실패 등 명확한 에러 메시지
6. **yarn link**: 전역 명령어로 등록되어 어디서든 사용 가능
7. **자동 배포**: Git 푸시 → Vercel 자동 빌드/배포

---

## 요구사항 요약

-   CLI는 3개 명령어만: call, add, open
-   템플릿은 수정 가능하게 별도 파일로 관리
-   Git 자동화로 수동 커밋 불필요
-   VitePress로 정적 사이트 생성
-   Vercel 자동 배포 연동
-   설정은 홈 디렉토리의 `.archive-config.json`에 저장
-   패키지 관리는 yarn 사용
