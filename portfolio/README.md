# i2na.github.io

> Portfolio project - Work in Progress

개발용 임시 배포: https://i2na.vercel.app/

## Tech Stack

- Vite
- React
- TypeScript
- Tailwind CSS

## Key Features

- Markdown 기반 블로그 포스팅
- 3D 인터랙티브 씬 (Spline)
- AI 챗봇 위젯

## Development

```bash
# Install dependencies
yarn install

# Run development server
yarn dev

# Build for production
yarn build

# Preview production build
yarn preview
```

## Environment Variables

Create `.env.local` file and set:

```
GEMINI_API_KEY=your_api_key_here
```

## Content Structure

```
blog/
├── *.md              # 게시된 포스트
└── temp/             # 임시 저장 (빌드 제외)
```

## Status

현재 개발 중인 프로젝트입니다. 기능 및 구현 세부사항은 변경될 수 있습니다.
