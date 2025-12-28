---
created: '2025-12-28'
---
# Feature-Sliced Design

## 개요

Feature-Sliced Design(FSD)은 프론트엔드 애플리케이션의 코드를 비즈니스 가치와 기술적 목적에 따라 수평적 레이어(layer)와 수직적 슬라이스(slice)로 구조화하는 아키텍처 방법론입니다. 각 레이어는 명확한 책임을 가지며 단방향 의존성 규칙을 따라 순환 참조를 방지하고, 슬라이스는 독립적인 기능 단위로 분리되어 확장성과 유지보수성을 극대화합니다.

## 주요 내용

### 레이어 구조

FSD는 7개의 레이어로 구성되며, 각 레이어는 특정한 추상화 수준과 책임을 가집니다.

```
app/           애플리케이션 초기화 및 전역 설정
pages/         라우팅 단위의 페이지 조합
widgets/       독립적인 복합 UI 블록
features/      사용자 인터랙션 기능
entities/      비즈니스 도메인 엔티티
shared/        재사용 가능한 공통 코드
```

### 의존성 규칙

레이어 간 의존성은 단방향으로만 허용됩니다.

```
app → pages → widgets → features → entities → shared
```

상위 레이어는 하위 레이어를 import할 수 있지만, 하위 레이어는 상위 레이어를 참조할 수 없습니다. 이 규칙은 순환 참조를 원천적으로 차단하고 의존성 그래프를 단순하게 유지합니다.

### 레이어별 책임

#### app

애플리케이션의 진입점으로 전역 설정을 담당합니다.

-   React Router, Redux Provider 등 전역 provider 설정
-   전역 스타일 및 초기화 코드
-   애플리케이션 라이프사이클 관리

```typescript
// app/index.tsx
import { RouterProvider } from "react-router-dom";
import { router } from "./providers/router";

export function App() {
    return <RouterProvider router={router} />;
}
```

#### pages

URL 라우트와 1:1로 매핑되는 레이어입니다.

-   widgets와 features를 조합하여 완전한 페이지 구성
-   라우트별 데이터 fetching 및 상태 관리
-   페이지 수준의 레이아웃 정의

```typescript
// pages/blogPost/ui/BlogPostPage.tsx
import { Navbar } from "@/widgets/navbar";
import { BlogPostContent } from "@/features/blogPost";

export function BlogPostPage() {
    return (
        <>
            <Navbar />
            <BlogPostContent />
        </>
    );
}
```

#### widgets

독립적으로 동작 가능한 UI 블록을 정의합니다.

-   여러 features를 조합하여 의미 있는 UI 단위 구성
-   페이지 간 재사용 가능한 복합 컴포넌트
-   자체적인 비즈니스 로직 포함 가능

```typescript
// widgets/blogPreview/ui/BentoGrid.tsx
import { BlogList } from "@/features/blogList";
import { useBlogPosts } from "@/entities/blog";

export function BentoGrid() {
    const posts = useBlogPosts();
    return <BlogList posts={posts} layout="grid" />;
}
```

#### features

사용자의 행동을 처리하는 비즈니스 기능 단위입니다.

-   특정 사용자 시나리오를 완결하는 기능
-   UI와 비즈니스 로직의 결합
-   entities를 조합하여 기능 구현

```typescript
// features/blogList/ui/BlogList.tsx
import type { IBlogListProps } from "../model";

export function BlogList({ posts, onPostClick }: IBlogListProps) {
    return (
        <ul>
            {posts.map((post) => (
                <BlogPostItem key={post.id} post={post} onClick={onPostClick} />
            ))}
        </ul>
    );
}
```

#### entities

비즈니스 도메인의 핵심 데이터 모델을 정의합니다.

-   도메인 엔티티의 타입 정의
-   엔티티 관련 API 호출 함수
-   엔티티별 기본 비즈니스 로직

```typescript
// entities/blog/model/types.ts
export interface IPost {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
}

// entities/blog/api/index.ts
export async function fetchPosts(): Promise<IPost[]> {
    const response = await fetch("/api/posts");
    return response.json();
}
```

#### shared

프로젝트 전체에서 사용하는 공통 코드를 관리합니다.

-   UI 컴포넌트 (Button, Input 등)
-   유틸리티 함수 (날짜 포맷, 텍스트 처리 등)
-   공통 타입 및 상수
-   전역 스타일

```typescript
// shared/lib/date/index.ts
export function formatDate(date: Date): string {
    return date.toLocaleDateString("ko-KR");
}
```

### 슬라이스와 세그먼트

각 레이어는 여러 슬라이스로 나뉘며, 슬라이스는 독립적인 기능 단위입니다.

```
features/blogList/           슬라이스
  ├─ ui/                     UI 세그먼트
  │   ├─ BlogList.tsx
  │   └─ BlogList.module.scss
  ├─ model/                  모델 세그먼트
  │   ├─ index.ts
  │   └─ types.ts
  └─ api/                    API 세그먼트 (선택적)
      └─ index.ts
```

