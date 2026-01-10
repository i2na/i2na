# 프로젝트 네이밍 규칙

## 파일명

### 일반 파일 (.ts, .js, .json)

-   **규칙**: kebab-case
-   **예시**: `user-service.ts`, `api-client.ts`, `constants.ts`

### 컴포넌트 파일 (.tsx, .jsx)

-   **규칙**: PascalCase
-   **제약**: 파일명과 컴포넌트명 일치
-   **예시**: `UserProfile.tsx` → `export function UserProfile()`

### 스타일 파일

-   **일반 스타일** (.scss, .css): kebab-case
    -   예시: `base.scss`, `variables.scss`
-   **모듈 스타일** (.module.scss, .module.css): PascalCase (컴포넌트 파일명과 동일)
    -   예시: `UserProfile.tsx` → `UserProfile.module.scss`

### 특수 파일

-   진입점: `App.tsx`, `main.tsx` (대문자 유지)
-   인덱스: `index.ts`, `index.tsx` (소문자 유지)

## 코드 네이밍

### 컴포넌트명

-   **규칙**: PascalCase, 파일명과 일치
-   **예시**:
    ```tsx
    // UserProfile.tsx
    export function UserProfile() { ... }
    ```

### 함수 및 변수

-   **규칙**: camelCase
-   **예시**: `getUserData()`, `isLoading`, `handleClick()`

### 상수

-   **규칙**: UPPER_SNAKE_CASE
-   **예시**: `API_BASE_URL`, `MAX_RETRY_COUNT`

### Private 멤버

-   **규칙**: `_` + camelCase
-   **예시**: `_privateMethod()`, `_internalState`

### 내부 헬퍼 함수

-   **규칙**: `_` + camelCase (export 없음)
-   **예시**: `_formatDate()`, `_validateInput()`

### 타입

-   **Interface**: `I` + PascalCase
    -   예시: `IProduct`, `IUser`, `IProductListProps`, `IApiResponse`, `IFormData`
-   **Type alias**: `T` + PascalCase
    -   예시: `TStatus`, `TProductFilter`, `TUserRole`, `THttpMethod`, `TEventType`
-   **Enum**: `E` + PascalCase
    -   예시: `EProductStatus`, `EUserRole`, `EHttpStatus`, `EOrderState`
-   **Generic 타입 파라미터**: 단일 대문자 또는 대문자 + PascalCase
    -   단일 대문자: `T`, `K`, `V` (간단한 경우)
    -   대문자 + PascalCase: `TData`, `TResponse`, `TKey`, `TValue` (명확함이 필요한 경우)
-   **Props 타입**: 컴포넌트명 + `Props`
    -   예시: `UserProfileProps`, `ProductCardProps`, `ButtonProps`

## 네이밍 원칙

### 폴더명 중복 제거

파일명에 폴더명을 중복하지 않음.

-   올바름: `entities/user/api/user.ts`
-   잘못됨: `entities/user/api/userApi.ts`

### 접미사 제거

폴더 구조로 목적이 명확한 경우 접미사 제거.

-   올바름: `utils/date.ts`, `api/auth.ts`
-   잘못됨: `utils/dateUtils.ts`, `api/authService.ts`
