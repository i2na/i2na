# Blog Client FSD 리팩토링 계획

> 네이밍 규칙은 [NAMING_CONVENTIONS.md](./NAMING_CONVENTIONS.md)를 참조하세요.

### 주요 기능 분석

-   **인증**: Google OAuth를 통한 사용자 인증
-   **게시물 목록**: 공개/비공개 게시물 목록 조회
-   **게시물 보기**: 마크다운 게시물 상세 보기
-   **마크다운 렌더링**: react-markdown을 사용한 마크다운 렌더링
-   **목차**: 게시물의 목차 추출 및 네비게이션

## FSD 구조 개요

### FSD 레이어 구조

```
src/
├── app/                       # 앱 초기화 및 설정
├── pages/                     # 페이지 컴포넌트
├── widgets/                   # 복합 UI 블록
├── features/                   # 비즈니스 기능
├── entities/                   # 비즈니스 엔티티
└── shared/                    # 공유 리소스
```

### 각 레이어의 역할

#### app/

-   앱 초기화, 라우팅 설정, 전역 프로바이더
-   **파일**: `App.tsx`, `main.tsx`, `providers/`

#### pages/

-   라우트와 연결된 페이지 컴포넌트
-   **파일**: `list/`, `view/`, `auth-callback/`

#### entities/

-   **정의**: 비즈니스 도메인의 핵심 개념과 데이터 모델
-   **포함 내용**: 타입 정의, 기본 CRUD API, 도메인 로직
-   **특징**: 비즈니스 규칙과 무관한 순수한 데이터 구조
-   **예시**: `post/` (게시물 타입, 기본 조회 API), `user/` (사용자 타입, 기본 조회 API)

#### features/

-   **정의**: 사용자 액션과 비즈니스 시나리오를 구현하는 기능 단위
-   **포함 내용**: 사용자와의 상호작용, 비즈니스 로직, 상태 관리
-   **특징**: 특정 사용자 시나리오를 완성하는 기능
-   **예시**: `auth/` (로그인/로그아웃), `post-list/` (게시물 목록 조회), `post-view/` (게시물 상세 조회)

#### widgets/

-   **정의**: 여러 features/entities를 조합한 독립적인 복합 UI 블록
-   **포함 내용**: 여러 기능을 통합한 재사용 가능한 UI 컴포넌트
-   **특징**: 페이지에서 직접 사용할 수 있는 완성된 UI 블록
-   **예시**: `post-list/` (게시물 목록 위젯), `post-content/` (게시물 콘텐츠 위젯)

#### shared/

-   재사용 가능한 공유 리소스
-   **하위 디렉토리**: `ui/`, `lib/`, `api/`, `config/`, `types/`, `styles/`

### 레이어 구분 기준

#### entities vs features vs widgets

**entities (엔티티)**

-   **목적**: 비즈니스 도메인의 핵심 개념을 표현
-   **특징**:
    -   비즈니스 규칙과 무관한 순수한 데이터 구조
    -   여러 features에서 재사용 가능한 도메인 모델
    -   기본적인 CRUD 연산만 포함
-   **예시**: `post/` (게시물 타입, 기본 조회), `user/` (사용자 타입, 기본 조회)
-   **판단 기준**: "이것은 무엇인가?" (What is it?)

**features (기능)**

-   **목적**: 사용자 액션과 비즈니스 시나리오를 구현
-   **특징**:
    -   특정 사용자 시나리오를 완성하는 기능
    -   비즈니스 로직과 상태 관리 포함
    -   사용자와의 상호작용 처리
-   **예시**: `auth/` (로그인/로그아웃), `post-list/` (게시물 목록 조회), `post-view/` (게시물 상세 조회)
-   **판단 기준**: "사용자가 무엇을 할 수 있는가?" (What can user do?)

**widgets (위젯)**

-   **목적**: 여러 features/entities를 조합한 독립적인 UI 블록
-   **특징**:
    -   페이지에서 직접 사용할 수 있는 완성된 UI 컴포넌트
    -   여러 기능을 통합한 재사용 가능한 블록
    -   독립적으로 동작 가능
-   **예시**: `post-list/` (게시물 목록 위젯), `post-content/` (게시물 콘텐츠 위젯)
-   **판단 기준**: "이것은 완성된 UI 블록인가?" (Is it a complete UI block?)

#### 구분 예시

**게시물(Post) 관련**

-   `entities/post/`: Post 타입, 기본 `getPost()` API
-   `features/post-list/`: 게시물 목록 조회 기능 (필터링, 정렬 등)
-   `features/post-view/`: 게시물 상세 조회 기능 (권한 확인 등)
-   `widgets/post-list/`: 게시물 목록 UI 위젯
-   `widgets/post-content/`: 게시물 콘텐츠 UI 위젯