#### 세그먼트 유형

-   **ui**: React 컴포넌트와 스타일
-   **model**: 타입 정의, 비즈니스 로직, 상태 관리
-   **api**: 서버 통신 로직 (필요한 경우만)

### 타입 관리 전략

#### 타입 배치 원칙

타입은 해당 레이어의 `model/types.ts`에 정의하고 `model/index.ts`를 통해 re-export합니다.

```typescript
// entities/blog/model/types.ts
export interface IPost {
    id: string;
    title: string;
}

// entities/blog/model/index.ts
export type { IPost } from "./types";

// features/blogList/ui/BlogList.tsx
import type { IPost } from "@/entities/blog/model";
```

#### 명명 규칙

```typescript
interface IPost {} // Interface: I 접두사
type TPostDisplay = {}; // Type alias: T 접두사
interface IBlogListProps {} // Props: 컴포넌트명 + Props
enum EPostStatus {} // Enum: E 접두사
```

### Public API 패턴

각 슬라이스는 `index.ts`를 통해 외부에 노출할 API를 명시적으로 정의합니다.

```typescript
// features/blogList/model/index.ts
export type { IBlogListProps, TPostDisplay } from "./types";
export { useBlogListState } from "./hooks";

// features/blogList/ui/index.ts
export { BlogList } from "./BlogList";
export { BlogPostItem } from "./BlogPostItem";
```

이를 통해 슬라이스의 내부 구현과 공개 인터페이스를 분리할 수 있습니다.

### 크로스 임포트 규칙

같은 레이어 내의 슬라이스 간 직접 참조는 허용되지 않습니다.

```typescript
// ❌ 금지: features/blogList에서 features/commentList 참조
import { CommentList } from "@/features/commentList";

// ✅ 허용: 상위 레이어(widgets)에서 조합
import { BlogList } from "@/features/blogList";
import { CommentList } from "@/features/commentList";

export function BlogWidget() {
    return (
        <>
            <BlogList />
            <CommentList />
        </>
    );
}
```

### 폴더 구조 예시

```
src/
├─ app/
│  ├─ index.tsx
│  └─ providers/
│     └─ router.tsx
├─ pages/
│  ├─ blogPost/
│  │  └─ ui/
│  │     └─ BlogPostPage.tsx
│  └─ landing/
│     └─ ui/
│        └─ LandingPage.tsx
├─ widgets/
│  ├─ navbar/
│  │  ├─ ui/
│  │  │  └─ Navbar.tsx
│  │  └─ model/
│  │     ├─ index.ts
│  │     └─ types.ts
│  └─ footer/
│     └─ ui/
│        └─ Footer.tsx
├─ features/
│  ├─ blogList/
│  │  ├─ ui/
│  │  │  ├─ BlogList.tsx
│  │  │  └─ BlogPostItem.tsx
│  │  └─ model/
│  │     ├─ index.ts
│  │     └─ types.ts
│  └─ chat/
│     ├─ ui/
│     │  └─ ChatWidget.tsx
│     ├─ model/
│     │  ├─ index.ts
│     │  └─ types.ts
│     └─ api/
│        └─ chatService.ts
├─ entities/
│  └─ blog/
│     ├─ api/
│     │  └─ index.ts
│     └─ model/
│        ├─ index.ts
│        └─ types.ts
└─ shared/
   ├─ ui/
   │  └─ backButton/
   │     └─ BackButton.tsx
   ├─ lib/
   │  ├─ date/
   │  └─ slug/
   ├─ types/
   └─ styles/
```

## 요약

Feature-Sliced Design은 다음과 같은 핵심 원칙을 통해 유지보수 가능한 프론트엔드 아키텍처를 제공합니다:

-   **명확한 레이어 분리**: 비즈니스 가치에 따른 7개 레이어로 코드 역할이 명확히 구분됩니다.
-   **단방향 의존성**: 하위 레이어만 참조 가능하여 순환 참조가 원천 차단됩니다.
-   **슬라이스 기반 모듈화**: 독립적인 기능 단위로 분리되어 병렬 개발과 재사용이 용이합니다.
-   **명시적 Public API**: index.ts를 통한 re-export로 내부 구현과 공개 인터페이스가 분리됩니다.
-   **확장 용이성**: 새 기능 추가 시 기존 코드 수정 없이 새로운 슬라이스를 추가하는 방식으로 확장됩니다.

이러한 구조는 대규모 프론트엔드 애플리케이션의 복잡도를 관리하고, 팀 협업 효율성을 높이며, 장기적인 유지보수 비용을 절감하는 데 효과적입니다.

## 참고

-   [Feature-Sliced Design 공식 문서](https://feature-sliced.design/)
-   [FSD GitHub Repository](https://github.com/feature-sliced/documentation)
-   [FSD Best Practices](https://feature-sliced.design/docs/guides/examples/auth)
