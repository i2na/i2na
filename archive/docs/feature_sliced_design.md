<sub>2025.12.28 19:07</sub>

<sub>2025.12.28 19:05</sub>

<sub>2025.12.28 18:58</sub>

# Feature-Sliced Design

## 개요

Feature-Sliced Design(FSD)은 프론트엔드 애플리케이션의 코드를 비즈니스 가치와 기술적 목적에 따라 계층화하여 관리하는 아키텍처 방법론입니다. 명확한 의존성 규칙과 레이어 분리를 통해 확장 가능하고 유지보수하기 쉬운 코드베이스를 구축할 수 있습니다. 각 레이어는 특정 책임을 가지며, 단방향 의존성 원칙을 따릅니다.

## 주요 내용

### 레이어 구조

FSD는 6개의 표준화된 레이어로 구성됩니다. 각 레이어는 명확한 책임과 범위를 가지며, 계층 간 의존성 규칙을 준수해야 합니다.

```
app/           애플리케이션 초기화 및 전역 설정
pages/         라우팅 단위의 페이지 구성
widgets/       독립적인 복합 UI 블록
features/      사용자 인터랙션 및 비즈니스 기능
entities/      비즈니스 도메인 모델 및 데이터
shared/        프로젝트 전역 공통 코드
```

### 의존성 규칙

FSD의 핵심은 명확한 단방향 의존성입니다. 상위 레이어는 하위 레이어를 import할 수 있지만, 역방향은 금지됩니다.

```
app → pages → widgets → features → entities → shared
```

이 규칙은 순환 참조를 원천 차단하고, 코드 변경 시 영향 범위를 예측 가능하게 만듭니다. 같은 레이어 내의 슬라이스 간 직접 import도 금지되며, 필요한 경우 하위 레이어로 내려야 합니다.

### 레이어별 상세 책임

#### app

애플리케이션의 진입점으로, 전역적인 설정과 초기화를 담당합니다.

-   Router 설정 및 route 정의
-   전역 Provider 설정 (Theme, Store, i18n 등)
-   전역 에러 바운더리
-   애플리케이션 수준의 사이드 이펙트

```typescript
// app/index.tsx
import { RouterProvider } from "react-router-dom";
import { router } from "./providers/router";

export function App() {
    return <RouterProvider router={router} />;
}
```

#### pages

URL 경로와 1:1로 매핑되는 페이지 컴포넌트입니다. widgets와 features를 조합하여 완전한 화면을 구성합니다.

-   URL route와 매핑
-   SEO 메타데이터 설정
-   페이지 수준의 데이터 로딩
-   Layout 적용

```typescript
// pages/blogPost/ui/BlogPostPage.tsx
import { BlogPostContent } from "@/features/blogPost";
import { Navbar } from "@/widgets/navbar";
import { Footer } from "@/widgets/footer";

export function BlogPostPage() {
    return (
        <>
            <Navbar />
            <BlogPostContent />
            <Footer />
        </>
    );
}
```

#### widgets

독립적으로 동작 가능한 복합 UI 블록입니다. 여러 features를 조합하여 완전한 기능 단위를 제공합니다.

-   독립적인 UI 블록
-   여러 features 조합
-   재사용 가능한 섹션
-   자체 상태 관리 가능

```typescript
// widgets/blogPreview/ui/BentoGrid.tsx
import { BlogList } from "@/features/blogList";
import { useBlogPosts } from "@/entities/blog/api";

export function BentoGrid() {
    const posts = useBlogPosts({ limit: 3 });

    return (
        <section>
            <h2>Recent Posts</h2>
            <BlogList posts={posts} />
        </section>
    );
}
```

#### features

사용자의 행동에 반응하는 비즈니스 기능입니다. UI와 비즈니스 로직이 결합된 기능 단위를 제공합니다.

-   사용자 인터랙션 처리
-   비즈니스 로직 구현
-   상태 관리
-   entities의 데이터 활용

