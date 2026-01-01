# Monorepo Management Guide

## Initial Setup

저장소를 clone한 후 다음 명령어를 실행하세요:

```bash
git clone <repository-url>
cd i2na
yarn install
```

이 명령어는 Git hooks를 자동으로 설치하여 아래의 커밋 규칙이 적용되도록 합니다.

## Git Commit Rules

### Auto Prefix

단일 프로젝트 변경 시 자동으로 prefix 추가됩니다.

```bash
git add project1/
git commit -m "feat: add new feature"
# → "project1: feat: add new feature"
```

### Multiple Projects Prevention

여러 프로젝트 동시 커밋은 자동 거부됩니다.

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

루트 파일(`README.md`, `.gitignore` 등)은 prefix 없이 커밋됩니다.

```bash
git add README.md
git commit -m "docs: update profile"
# → "docs: update profile"
```

### Bypass Validation

```bash
git commit --no-verify -m "message"
```

## Vercel Deployment

각 프로젝트는 Vercel에 독립적으로 배포됩니다:

| 프로젝트 | Vercel 프로젝트명 | Root Directory |
| -------- | ----------------- | -------------- |
| project1 | i2na-project1     | `project1`     |
| project2 | i2na-project2     | `project2`     |

**Root Directory 설정:**

```
Settings → General → Root Directory
→ 해당 프로젝트 폴더명 입력 (예: project1, project2)
```

Vercel이 해당 폴더를 프로젝트 루트로 인식하여 빌드합니다.

**빌드 최적화:**

각 프로젝트는 변경이 있을 때만 빌드됩니다. `<project>/vercel.json`:

```json
{
    "ignoreCommand": "git diff HEAD^ HEAD --quiet ."
}
```

## Troubleshooting

### Hook Not Working

Git hooks는 `.git/hooks/`에 위치하며 실행 권한이 필요합니다.

```bash
chmod +x .git/hooks/pre-commit .git/hooks/prepare-commit-msg .git/hooks/commit-msg
```
