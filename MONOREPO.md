# Monorepo Management Guide

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

루트 파일(`README.md`, `package.json` 등)은 prefix 없이 커밋됩니다.

```bash
git add README.md
git commit -m "docs: update profile"
# → "docs: update profile"
```

## Vercel Build Optimization

각 프로젝트는 변경 감지 시에만 빌드됩니다.

### Configuration

`<project>/vercel.json`:

```json
{
    "ignoreCommand": "git diff HEAD^ HEAD --quiet -- <project>/"
}
```

### Dashboard Setting (Optional)

**Settings → Git → Ignored Build Step**

```bash
git diff HEAD^ HEAD --quiet -- <project>/
```

## Troubleshooting

### Hook Permission Issue

```bash
chmod +x .husky/pre-commit .husky/prepare-commit-msg .husky/commit-msg
```

### Bypass Validation

```bash
HUSKY=0 git commit -m "message"
# or
git commit --no-verify -m "message"
```
