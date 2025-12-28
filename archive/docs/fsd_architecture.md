---
title: fsd_architecture
tags:
  - FSD
  - Feature-Sliced Design
  - 아키텍처
  - 프론트엔드
sources:
  - 'https://feature-sliced.design/'
  - 'https://feature-sliced.design/docs/get-started/overview'
created: '2025-12-28'
---

# fsd_architecture

## 개요

Feature-Sliced Design(FSD)은 프론트엔드 애플리케이션의 코드를 비즈니스 가치와 기술적 목적에 따라 계층화하여 관리하는 아키텍처 방법론입니다. 각 레이어는 명확한 책임을 가지며, 단방향 의존성 규칙을 통해 순환 참조를 방지하고 코드의 확장성과 유지보수성을 향상시킵니다.

## 주요 내용

### 레이어 구조

FSD는 6개의 레이어로 구성되며, 각 레이어는 특정 책임을 담당합니다:

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

하위 레이어는 상위 레이어를 참조할 수 없으며, 이는 순환 참조를 원천 차단하고 의존성 그래프를 단순화합니다.

### 레이어별 책임

**app**: 라우터, Provider 등 전역 설정 및 애플리케이션 초기화

**pages**: URL 경로와 매핑되며 widgets와 features를 조합하여 화면 구성

**widgets**: 여러 features를 조합하여 독립적으로 동작하는 UI 블록 구성

**features**: 사용자 행동에 반응하는 비즈니스 기능, UI와 로직이 결합된 기능 단위

**entities**: 비즈니스 도메인의 핵심 데이터 모델 및 재사용 가능한 API

**shared**: 프로젝트 전체에서 사용하는 UI 컴포넌트, 유틸리티, 타입, 스타일

### 슬라이스 구조

각 레이어는 슬라이스(slice)로 나뉘며, 슬라이스는 세그먼트로 구성됩니다:

```
features/blogList/
  ├─ ui/           React 컴포넌트
  ├─ model/        타입, 비즈니스 로직, 상태
  └─ api/          서버 통신 (선택적)
```

### 타입 관리

타입은 해당 레이어의 `model/types.ts`에 정의하고, `model/index.ts`를 통해 re-export합니다:

```typescript
// 타입 정의
export interface IPost {} // Interface: I 접두사
export type TPostDisplay = {}; // Type alias: T 접두사
export interface IBlogListProps {} // Props: 컴포넌트명 + Props

// Import 패턴
import type { IPost } from "@/entities/blog/model";
```

### 구현 절차

새 기능 추가 시 하위 레이어부터 순차적으로 구현합니다:

```
1. entities/comment/model/types.ts        데이터 모델 정의
2. features/commentList/model/types.ts    Props 타입 정의
3. features/commentList/ui/CommentList    컴포넌트 구현
4. widgets/postDetail/ui/PostDetail       상위 레이어에서 조합
```

## 요약

FSD는 명확한 관심사 분리와 단방향 의존성을 통해 코드의 역할과 위치를 직관적으로 파악할 수 있게 합니다. 레이어별 작업 범위가 구분되어 협업 효율성이 높으며, 각 슬라이스가 독립적이므로 테스트 작성이 용이합니다. 새로운 기능 추가 시 기존 코드 수정 없이 새로운 슬라이스를 추가하여 확장할 수 있어, 유지보수성과 확장성이 뛰어난 구조를 제공합니다.

## 참고

-   Feature-Sliced Design 공식 문서: https://feature-sliced.design/
-   FSD Overview: https://feature-sliced.design/docs/get-started/overview
-   FSD Reference: https://feature-sliced.design/docs/reference