```typescript
// features/blogList/ui/BlogList.tsx
import type { IBlogListProps } from "../model";
import { BlogPostItem } from "./BlogPostItem";

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

비즈니스 도메인의 핵심 데이터 모델입니다. 애플리케이션의 비즈니스 개념을 표현하며, 다른 레이어에서 재사용됩니다.

-   도메인 데이터 타입 정의
-   API 통신 로직
-   데이터 변환 및 검증
-   도메인 유틸리티 함수

```typescript
// entities/blog/model/types.ts
export interface IPost {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    tags: string[];
}

export interface IPostMeta {
    id: string;
    title: string;
    excerpt: string;
    createdAt: Date;
}
```

```typescript
// entities/blog/api/index.ts
export async function fetchPost(id: string): Promise<IPost> {
    const response = await fetch(`/api/posts/${id}`);
    return response.json();
}
```

#### shared

프로젝트 전체에서 사용하는 공통 코드입니다. 비즈니스 로직과 무관한 재사용 가능한 코드를 포함합니다.

-   UI 컴포넌트 라이브러리
-   유틸리티 함수
-   공통 타입 정의
-   전역 스타일 및 테마

```typescript
// shared/lib/date/index.ts
export function formatDate(date: Date): string {
    return new Intl.DateTimeFormat("ko-KR").format(date);
}
```

### 슬라이스 구조

각 레이어는 슬라이스(slice)로 구성되며, 슬라이스는 특정 기능이나 도메인을 캡슐화합니다. 슬라이스는 세그먼트(segment)로 나뉩니다.

```
features/blogList/
  ├─ ui/              UI 컴포넌트
  │  ├─ BlogList.tsx
  │  ├─ BlogList.module.scss
  │  └─ BlogPostItem.tsx
  ├─ model/           비즈니스 로직 및 타입
  │  ├─ index.ts
  │  └─ types.ts
  └─ api/             API 통신 (선택적)
     └─ index.ts
```

#### 세그먼트 역할

-   **ui**: React 컴포넌트와 스타일
-   **model**: 타입 정의, 상태 관리, 비즈니스 로직
-   **api**: 서버 통신 및 데이터 fetching
-   **lib**: 슬라이스 내부 유틸리티 함수
-   **config**: 슬라이스 설정 값

### Public API 패턴

각 슬라이스는 `index.ts`를 통해 public API를 노출합니다. 이를 통해 내부 구현을 캡슐화하고 명확한 인터페이스를 제공합니다.

```typescript
// features/blogList/model/index.ts
export type { IBlogListProps, TPostDisplay } from "./types";
export { filterPostsByTag } from "./utils";
```

```typescript
// features/blogList/ui/index.ts
export { BlogList } from "./BlogList";
```

사용 시에는 세그먼트까지만 import 경로에 포함합니다.

```typescript
// 권장
import { BlogList } from "@/features/blogList/ui";
import type { IBlogListProps } from "@/features/blogList/model";

// 비권장
import { BlogList } from "@/features/blogList/ui/BlogList";
```

### 타입 시스템 통합

#### 타입 배치 원칙

타입은 해당 레이어의 `model/types.ts`에 정의하며, `model/index.ts`를 통해 re-export합니다.

```typescript
// entities/blog/model/types.ts
export interface IPost {
    id: string;
    title: string;
    content: string;
}

// entities/blog/model/index.ts
export type { IPost, IPostMeta } from "./types";
```

#### 명명 규칙

-   Interface: `I` 접두사 (예: `IPost`, `IUser`)
-   Type alias: `T` 접두사 (예: `TStatus`, `TPostDisplay`)
-   Props: 컴포넌트명 + `Props` (예: `IBlogListProps`)
-   Enum: Pascal Case (예: `PostStatus`)

```typescript
interface IPost {}
type TPostStatus = "draft" | "published";
interface IBlogListProps {}
enum PostStatus {
    Draft = "draft",
    Published = "published",
}
```

### 구현 패턴

#### Cross-Imports

같은 레이어 내 슬라이스 간 직접 import는 금지됩니다. 공통 로직은 하위 레이어로 이동시켜야 합니다.

```typescript
// 잘못된 예: features 간 직접 import
import { commentUtils } from "@/features/comments/lib";