**인증(Auth) 관련**

-   `entities/user/`: User 타입, 기본 `getUser()` API
-   `features/auth/`: 로그인/로그아웃 기능 (OAuth 처리, 상태 관리)
-   `widgets/post-list/Header`: 인증 상태를 표시하는 UI (features/auth 사용)

## 세부 리팩토링 계획

### 1. app/ 레이어

#### 구조

```
app/
├── App.tsx                    # 라우팅 설정
├── main.tsx                   # 진입점
└── providers/
    └── router.tsx            # RouterProvider (선택사항)
```

#### 변경 사항

-   `App.tsx`: 라우팅만 담당, 비즈니스 로직 제거
-   `main.tsx`: 그대로 유지
-   전역 설정 (Toaster 등)은 App.tsx에 유지

### 2. pages/ 레이어

#### 구조

```
pages/
├── list/
│   ├── ui/
│   │   ├── List.tsx
│   │   └── List.module.scss
│   └── index.ts
├── view/
│   ├── ui/
│   │   ├── View.tsx
│   │   └── View.module.scss
│   └── index.ts
└── auth-callback/
    ├── ui/
    │   ├── AuthCallback.tsx
    │   └── AuthCallback.module.scss
    └── index.ts
```

#### 변경 사항

-   각 페이지는 widgets와 features를 조합하여 구성
-   페이지 자체는 최소한의 로직만 포함
-   스타일 파일은 각 페이지의 `ui/` 디렉토리로 이동
-   `view` 페이지는 `Toolbar`와 `Content` 위젯을 직접 조합하여 사용

### 3. widgets/ 레이어

#### 구조

```
widgets/
├── post-list/
│   ├── ui/
│   │   ├── List.tsx              # 게시물 목록 표시
│   │   ├── List.module.scss
│   │   ├── Header.tsx            # 인증 상태 및 로그인/로그아웃
│   │   └── Header.module.scss
│   └── index.ts
└── post-content/
    ├── ui/
    │   ├── Content.tsx            # 마크다운 렌더링 (HeaderLinkButton 내부 사용)
    │   ├── Content.module.scss
    │   ├── HeaderLinkButton.tsx  # Content 내부에서만 사용
    │   ├── HeaderLinkButton.module.scss
    │   ├── Toolbar.tsx           # 뒤로가기, 공유, TableOfContentsButton 조합
    │   ├── Toolbar.module.scss
    │   ├── TableOfContentsButton.tsx    # 목차 버튼
    │   ├── TableOfContentsButton.module.scss
    │   ├── TableOfContentsPopover.tsx   # 목차 팝오버
    │   └── TableOfContentsPopover.module.scss
    └── index.ts
```

#### 위젯 설명 및 컴포넌트 관계

-   **post-list**: 게시물 목록 표시 위젯

    -   `List.tsx`: 게시물 목록 메인 컴포넌트
    -   `Header.tsx`: 인증 상태 및 로그인/로그아웃 버튼

-   **post-content**: 게시물 콘텐츠 표시 위젯
    -   `Content.tsx`: 마크다운 렌더링, 내부에서 `HeaderLinkButton` 사용
    -   `HeaderLinkButton.tsx`: Content 내부에서만 사용되는 헤더 링크 버튼
    -   `Toolbar.tsx`: 뒤로가기, 공유, `TableOfContentsButton`을 조합
    -   `TableOfContentsButton.tsx`: 목차 버튼 (클릭 시 팝오버 표시)
    -   `TableOfContentsPopover.tsx`: 목차 팝오버 (버튼에서 제어)

#### Import 관계

-   `Toolbar.tsx`가 `TableOfContentsButton`과 `TableOfContentsPopover`를 조합
-   `Content.tsx`가 `HeaderLinkButton`을 내부에서 직접 사용
-   페이지에서 `Toolbar`와 `Content`를 직접 조합하여 사용

### 4. features/ 레이어

#### 구조

```
features/
├── auth/
│   ├── model/
│   │   ├── types.ts
│   │   └── index.ts
│   ├── api/
│   │   └── auth.ts
│   └── lib/
│       └── utils.ts
├── post-list/
│   ├── model/
│   │   ├── types.ts
│   │   └── index.ts
│   └── api/
│       └── post-list.ts
└── post-view/
    ├── model/
    │   ├── types.ts
    │   └── index.ts
    └── api/
        └── post-view.ts
```

#### 기능 설명

-   **auth**: 인증 관련 로직 (로그인, 로그아웃, 인증 상태 확인)
-   **post-list**: 게시물 목록 조회 기능
-   **post-view**: 게시물 상세 조회 기능

