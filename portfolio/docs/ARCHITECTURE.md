# 프로젝트 아키텍처

## Feature-Sliced Design (FSD)

이 프로젝트는 Feature-Sliced Design 아키텍처를 따릅니다.  
코드를 비즈니스 가치와 기술적 목적에 따라 계층화하여 관리하는 방법론입니다.

## 레이어 구조

```
app/           애플리케이션 진입점 및 전역 설정
pages/         라우팅 단위의 페이지 조합
widgets/       독립적인 복합 UI 컴포넌트
features/      사용자 인터랙션 기능
entities/      비즈니스 엔티티 및 데이터 모델
shared/        재사용 가능한 공통 코드
```

### 의존성 규칙

```
app → pages → widgets → features → entities → shared
```

하위 레이어는 상위 레이어를 참조할 수 없습니다.

## 레이어별 책임

### app

-   애플리케이션 초기화
-   라우터, Provider 등 전역 설정
-   진입점: `app/index.tsx`

### pages

-   URL 경로와 매핑
-   widgets, features를 조합하여 화면 구성
-   예: `BlogPostPage`, `BlogArchivePage`, `LandingPage`

### widgets

-   독립적으로 동작하는 UI 블록
-   여러 features를 조합 가능
-   예: `Navbar`, `Footer`, `HeroSection`, `BentoGrid`

### features

-   사용자 행동에 반응하는 비즈니스 기능
-   UI와 로직이 결합된 기능 단위
-   예: `BlogList`, `BlogPostContent`, `ChatWidget`

### entities

-   비즈니스 도메인의 핵심 데이터 모델
-   재사용 가능한 엔티티와 API
-   예: `blog` (IPost, IPostMeta, API)

### shared

-   프로젝트 전체에서 사용하는 공통 코드
-   UI 컴포넌트, 유틸리티, 타입, 스타일
-   예: `BackButton`, `Icons`, 날짜 포맷 함수

## 슬라이스 구조

각 레이어는 슬라이스(slice)로 나뉘며, 슬라이스는 다음 세그먼트로 구성됩니다:

```
features/blogList/
  ├─ ui/           React 컴포넌트
  ├─ model/        타입, 비즈니스 로직, 상태
  └─ api/          서버 통신 (선택적)
```

### 세그먼트 역할

-   **ui**: UI 컴포넌트
-   **model**: 타입 정의, 비즈니스 로직, 상태 관리
-   **api**: 백엔드 API 호출

## 타입 관리

### 배치 원칙

타입은 해당 레이어의 `model/types.ts`에 정의합니다.

```
entities/blog/model/types.ts      → IPost, IPostMeta
features/blogList/model/types.ts  → TPostDisplay, IBlogListProps
widgets/navbar/model/types.ts     → INavbarProps
shared/types/index.ts             → Theme, IMessage
```

### 명명 규칙

```typescript
interface IPost {} // Interface: I 접두사
type TPostDisplay = {}; // Type alias: T 접두사
interface IBlogListProps {} // Props: 컴포넌트명 + Props
```

### Import 패턴

`model/index.ts`를 통한 re-export 사용:

```typescript
// 권장
import type { IPost } from "@/entities/blog/model";

// 비권장
import type { IPost } from "@/entities/blog/model/types";
```

## 구현 가이드라인

### 새 기능 추가

```
1. entities/comment/model/types.ts        데이터 모델 정의
2. features/commentList/model/types.ts    Props 타입 정의
3. features/commentList/ui/CommentList    컴포넌트 구현
4. widgets/postDetail/ui/PostDetail       상위 레이어에서 조합
```

### 타입 추가 절차

```typescript
// 1. 타입 정의
// features/commentList/model/types.ts
export interface ICommentListProps {
    postId: string;
    onCommentAdd: (text: string) => void;
}

// 2. Re-export
// features/commentList/model/index.ts
export type { ICommentListProps } from "./types";

// 3. 사용
// features/commentList/ui/CommentList.tsx
import type { ICommentListProps } from "../model";

export function CommentList({ postId, onCommentAdd }: ICommentListProps) {
    // 구현
}
```

## 현 구조의 장점

### 명확한 관심사 분리

레이어별 책임이 명확히 정의되어 있어 코드의 역할과 위치를 직관적으로 파악할 수 있습니다.  
비즈니스 로직(entities), 기능 구현(features), UI 조합(widgets)이 물리적으로 분리되어 있어 코드 탐색 시간이 단축됩니다.

### 단방향 의존성

하위 레이어만 참조 가능한 규칙으로 순환 참조가 원천 차단됩니다.  
의존성 그래프가 단순해져 코드 변경 시 영향 범위를 명확하게 예측할 수 있으며, 리팩토링 부담이 감소합니다.

### 확장성 및 재사용성

새로운 기능 추가 시 기존 코드 수정 없이 새로운 슬라이스를 추가하는 방식으로 확장합니다.  
entities와 features는 여러 pages와 widgets에서 재사용 가능하며, 중복 코드가 최소화됩니다.

### 협업 효율성

레이어별로 작업 범위가 구분되어 여러 개발자가 동시에 작업할 때 충돌이 적습니다.  
코드 리뷰 시 변경된 레이어만 집중적으로 검토할 수 있어 리뷰 품질이 향상됩니다.

### 테스트 용이성

각 레이어와 슬라이스가 독립적이므로 단위 테스트 작성이 수월합니다.  
하위 레이어부터 순차적으로 테스트를 구축할 수 있으며, 목(Mock) 객체 의존도가 낮습니다.
