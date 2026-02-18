# Monorepo Management Guide

## Overview

이 저장소는 프로젝트별 독립 개발과 배포를 전제로 운영됩니다.
Git hooks로 커밋 규칙을 강제하여 프로젝트 경계를 유지하고, 루트 레벨에서 Prettier를 공통 포맷터로 사용합니다.

## Initial Setup

저장소를 clone한 뒤 아래 순서로 초기 설정을 진행합니다.

```bash
git clone <repository-url>
cd <repository-directory>
yarn install
```

`yarn install` 실행 시 `postinstall` 스크립트가 동작하여 Git hooks가 자동 설치됩니다.

## Git Commit Rules

### Message Format

기본 검증 형식은 `<scope>: <description>` 입니다.
프로젝트 변경 커밋은 자동 prefix가 붙어 최종적으로 `<project>: <type>: <description>` 형태를 권장합니다.

```bash
docs: update profile
project1: feat: add profile animation
```

### Auto Prefix

단일 프로젝트 디렉터리만 변경된 경우 `prepare-commit-msg` 훅이 프로젝트 prefix를 자동으로 추가합니다.

```bash
git add project1/
git commit -m "feat: add new feature"
# → "project1: feat: add new feature"
```

### Multiple Projects Prevention

여러 프로젝트를 동시에 stage하면 `pre-commit` 훅이 커밋을 거부합니다.

```bash
# 거부됨
git add project1/ project2/
git commit -m "feat: update"

# 올바른 방법
git reset
git add project1/ && git commit -m "feat: update"
git add project2/ && git commit -m "feat: update"
```

### Root Files Exception

루트 파일(`README.md`, `.gitignore`, `.prettierrc` 등)만 변경된 경우 prefix 없이 커밋됩니다.

```bash
git add README.md
git commit -m "docs: update profile"
# → "docs: update profile"
```

### Bypass Validation

검증을 우회해야 하는 경우 아래 명령어를 사용합니다.

```bash
git commit --no-verify -m "message"
```

## Prettier

### Installation

Prettier는 루트 `package.json`의 `devDependencies`에 설치되어 있으며, 모노레포 전체에서 공통으로 사용됩니다.

### Configuration

공통 설정은 루트 `.prettierrc`에서 관리합니다.

```json
{
    "semi": true,
    "singleQuote": false,
    "tabWidth": 4,
    "useTabs": false,
    "trailingComma": "es5",
    "printWidth": 100,
    "arrowParens": "always",
    "endOfLine": "auto"
}
```

### Usage

루트 스크립트는 `prettier --write`이며, 대상 경로를 인자로 전달해 실행합니다.

```bash
yarn format .
yarn format "<project-directory>/"
```

## Vercel Deployment

각 프로젝트는 Vercel에 독립적으로 배포합니다.

| 프로젝트 | Vercel 프로젝트명 예시 | Root Directory |
| -------- | ---------------------- | -------------- |
| project1 | your-monorepo-project1 | `project1`     |
| project2 | your-monorepo-project2 | `project2`     |

Root Directory는 다음 경로에서 프로젝트별로 설정합니다.

```text
Settings -> General -> Root Directory
```

각 프로젝트의 `<project>/vercel.json`에 아래 설정을 두면 변경이 없는 경우 빌드를 건너뜁니다.

```json
{
    "ignoreCommand": "git diff HEAD^ HEAD --quiet ."
}
```

## Troubleshooting

### Hook Not Working

Git hooks 파일은 `.git/hooks/`에 위치하며 실행 권한이 필요합니다.

```bash
chmod +x .git/hooks/pre-commit .git/hooks/prepare-commit-msg .git/hooks/commit-msg
```