### 5. entities/ 레이어

#### 구조

```
entities/
├── post/
│   ├── model/
│   │   ├── types.ts
│   │   └── index.ts
│   ├── api/
│   │   └── post.ts
│   └── lib/
│       ├── markdown.ts
│       └── toc.ts
└── user/
    ├── model/
    │   ├── types.ts
    │   └── index.ts
    └── lib/
        └── user.ts
```

#### 엔티티 설명

-   **post**: 게시물 엔티티 (타입, API, 마크다운 처리, 목차 추출)
-   **user**: 사용자 엔티티 (타입, 유틸리티)

### 6. shared/ 레이어

#### 구조

```
shared/
├── lib/
│   └── scroll/
│       ├── smooth-scroll.ts
│       └── index.ts
├── api/
│   └── client.ts             # API 클라이언트 설정
├── config/
│   └── constants.ts
├── types/
│   └── index.ts
└── styles/
    ├── base.scss
    ├── index.scss
    ├── markdown.scss
    ├── mixins.scss
    └── variables.scss
```

#### 설명

-   **lib/**: 순수 함수 유틸리티 (스크롤 등)
-   **api/**: API 클라이언트 설정 (필요시)
-   **config/**: 설정 파일
-   **types/**: 공통 타입 (필요시)
-   **styles/**: 전역 스타일

**참고**:

-   `Content` (기존 MarkdownViewer)와 `HeaderLinkButton`은 게시물 콘텐츠에서만 사용되므로 `widgets/post-content/`에 위치
-   `TableOfContents`는 버튼과 팝오버로 분리하여 `widgets/post-content/`에 위치

### 마이그레이션 순서

리팩토링은 다음 순서로 진행:

1.  **shared/ 레이어 구성**

    -   `shared/config/constants.ts` 이동
    -   `shared/types/` 타입 정의 정리
    -   `shared/lib/scroll/` 이동
    -   `shared/styles/` 이동

2.  **entities/ 레이어 구성**

    -   `entities/post/` 생성 (타입, API, 마크다운/목차 유틸리티)
    -   `entities/user/` 생성 (타입, 유틸리티)

3.  **features/ 레이어 구성**

    -   `features/auth/` 생성 (인증 관련 로직)
    -   `features/post-list/` 생성 (게시물 목록 조회)
    -   `features/post-view/` 생성 (게시물 상세 조회)

4.  **widgets/ 레이어 구성**

    -   `widgets/post-list/` 생성 (List, Header)
    -   `widgets/post-content/` 생성 (Content, HeaderLinkButton, Toolbar, TableOfContentsButton, TableOfContentsPopover)

5.  **pages/ 레이어 리팩토링**

    -   `pages/list/` 리팩토링
    -   `pages/view/` 리팩토링
    -   `pages/auth-callback/` 리팩토링

6.  **app/ 레이어 정리**
    -   `app/App.tsx` 리팩토링
    -   `app/main.tsx` 이동

### 주의사항

#### Import 경로

-   FSD 구조에서는 상위 레이어가 하위 레이어를 import할 수 있음
-   같은 레이어 내에서는 import 금지
-   `shared/`는 모든 레이어에서 import 가능
-   같은 세그먼트(`ui/`) 내에서는 메인 컴포넌트가 하위 컴포넌트를 import하되, 하위 컴포넌트 간 직접 import는 지양

#### 파일 구조 규칙

-   각 슬라이스는 `ui/`, `model/`, `api/`, `lib/` 등의 세그먼트를 가질 수 있음
-   `index.ts`를 통해 public API 노출
-   스타일 파일은 해당 컴포넌트와 같은 디렉토리에 위치

#### 타입 정의

-   **entities/**: 도메인 엔티티의 타입 정의 (예: `Post`, `User`)
-   **features/**: 기능별 비즈니스 로직 타입 (예: 인증 상태, 게시물 목록 필터)
-   **shared/types/**: 공통으로 사용되는 타입 (예: `TocItem`, 공통 인터페이스)

#### API 호출

-   **entities/**: 도메인 엔티티의 기본 CRUD 작업 (예: `getPost()`, `getUser()`)
-   **features/**: 비즈니스 로직이 포함된 API 호출 (예: `login()`, `fetchPostList()`)
-   **shared/api/**: 공통 API 클라이언트 설정

#### 스타일 파일

-   컴포넌트별 스타일: 컴포넌트와 같은 디렉토리
-   전역 스타일: `shared/styles/`
-   SCSS 모듈 사용 유지

#### 점진적 마이그레이션

-   한 번에 모든 것을 변경하지 않고 단계적으로 진행
-   각 Phase 완료 후 테스트 및 검증
