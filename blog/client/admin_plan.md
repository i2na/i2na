# Admin 기능 구현 계획

## 개요

블로그 게시물을 관리하기 위한 Admin 기능을 추가합니다. Admin 권한은 특정 이메일로 로그인한 사용자에게만 부여되며, ViewPage 상단바에 톱니바퀴 버튼을 추가하고 클릭 시 `/게시물/setting` 페이지로 이동하여 모든 Admin 기능을 제공합니다.

## Admin 권한 및 상태 관리

-   i2na-blog-md 레포에 `email.yaml` 파일 생성
-   로그인한 사용자의 이메일이 `email.yaml`의 `admin` 섹션에 포함되어 있으면 Admin 권한 부여
-   Private 게시물의 경우, `admin` 섹션에 있는 이메일은 자동으로 접근 권한 부여 (별도 지정 불필요)
-   Admin 상태는 로그인 후 zustand로 전역 관리 (ListPage, ViewPage에서 공통 사용)
-   초기 로그인 시 Admin 여부 확인 후 상태 저장

## 이메일 파일 구조

```
i2na-blog-md/
├── email.yaml             # Admin 이메일 및 이메일 아카이브
└── [게시물 md 파일들]
```

**파일 형식** (`email.yaml`):

```yaml
admin:
    - admin1@gmail.com
    - admin2@gmail.com

archive:
    - user1@gmail.com
    - user2@gmail.com
    - user3@gmail.com
```

-   `admin`: Admin 이메일 목록 (Admin 권한 확인 및 Private 게시물 자동 접근 권한 부여에 사용)
-   `archive`: 이메일 아카이브 목록 (이메일 추가 시 검색 및 선택에 사용)
-   파일은 수동으로 관리 (Admin UI에서 생성/수정 불가)

## Frontmatter 형식 변경

-   **현재**: `sharedWith: [user1@gmail.com, user2@gmail.com]` (flow-style sequence)
-   **변경**: YAML block-style sequence 형식으로 변경
    ```yaml
    sharedWith:
        - user1@gmail.com
        - user2@gmail.com
    ```
-   파싱 및 생성 로직을 block-style sequence 형식에 맞게 수정

## 구현 기능

### 1. ListPage 정렬 변경

-   현재: 파일명 기준 정렬
-   변경: `metadata.createdAt` 기준 내림차순 정렬 (최신순)
-   createdAt이 없는 경우는 맨 아래 배치
-   **참고**: ListPage에서는 Admin 기능을 제공하지 않음

### 2. ViewPage 톱니바퀴 버튼 추가

-   **위치**: ViewPage 상단바 (toolbar)
-   **표시 조건**: Admin 모드일 때만 표시
-   **동작**: 클릭 시 `/게시물/setting` 페이지로 이동 (예: `/게시물명.md/setting`)

### 3. Setting 페이지 (`/게시물/setting`)

-   **접근**: ViewPage의 톱니바퀴 버튼 클릭 시 이동
-   **권한**: Admin 모드일 때만 접근 가능
-   **기본 동작**:
    -   Private 게시물의 경우, `email.yaml`의 `admin` 섹션에 있는 이메일은 자동으로 접근 권한 부여 (md의 sharedWith에 명시적으로 추가하지 않아도 됨)
    -   sharedWith에 명시된 이메일과 `admin` 섹션에 있는 이메일 모두 접근 가능

#### 3.1 공유된 이메일 목록

-   **위치**: Setting 페이지 메인 영역
-   **이메일 목록**:
    -   각 이메일은 이메일 주소와 삭제 버튼(X)으로 구성
    -   이메일 주소 표시
    -   삭제 버튼(X): 오른쪽에 위치, 클릭 시 해당 이메일을 sharedWith에서 제거
-   **"+ Add emails" 버튼**: 이메일 목록 하단에 위치, 클릭 시 "Add Emails" 모달 열기

#### 3.2 Add Emails 모달

-   **위치**: "+ Add emails" 버튼 클릭 시 모달로 표시
-   **닫기 버튼**: 오른쪽 상단 X 버튼으로 모달 닫기

##### 3.2.1 Archive 섹션 (상단)

-   **제목**: "Archive"
-   **Archive 이메일 목록**:
    -   `email.yaml`의 `archive` 섹션에서 이메일 목록 읽기
    -   각 이메일은 체크박스로 선택 가능
    -   선택된 이메일은 체크 표시

##### 3.2.2 직접 이메일 입력 섹션 (하단)

-   **텍스트 영역**: 여러 이메일을 입력할 수 있는 다중 라인 입력 영역
-   **입력 형식**: 줄바꿈으로 이메일 구분

##### 3.2.3 모달 액션 버튼

-   **"Cancel" 버튼**: 모달을 닫고 변경사항을 취소
-   **"Add (N)" 버튼**:
    -   Archive에서 선택한 이메일과 직접 입력한 이메일을 모두 포함하여 추가 (N은 추가할 총 이메일 개수)
    -   Archive 선택 + 직접 입력 이메일을 동시에 추가 가능
    -   중복 이메일은 자동으로 제거 (기존 sharedWith에 있는 이메일은 추가하지 않음)
    -   추가 후 모달 닫기

#### 3.3 검증

-   이메일 형식 검증
-   중복 제거
-   빈 값 제거
-   직접 입력 시 줄바꿈 또는 쉼표로 구분된 이메일 파싱