// 올바른 예: shared로 이동
import { commentUtils } from "@/shared/lib/comments";
```

#### 데이터 흐름

데이터는 상위 레이어에서 하위 레이어로 props를 통해 전달됩니다.

```typescript
// pages/blogPost/ui/BlogPostPage.tsx
const post = usePost(postId);

return <BlogPostContent post={post} />;

// features/blogPost/ui/BlogPostContent.tsx
export function BlogPostContent({ post }: { post: IPost }) {
    return <article>{post.content}</article>;
}
```

#### 새 기능 추가 절차

```
1. entities/comment/model/types.ts        도메인 모델 정의
2. entities/comment/api/index.ts          API 로직 구현
3. features/commentList/model/types.ts    Props 및 내부 타입 정의
4. features/commentList/ui/CommentList    UI 컴포넌트 구현
5. widgets/postDetail/ui/PostDetail       상위 레이어에서 조합
6. pages/blogPost/ui/BlogPostPage         페이지에 통합
```

### 실전 사례

#### 블로그 시스템 구조

```
entities/blog/
  ├─ model/
  │  ├─ types.ts          IPost, IPostMeta 정의
  │  └─ index.ts
  └─ api/
     ├─ index.ts          fetchPost, fetchPosts 구현
     └─ index.ts

features/blogList/
  ├─ model/
  │  ├─ types.ts          IBlogListProps 정의
  │  └─ index.ts
  └─ ui/
     ├─ BlogList.tsx      목록 표시
     ├─ BlogPostItem.tsx  개별 아이템
     └─ index.ts

features/blogPost/
  ├─ model/
  │  └─ types.ts          IBlogPostContentProps
  └─ ui/
     └─ BlogPostContent.tsx

widgets/blogPreview/
  └─ ui/
     └─ BentoGrid.tsx     BlogList 조합

pages/blogArchive/
  └─ ui/
     └─ BlogArchivePage.tsx    Navbar + BentoGrid + Footer
```

### 안티패턴

#### Prop Drilling 회피

여러 레이어를 거쳐 props를 전달하는 대신, 적절한 레이어에서 직접 데이터를 fetching합니다.

```typescript
// 비권장: prop drilling
<Page data={data}>
  <Widget data={data}>
    <Feature data={data} />

// 권장: 필요한 레이어에서 직접 fetch
function Feature() {
  const data = useData();
  return <div>{data}</div>;
}
```

#### 레이어 역전

하위 레이어가 상위 레이어를 import하는 것은 금지됩니다.

```typescript
// 잘못됨
// entities/blog/api/index.ts
import { handleError } from "@/features/errorHandling";

// 올바름
// entities/blog/api/index.ts
import { handleError } from "@/shared/lib/errors";
```

#### 비대한 shared

shared에 비즈니스 로직을 포함시키지 않습니다. shared는 도메인과 무관한 순수 유틸리티만 포함해야 합니다.

```typescript
// 잘못됨: shared에 비즈니스 로직
// shared/lib/blog.ts
export function calculateReadTime(post: IPost) {}

// 올바름: entities로 이동
// entities/blog/lib/index.ts
export function calculateReadTime(post: IPost) {}
```

## 요약

Feature-Sliced Design은 명확한 레이어 분리와 단방향 의존성을 통해 확장 가능한 프론트엔드 아키텍처를 제공합니다. 6개의 표준 레이어(app, pages, widgets, features, entities, shared)는 각각 명확한 책임을 가지며, 상위 레이어만 하위 레이어를 참조할 수 있습니다. 슬라이스와 세그먼트 구조를 통해 코드를 모듈화하고, Public API 패턴으로 캡슐화를 보장합니다. 이를 통해 코드 변경의 영향 범위를 예측 가능하게 만들고, 여러 개발자가 동시에 작업할 수 있는 환경을 제공합니다.

## 참고

-   [Feature-Sliced Design 공식 문서](https://feature-sliced.design/)
-   [FSD GitHub](https://github.com/feature-sliced/documentation)
-   [FSD Examples](https://github.com/feature-sliced/examples)
