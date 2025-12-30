<sub>2025.12.30 23:47</sub>

# 데이터 시스템

SDK는 ID 체계, 데이터 계층 구조, 조회 메커니즘을 통해 건물 모델 데이터를 관리합니다. 각 요소는 화면 조작용 숫자 ID(dbId)와 영구 저장용 문자열 ID(elementId)로 식별되며, 두 ID는 상호 변환할 수 있습니다. `DtApp`(세션) → `DtFacility`(건물) → `DtModel`(파일) 계층 구조로 구성되며, `DtApp`은 인증과 WebSocket 연결을 관리하고, `DtFacility`는 여러 모델을 포함하며, `DtModel`은 개별 3D 형상과 속성 데이터를 담습니다. 데이터는 Column Family 방식으로 분류 저장되고, Query API로 조건부 검색하며, Facets로 층/공간/카테고리별 필터링합니다. Instance Tree는 요소 간 계층 구조를, Fragment는 렌더링 단위를, StreamManager는 IoT 센서 데이터를 관리합니다. Worker가 무거운 연산을 백그라운드에서 처리하여 UI 응답성을 유지합니다.

## ID 체계

건물의 벽, 문, 창문 같은 요소는 고유한 식별자를 가집니다. 같은 요소를 두 가지 방식으로 식별하는데, 화면에서 보여주고 조작할 때는 간단한 숫자(dbId)를, 서버와 데이터를 주고받을 때는 영구적인 문자열(elementId)을 사용합니다.

### dbId (Database ID)

**타입**: `number`  
**용도**: 뷰어 내부 식별자

뷰어가 런타임에 모델 로딩 시 생성하는 임시 숫자 ID입니다. `dbId`는 1부터 시작하며, 모델의 루트 요소는 항상 `dbId = 1`을 가집니다. 뷰어 세션 내에서 객체의 시각적 조작에 사용됩니다:

-   객체 선택: `viewer.select(dbId)`
-   객체 격리: `viewer.isolate(dbIds)`
-   객체 숨기기/보이기: `viewer.hide(dbId)` / `viewer.show(dbId)`
-   카메라 포커싱: `viewer.fitToView(dbIds)`

`dbId`는 세션이나 모델 로딩 순서에 따라 값이 달라질 수 있으므로, 데이터베이스나 로컬 스토리지에 영구 저장하는 용도로 사용할 수 없습니다. 저장이 필요한 경우 반드시 `elementId`로 변환한 후 저장해야 합니다.

### elementId (Element ID, extId)

**타입**: `string`  
**인코딩**: Base64URL  
**크기**: 20바이트 (인코딩 시 27자) 또는 24바이트 (인코딩 시 32자)  
**용도**: 영구 식별자

원본 설계 파일(Revit)과 Tandem 데이터베이스가 공유하는 고유 ID로, 세션과 무관하게 동일한 객체를 식별할 수 있습니다. Base64URL로 인코딩된 문자열 형태(예: `AAAAAF8gDdJvQbCY1TvYDFdF`)이며, 컨텍스트에 따라 다양한 이름으로 참조됩니다:

-   **`elementId`**: 공식 용어, 함수 파라미터명
-   **`extId`**: SDK 내부 변수명 (external ID의 약자)
-   **`key`** / **`k`**: API 응답 JSON 필드명
-   **`HostElementID`**: CSV 데이터 내 컬럼명

#### elementId 구조

SDK는 두 가지 형식의 elementId를 처리합니다:

1. **Core Element ID (20바이트)**

    ```
    [20바이트 고유 식별자]
    ```

    - Tandem DB에 저장되는 순수 ID
    - Base64URL 인코딩 시 27자
    - 상수: `ElementIdSize = 20`, `ElementIdEncodedLength = 27`

2. **Element ID with Flags (24바이트)**
    ```
    [4바이트 Flags] + [20바이트 고유 식별자]
    ```
    - 뷰어 API가 반환하는 ID 형식
    - Flags: 요소의 타입과 상태를 나타내는 비트마스크
    - Base64URL 인코딩 시 32자
    - 상수: `ElementIdWithFlagsSize = 24`, `ElementIdWithFlagsEncodedLength = 32`, `ElementFlagsSize = 4`

#### Flags 구조

`ElementFlags`는 요소의 타입과 상태를 나타내는 32비트 비트마스크입니다. 최상위 바이트로 요소의 주요 분류를 구분합니다.

```javascript
// 물리적 요소 (지오메트리 있음, 최상위 바이트 = 0x00)
const ElementFlags = {
    SimpleElement: 0x00000000, // 일반 요소
    NestedChild: 0x00000001, // 중첩된 자식 요소 (호스트 내부)
    NestedParent: 0x00000002, // 호스트 패밀리 (가구, 엘리베이터 등)
    CompositeChild: 0x00000003, // 커튼월 구성 요소 (패널, 멀리온)
    CompositeParent: 0x00000004, // 커튼월 부모 요소
    Room: 0x00000005, // 룸 경계

    // 논리적 요소 (지오메트리 없음, 최상위 바이트 = 0x01)
    FamilyType: 0x01000000, // 패밀리 타입
    Level: 0x01000001, // 레벨
    DocumentRoot: 0x01000002, // Revit 문서 루트
    Stream: 0x01000003, // IoT 데이터 스트림
    System: 0x01000004, // MEP 시스템
    GenericAsset: 0x01000005, // 일반 자산

    // 가상 요소 (인스턴스 트리 내부 노드, 최상위 바이트 = 0x03)
    Virtual: 0x03000000,

    // 비트마스크
    AllLogicalMask: 0xff000000,

    // 런타임 플래그
    Deleted: 0xfffffffe, // 세션 내 삭제 예정
    Unknown: 0xffffffff,
};

// 간소화된 분류 (테이블 스캔용)
const KeyFlags = {
    Physical: 0x00000000, // 물리적 요소 (지오메트리 있음)
    Logical: 0x01000000, // 논리적 요소 (Level, Document, FamilyType 등)
};
```

### ID 변환

뷰어 조작(`dbId` 기반)과 데이터 조회(`elementId` 기반)를 연동하려면 두 ID 타입 간 변환이 필요합니다.

#### 공개 API 메서드

`DtModel`은 배치 처리를 위해 배열 기반 변환 메서드를 제공합니다:

```javascript
// elementId → dbId 변환
const dbIds = await model.getDbIdsFromElementIds([elementId1, elementId2]);

// dbId → elementId 변환 (20바이트, flags 제외)
const elementIds = await model.getElementIdsFromDbIds([dbId1, dbId2]);
```

두 메서드 모두 Worker와 통신하는 비동기 함수이므로 반드시 `await`를 사용해야 합니다. 여러 ID를 변환할 때는 루프 내에서 개별 호출하지 말고 배열로 한 번에 처리하는 것이 효율적입니다.

#### ID 정규화

Tandem API 응답의 `k` 필드는 20바이트 Core Element ID를 반환하지만, 일부 내부 메서드는 24바이트(flags 포함)를 생성할 수 있습니다. 두 소스의 ID를 비교하거나 매칭할 때는 정규화가 필요합니다:

```javascript
function normalizeToK(anyB64u) {
    const bytes = base64DecToArr(anyB64u);

    // 24바이트면 앞 4바이트(flags) 제거
    if (bytes.length === 24) {
        bytes = bytes.slice(4);
    }

    // 20바이트 검증
    if (bytes.length !== 20) {
        throw new Error("Invalid elementId length");
    }

    return base64EncArr(bytes);
}
```

**참고**: SDK 공개 API인 `model.getElementIdsFromDbIds()`는 이미 정규화된 20바이트 ID를 반환하므로, 별도 정규화가 필요 없습니다.

### 사용 시나리오

#### 1. 뷰어 선택 → API 데이터 조회

```javascript
viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, async (event) => {
    const dbId = event.dbIdArray[0];
    if (!dbId) return;

    // dbId → elementId 변환
    const [elementId] = await model.getElementIdsFromDbIds([dbId]);

    // elementId로 API 호출
    const response = await fetch(`/api/elements/${elementId}`);
    const data = await response.json();
});
```

#### 2. API 데이터 → 뷰어 시각화

```javascript
// API 응답 (예: HVAC 시스템 요소 목록)
const response = await fetch("/api/elements?category=HVAC");
const elements = await response.json(); // [{ k: "elementId1" }, { k: "elementId2" }, ...]

// elementId 추출 및 변환
const elementIds = elements.map((el) => el.k);
const dbIds = await model.getDbIdsFromElementIds(elementIds);

// 뷰어에서 시각화
viewer.isolate(dbIds, model);
viewer.fitToView(dbIds, model);
```

#### 3. 영구 저장 및 복원

```javascript
// 저장: dbId → elementId 변환 후 localStorage에 저장
const selection = viewer.getSelection();
const elementIds = await model.getElementIdsFromDbIds(selection);
localStorage.setItem("bookmark", JSON.stringify(elementIds));

// 복원: elementId → dbId 변환 후 선택
const savedElementIds = JSON.parse(localStorage.getItem("bookmark"));
const dbIds = await model.getDbIdsFromElementIds(savedElementIds);
viewer.select(dbIds, model);
```

**중요**: `dbId`는 세션마다 변경되므로 저장 시 반드시 `elementId`로 변환해야 합니다.

### 특수 케이스

**Root Element**:

-   모델의 루트 요소는 항상 `dbId = 1`을 가지며, all-zero ID (20바이트 모두 0)로 초기화됩니다.
-   `getElementIdsFromDbIds([1])`은 빈 문자열 `""`을 반환합니다.

**존재하지 않는 ID**:

-   `getDbIdsFromElementIds`에 존재하지 않는 elementId를 전달하면 해당 위치에 `undefined`가 반환됩니다.
-   `getElementIdsFromDbIds`에 존재하지 않는 dbId를 전달하면 해당 위치에 `null`이 반환됩니다.

**ID 배열 순서**:

-   변환 메서드는 입력 배열의 순서를 유지합니다. `[dbId1, dbId2, dbId3]`를 변환하면 `[elementId1, elementId2, elementId3]` 순서로 반환됩니다.

## 데이터 계층 구조

SDK는 `DtApp`(애플리케이션) → `DtFacility`(건물) → `DtModel`(모델 파일) 계층 구조로 데이터를 관리합니다. `DtApp`은 애플리케이션 세션을 나타내며 사용자 인증, 실시간 통신 연결, 백그라운드 작업 처리를 초기화합니다. `DtFacility`는 하나의 건물을 나타내며 건축, 구조, 설비 등 여러 개의 `DtModel`을 포함할 수 있습니다. 각 `DtModel`은 개별 3D 형상 데이터, 요소 속성, 계층 구조 정보를 가지고 있습니다.

```
DtApp (세션 관리, 인증)
  ├── DtTeam[] (팀)
  │     └── DtFacility[] (시설/Twin)
  └── DtFacility[]
        ├── DtModel[] (3D 모델)
        ├── FacetsManager (Level, Room, Category 관리)
        ├── SystemsManager (MEP 시스템)
        └── StreamManager (IoT 데이터)
```

### DtApp

애플리케이션당 하나만 생성합니다. 모든 API 호출, WebSocket 연결, Worker 관리의 진입점입니다. `DtApp`은 `EventDispatcher`를 상속하여 이벤트 기반 통신을 지원합니다.

#### 생성

```javascript
const app = new Autodesk.Tandem.DtApp(options);
```

생성 시 자동으로 초기화되는 항목:

-   **세션 ID**: UUID v4 형식의 고유 식별자 생성 (`app.sessionId`)
-   **SDK 버전**: 현재 SDK 버전 문자열 설정 (`app.sdkVersion`, 예: "1.0.620")
-   **HTTP 헤더**: 모든 API 요청에 자동 추가되는 헤더 설정
    -   `Session-Id`: 세션 고유 ID
    -   `x-dt-sdk-version`: SDK 버전
-   **WebSocket 연결**: 실시간 이벤트 수신을 위한 WebSocket 초기화 (`app.msgWs`)
-   **Worker 풀**: 백그라운드 연산 처리용 Worker 생성
    -   모바일: 2개 Worker
    -   데스크톱: 4개 Worker
-   **이벤트 리스너**: 브라우저 환경에서 다음 이벤트 자동 등록
    -   `visibilitychange`: 탭 활성/비활성 감지
    -   `online`: 네트워크 연결 복원
    -   `offline`: 네트워크 연결 끊김

#### 주요 속성

```javascript
app.sessionId; // 세션 고유 ID (UUID)
app.sdkVersion; // SDK 버전 (예: "1.0.620")
app.loadContext; // 모든 API 호출에 사용되는 설정
app.currentFacility; // displayFacility() 호출 시 설정됨
app.msgWs; // WebSocket 인스턴스
app.workers; // Worker 배열
app.userFacilities; // 사용자에게 직접 공유된 시설
app.views; // DtViews 인스턴스
```

#### 팀과 시설

```javascript
// 팀 조회
const teams = await app.getTeams();
// 반환: DtTeam[]

// 활성 팀 결정 로직
// 우선순위: Owner > Manage > 첫 번째 팀
// 1. Owner 권한을 가진 팀 중 첫 번째
// 2. Owner 팀이 없으면 Manage 권한을 가진 팀 중 첫 번째
// 3. 둘 다 없으면 teams 배열의 첫 번째 팀
const activeTeam = await app.getActiveTeam();

// 팀의 시설 목록 조회
const facilities = await team.getFacilities();
// 반환: DtFacility[]

// 사용자에게 직접 공유된 시설 ("Shared with me")
await app.loadUserFacilities();
const sharedFacilities = app.userFacilities;
```

#### 시설 로드

```javascript
await app.displayFacility(facility, initialViewInfo, viewer, forceReload);
```

**파라미터**:

-   `facility`: DtFacility 인스턴스
-   `initialViewInfo`: View 객체 또는 모델 URN Set (null 가능)
-   `viewer`: Viewer3D 인스턴스
-   `forceReload`: 이미 로드된 경우에도 다시 로드 (기본값: false)

이 함수는 다음 작업을 순차적으로 수행합니다:

1. **이전 시설 언로드**: 다른 시설이 이미 로드되어 있거나 `forceReload = true`인 경우 기존 시설을 언로드합니다.
2. **Facility와 Viewer 연결**: `facility.viewer = viewer` 설정
3. **Facility 로드**: `facility.load()` 호출하여 메타데이터와 설정 로드
4. **모델 로딩 시작**: 설정에 따라 Primary, Visible 모델을 로드 큐에 추가
5. **Manager 초기화**:
    - `StreamManager`: IoT 데이터 스트림 관리
    - `SystemsManager`: MEP 시스템 관리
    - `FacetsManager`: Level, Room, Category 필터링
6. **DataViz 컨트롤 생성**: 브라우저 환경에서 데이터 시각화 UI 초기화

#### Worker

속성 쿼리, ID 변환, Instance Tree 계산 등을 백그라운드에서 처리합니다.

```javascript
const worker = app.getWorker(seqNo); // 라운드로빈 방식으로 Worker 할당
```

**Worker 풀 구조**:

-   모바일: 2개 Worker
-   데스크톱: 4개 Worker
-   라운드로빈 방식: `seqNo % NUM_WORKERS`로 순환 할당

각 Worker는 메시지 기반으로 통신하며, 무거운 연산을 메인 스레드에서 분리하여 UI 응답성을 유지합니다.

**Worker가 처리하는 작업**:

1. **ID 변환**:
    - `getDbIdsFromElementIds`
    - `getElementIdsFromDbIds`
2. **속성 쿼리**:
    - `getPropertiesDt`
    - `query` (Table Scan)
    - `search` (Search Elements)
3. **Instance Tree 계산**:
    - 계층 구조 빌드
    - Fragment 매핑

**통신 방식**:

-   메시지 기반 비동기 통신 (`postMessage` / `addEventListener('message')`)
-   콜백 ID를 통한 요청-응답 매칭
-   `loadContext.cbId = -1`로 중앙 Worker 콜백 처리

각 Worker는 메인 스레드와 분리된 별도 실행 컨텍스트에서 동작하여 무거운 연산 중에도 UI 응답성을 유지합니다.

#### 이벤트 구독

```javascript
app.subscribeToEvents(target); // target: DtModel | DtFacility | DtTeam
app.unsubscribeFromEvents(target);
```

WebSocket을 통해 실시간 변경 사항을 수신하며, 타입에 따라 다른 핸들러가 설정됩니다:

**DtModel 이벤트**:

-   모델 데이터 변경 이벤트 수신
-   Worker로 전달되어 Instance Tree 재계산

**DtFacility 이벤트**:

-   템플릿 적용/제거, 설정 변경 등 처리

**DtTeam 이벤트**:

-   팀 메타데이터 변경 처리

### DtFacility

Twin(건물, 시설)을 나타냅니다. 하나의 Facility는 여러 모델을 포함할 수 있습니다.

**URN 형식**: `urn:adsk.dtt:{GUID}`

#### 생성자

```javascript
constructor(twinId, app, initialSettings) {
    this.app = app;
    this.models = {};
    this.loadQueue = [];
    this.twinId = fixTwinUrn(twinId);

    // loadContext 상속 및 확장
    this.loadContext = { ...app.loadContext };
    this.loadContext.twinId = this.twinId;
    this.loadContext.cbId = -1;  // 중앙 Worker 콜백 처리

    // Manager 초기화
    this.systemsManager = new SystemsManager(this);
    this.streamMgr = new StreamManager(this);
    this.facetsManager;  // load() 시 초기화
}
```

#### 모델 조회

```javascript
// 모든 모델 (Default 모델 포함)
const allModels = facility.getModels();

// Default 모델 제외 (Revit 등 원본 파일에서 가져온 모델만)
const sourceModels = facility.getModels(true); // skipDefault = true

// Default 모델: Tandem이 호스팅하는 특수 모델
const defaultModel = facility.getDefaultModel();

// URN으로 특정 모델 조회
const model = facility.getModelByUrn("urn:adsk.dtm:...");
```

#### Default vs Primary

**Default Model**:

-   Facility GUID = Model GUID (항상 하나만 존재)
-   Tandem이 관리하는 모델
-   사용자가 생성한 요소, 스트림, MEP 시스템 저장
-   `createGeometry()`, `createElement()`, `createStream()` 사용 가능
-   판별: `model.isDefault()` (Facility URN의 GUID와 Model URN의 GUID 비교)

**Primary Model**:

-   설정에서 메인 모델로 표시됨
-   시설의 주요 모델 (보통 건축 모델)
-   로딩 우선순위가 가장 높음 (Primary > Visible > Hidden)
-   Ghosting 모드 활성화 시 배경으로 유지
-   판별: `model.isPrimaryModel()`

하나의 모델이 Default이면서 동시에 Primary일 수는 없습니다 (일반적으로).

#### Settings

```javascript
facility.settings.links = [
    {
        modelId: "urn:adsk.dtm:...",
        label: "1층 평면도",
        main: true, // Primary 모델 여부
        on: true, // 로드 시 기본 표시
        accessLevel: "edit", // "view", "edit", "admin"
    },
];

// 서버에서 최신 설정 다시 가져오기
await facility.reloadSettings();
```

#### Managers

각 Manager는 특정 도메인을 담당합니다:

```javascript
// Level, Room, Category 등의 Facet 관리
facility.facetsManager;

// MEP 시스템 (HVAC, 전기, 배관 등)
facility.systemsManager;

// IoT 센서 데이터 스트림
facility.streamMgr; // 또는 facility.getStreamManager()

// HUD 레이어 (레벨 표시, 공간 경계 등)
facility.hud;
```

#### 좌표 변환

Facility는 모든 모델을 공통 좌표계로 정렬하기 위해 `globalOffset`을 관리합니다.

```javascript
facility.globalOffset; // THREE.Vector3

// 공유(전역) 좌표계 → 로컬 좌표계
const transform = facility.getSharedToLocalSpaceTransform();

// 로컬 좌표계 → 공유(전역) 좌표계
const inverseTransform = facility.getLocalToSharedSpaceTransform();
```

원본 Revit 파일의 위치가 제각각인 경우, 이 변환을 통해 모든 모델을 하나의 좌표계로 정렬합니다.

#### ID 인코딩

Facility는 여러 모델의 dbId를 Database Row Key로 변환하는 유틸리티 메서드를 제공합니다:

```javascript
// modelUrn → dbIds[] 맵을 modelUrn → rowKey[] 맵으로 변환
const encodedIds = await facility.encodeIds(modelToDbIds, useFullIds);

// useFullIds = false: 24바이트 qualified ID (모델 내 고유)
// useFullIds = true: 40바이트 full row key (전체 시설 내 고유)
```

**Row Key 구조**:

-   40바이트 Full Row Key = [16바이트 Model GUID] + [24바이트 Element ID with Flags]
-   24바이트 Qualified ID = [4바이트 Flags] + [20바이트 Element ID]

### DtModel

개별 3D 모델 파일을 나타냅니다. 지오메트리, 속성, Fragment 데이터를 포함합니다. `DtModel`은 `RenderModel`을 상속하며, Tandem 전용 기능을 추가합니다.

**URN 형식**: `urn:adsk.dtm:{GUID}`

#### 타입 확인

**Default Model** (`model.isDefault()`):

-   Facility의 GUID와 Model의 GUID가 동일
-   Tandem이 호스팅하며 원본 파일 없음
-   사용자 생성 요소, 지오메트리, 스트림 저장
-   다음 작업만 Default 모델에서 가능:
    -   `createGeometry()`, `createSketchedGeometry()`
    -   `createElement()`, `deleteElement()`
    -   `createStream()`
    -   MEP 시스템 관리

**Primary Model** (`model.isPrimaryModel()`):

-   설정에서 메인 모델로 표시됨
-   로딩 우선순위: Primary > Visible > Hidden
-   Ghosting 모드 활성화 시 배경으로 유지

#### 속성 메서드

```javascript
model.label(); // settings.links[].label
model.fileName(); // 원본 파일명 (Default 모델은 "(Tandem hosted)")
model.isVisibleByDefault(); // settings.links[].on
model.accessLevel(); // "view", "ReadWrite", "Manage", "Owner"
model.getParentFacility(); // 부모 Facility 반환
model.canEdit(); // accessLevel이 편집 가능한지 확인
```

#### 데이터 조회 개요

`DtModel`은 요소 데이터를 조회하는 메서드를 제공합니다. 이러한 메서드는 Worker를 통해 비동기적으로 처리됩니다:

```javascript
// 속성 조회
await model.getPropertiesDt(dbIds, options);

// ID 변환
await model.getElementIdsFromDbIds([dbId1, dbId2]);
await model.getDbIdsFromElementIds([elementId1, elementId2]);

// 쿼리 및 검색
await model.query(query);
await model.search(search);

// 구조 데이터
model.getLevels();
model.getInstanceTree();
model.getBoundingBox();

// Fuzzy Bounding Box (이상치 제외)
model.getFuzzyBox(options);
```

### 인증

OAuth 2.0 토큰을 사용합니다. 토큰은 만료 전에 갱신되어야 합니다.

#### Viewer 초기화

```javascript
Autodesk.Viewing.Initializer(
    {
        env: "DtProduction", // 또는 "DtStaging"
        api: "dt", // Tandem API
        shouldInitializeAuth: false, // 수동 토큰 관리
        getAccessToken: (callback) => {
            // SDK가 토큰이 필요할 때 호출
            const token = "..."; // Bearer 토큰
            const expireInSeconds = 3600; // 만료 시간 (초)
            callback(token, expireInSeconds);
        },
    },
    () => {
        // 초기화 완료 콜백
    }
);
```

SDK는 토큰 만료 시간을 추적하여 자동으로 `getAccessToken`을 재호출합니다.

#### HTTP 헤더

모든 API 요청에 자동으로 추가되는 헤더:

```javascript
// 설정되는 헤더
{
    "Session-Id": "...", // DtApp 생성 시 UUID 설정
    "x-dt-sdk-version": "...", // SDK 버전
    Authorization: "Bearer ...", // 액세스 토큰
}
```

#### 토큰 수동 갱신

```javascript
// 토큰 설정
Autodesk.Viewing.endpoint.setAccessToken(newToken, ttl);
Autodesk.Viewing.endpoint.HTTP_REQUEST_HEADERS["Authorization"] = `Bearer ${newToken}`;

// 401 에러 처리 (권장 패턴)
const originalRequest = Autodesk.Viewing.endpoint.HTTP_REQUEST;
Autodesk.Viewing.endpoint.HTTP_REQUEST = async function (url, options = {}) {
    try {
        return await originalRequest.call(this, url, options);
    } catch (error) {
        if (error?.status === 401) {
            // 토큰 갱신 후 재시도
            const newToken = await refreshTokenFromServer();
            Autodesk.Viewing.endpoint.setAccessToken(newToken, ttl);
            options.headers = options.headers || {};
            options.headers["Authorization"] = `Bearer ${newToken}`;
            return await originalRequest.call(this, url, options);
        }
        throw error;
    }
};
```

### loadContext

모든 API 호출에 사용되는 설정 객체입니다. 각 계층이 부모의 context를 복사하여 확장합니다.

```javascript
// DtApp
app.loadContext = {
    sessionId: "...",
    sdkVersion: "...",
    endpoint: "https://...",
    headers: {...},
    cbId: -1,  // Worker 콜백 ID
};

// DtFacility (App context 복사 + twinId 추가)
facility.loadContext = { ...app.loadContext };
facility.loadContext.twinId = "urn:adsk.dtt:...";
facility.loadContext.cbId = -1;

// DtModel (Facility context 공유)
model.loadContext = facility.loadContext;
```

이를 통해 모든 API 호출이 자동으로 세션 정보, 인증, Facility 컨텍스트를 포함합니다.

### WebSocket

실시간 이벤트 수신을 위한 WebSocket 연결입니다. `DtApp` 생성 시 자동으로 초기화됩니다.

**초기화**:

```javascript
// DtApp 생성자에서 자동 초기화
// WebSocket 인스턴스가 생성되고 세션이 시작됨
```

**사용법**:

```javascript
// 구독 (subscribeToEvents로 자동 처리됨)
app.subscribeToEvents(target); // target: DtModel | DtFacility | DtTeam

// 구독 해제
app.unsubscribeFromEvents(target);

// 수동 재연결 (필요시)
app.msgWs.reconnect(force);
```

**수신 이벤트 타입**:

-   모델 데이터 변경 (요소 추가/삭제/수정)
-   시설 설정 변경 (링크 추가/제거)
-   템플릿 적용/제거
-   문서 업로드/삭제
-   메트릭 업데이트

**처리 방식**:

-   **DtModel 이벤트**: Worker로 전달되어 Instance Tree 재계산
-   **DtFacility 이벤트**: 직접 처리
-   **DtTeam 이벤트**: 직접 처리

이벤트는 URN 단위로 구독되며, 다른 사용자의 변경 사항을 실시간으로 반영할 수 있습니다.

### API 엔드포인트

```javascript
endpoint.ENDPOINT_API_TANDEM_V1 = "dt";

// 기본 URL 패턴
baseURL: "/modeldata";
msgWS: "/msgws"; // WebSocket
fragsWS: "/fragsws"; // Fragment WebSocket (실시간 지오메트리 스트리밍)
```

**주요 API 경로**:

```
GET  /groups                              팀 목록
GET  /groups/${groupId}/twins             팀의 시설 목록
GET  /twins/${twinId}                     시설 정보
POST /twins/${twinId}/import              모델 가져오기
GET  /users/@me/twins                     사용자 시설 (직접 공유)
POST /modeldata/${modelUrn}/scan          데이터 스캔 (쿼리)
GET  /modeldata/${modelUrn}/schema        스키마 조회
GET  /modeldata/${modelUrn}/model         모델 메타데이터
```

모든 경로는 엔드포인트 + 경로 형태로 구성됩니다.

## 데이터 조회

모델 데이터는 Column Family 방식으로 구성되어 지오메트리, 속성, 관계 정보를 분류합니다. `query()`는 조건에 맞는 요소만 필터링하여 검색하고, `getPropertiesDt()`는 여러 요소의 속성을 조회하며 교집합 계산을 지원합니다.

### Column Families

Tandem의 데이터는 HBase 스타일의 Column Family로 구성됩니다. 각 Family는 특정 유형의 데이터를 저장합니다.

| Family           | 코드  | 설명                                                    |
| ---------------- | ----- | ------------------------------------------------------- |
| **LMV**          | `"0"` | 지오메트리 데이터 (BoundingBox, Fragment, Centerline)   |
| **Standard**     | `"n"` | 표준 속성 (Name, CategoryId, ElementFlags, SystemClass) |
| **Refs**         | `"l"` | 참조 관계 (Parent, Level, Rooms)                        |
| **Xrefs**        | `"x"` | 외부 참조 (다른 모델 요소 참조)                         |
| **Source**       | `"r"` | 원본 파일 정보 (Revit GUID 등)                          |
| **DtProperties** | `"z"` | Tandem 전용 속성 (사용자 정의 필드)                     |
| **Tags**         | `"t"` | 태그 데이터                                             |
| **Systems**      | `"m"` | MEP 시스템 정보                                         |
| **Attributes**   | `"p"` | 커스텀 속성 정의                                        |
| **Status**       | `"s"` | 요소 상태                                               |

### Query API

조건에 맞는 요소를 필터링하여 가져옵니다.

```javascript
const result = await model.query({
    families: ["n", "l"],
    filter: {
        "n:CategoryId": "OST_Walls", // CategoryId가 OST_Walls인 요소만
    },
    // 또는 더 복잡한 조건
    filters: [
        { column: "n:CategoryId", operator: "=", value: "OST_Walls" },
        { column: "l:Level", operator: "exists" },
    ],
});
```

#### 필터 연산자

| 연산자    | 설명        | 예시                                                                            |
| --------- | ----------- | ------------------------------------------------------------------------------- |
| `=`       | 같음        | `{ column: "n:Name", operator: "=", value: "Wall_001" }`                        |
| `!=`      | 다름        | `{ column: "n:CategoryId", operator: "!=", value: "OST_Doors" }`                |
| `exists`  | 컬럼 존재   | `{ column: "l:Level", operator: "exists" }`                                     |
| `!exists` | 컬럼 미존재 | `{ column: "l:Rooms", operator: "!exists" }`                                    |
| `in`      | 값 포함     | `{ column: "n:CategoryId", operator: "in", value: ["OST_Walls", "OST_Doors"] }` |

#### 반환 형식

```javascript
[
    {
        k: "AAAAAAAAAAAAfoobar1234==", // 24-byte extId (Base64URL)
        "n:Name": "Wall_001", // Family:Column 형식
        "n:CategoryId": "OST_Walls",
        "l:Parent": "AAAAAAAAAAAAparent1234==",
        "l:Level": "AAAAAAAAAAAAlevel01234==",
        // ...
    },
    // ... 필터 조건에 맞는 요소들
];
```

### Property 조회

특정 요소의 속성을 조회합니다.

#### getPropertiesDt()

여러 요소의 속성을 한 번에 가져옵니다 (Tandem 전용).

```javascript
const props = await model.getPropertiesDt([dbId1, dbId2, dbId3], {
    intersect: false, // true: 공통 속성만, false: 개별 속성
    history: false, // 변경 이력 포함 여부
    wantTimeSeries: false, // 스트림 데이터 포함 (Default 모델만)
});
```

**`intersect: true`** (여러 요소의 공통 속성):

```javascript
{
  element: {
    properties: [
      { displayName: "Category", displayValue: "Walls" }, // 모든 요소가 공통으로 가진 속성
      { displayName: "Level", displayValue: "*varies*" }, // 값이 다르면 *varies*
    ],
  },
  model: DtModel,
}
```

**`intersect: false`** (개별 요소 속성):

```javascript
{
  element: {
    properties: [/* 첫 번째 요소의 속성 */],
  },
  elements: [
    { properties: [/* 첫 번째 요소 */] },
    { properties: [/* 두 번째 요소 */] },
    { properties: [/* 세 번째 요소 */] },
  ],
  model: DtModel,
}
```

**`wantTimeSeries: true`** (스트림 데이터 포함, Default 모델만):

```javascript
{
  element: {
    properties: [
      {
        displayName: "Temperature",
        displayValue: "23.5",      // 최신 값
        timestamp: 1700000000000,  // 읽기 시간 (ms)
        streamData: true,           // 스트림 속성임을 표시
      },
    ],
  },
}
```

### Schema API

모델의 속성 정의를 조회합니다.

```javascript
const attributes = await model.getHash2Attr();
```

**반환 형식**:

```javascript
{
  "a123": {
    id: "a123",
    name: "Temperature",
    category: "Sensors",
    type: "Double",
    units: "°C",
    hidden: false,
  },
  // ... 다른 속성들
}
```

Schema는 커스텀 속성 정의를 확인할 때 사용합니다.

## Facets 시스템

Facets는 요소를 계층적으로 분류하는 시스템입니다. UI에서 필터링, 테마, 가시성 제어에 사용됩니다.

### Facet 타입

| 타입           | ID             | 설명                                     |
| -------------- | -------------- | ---------------------------------------- |
| **Levels**     | `"levels"`     | 건물 층 (Level)                          |
| **Rooms**      | `"spaces"`     | 공간 (Room, Space)                       |
| **Categories** | `"cats"`       | Revit 카테고리 (OST_Walls, OST_Doors 등) |
| **Families**   | `"fams"`       | Revit 패밀리                             |
| **Types**      | `"types"`      | Revit 타입                               |
| **Models**     | `"models"`     | 모델 파일                                |
| **Systems**    | `"systems"`    | Uniformat 코드 (MEP 분류)                |
| **Attributes** | `"attributes"` | 커스텀 속성 기반 분류                    |

### FacetsManager

`facility.facetsManager`는 모든 Facet을 관리합니다.

#### Facet 정의 조회

```javascript
const facetDefs = facility.facetsManager.getFacetDefs();
// 반환: FacetDef[] - 현재 활성화된 Facet 목록
```

**FacetDef 구조**:

```javascript
{
  id: "levels",                // Facet 타입
  filter: Set<string>,         // 선택된 항목 ID
  theme: {},                   // 테마 색상 매핑
  palette: [],                 // 색상 팔레트
  hidden: false,               // UI 숨김 여부
  isIntersectionFilter: false, // 교집합 필터 여부
}
```

#### 특정 Facet 조회

```javascript
const levelFacet = facility.facetsManager.getFacet("levels");
```

**Facet 구조** (Merged Facet):

```javascript
{
  "level-1": {
    id: "level-1",
    label: "1st Floor",
    count: 150,           // 이 Level에 속한 요소 수
    selected: true,       // 선택 상태
    modelUrns: ["urn:adsk.dtm:..."], // 이 항목을 가진 모델들
    dbIds: Map<modelUrn, Set<dbId>>, // 모델별 요소 ID
  },
  "level-2": {
    id: "level-2",
    label: "2nd Floor",
    count: 120,
    selected: false,
    // ...
  },
  // ...
}
```

#### 가시성 제어

```javascript
// 특정 Facet 항목만 표시
facility.facetsManager.setVisibilityById(
    facetIdx, // Facet 인덱스 (0: Models, 1: Levels, ...)
    [id1, id2], // 표시할 항목 ID 배열
    isolate // true: 다른 항목 숨김, false: 추가 선택
);

// 가시성 초기화 (모두 표시)
facility.facetsManager.resetVisibility();
```

**예시**:

```javascript
// Levels Facet에서 "1st Floor"만 표시
const levelsDef = facility.facetsManager.getFacetDefs()[1]; // Levels (getFacetDefs() 배열의 인덱스 1)
facility.facetsManager.setVisibilityById(1, ["level-1"], true);

// 초기화
facility.facetsManager.resetVisibility();
```

#### 커스텀 Facet

속성 기반 Facet을 동적으로 생성할 수 있습니다:

```javascript
const customFacet = await model.getCustomFacets({
    attributeHash: "a123", // 속성 ID
});
```

## Level과 Room

### Level 구조

```javascript
const levels = model.getLevels();
```

**반환 형식**:

```javascript
{
  123: { // dbId
    name: "Level 1",
    elevation: 0.0,
    guid: "1234-5678-...",
    z: 0.0,              // 높이 (mm 단위)
    extId: "AAAAAAAAAAAAlevel01234==",
  },
  456: {
    name: "Level 2",
    elevation: 4000.0,
    // ...
  },
  // ...
}
```

### Level 요소 조회

특정 Level에 속한 모든 요소의 dbId를 가져옵니다:

```javascript
const dbIds = model.getElementsForLevel(levelDbId);
// 반환: number[]
```

### Room 요소 조회

특정 Room(Space) 내부의 모든 요소를 **모든 모델**에서 검색합니다:

```javascript
const result = await facility.getElementsInRoom(modelUrn, roomDbId);
```

**반환 형식**:

```javascript
[
    {
        model: DtModel, // 모델 인스턴스
        dbIds: [123, 456, 789], // 이 모델에서 Room 내부에 있는 요소들
    },
    {
        model: DtModel, // 다른 모델
        dbIds: [111, 222],
    },
    // ...
];
```

**작동 방식**:

1. **Room 소유 모델 내 요소 검색**:

    - Room 소속 정보를 확인하여 해당 요소를 결과에 추가합니다.

2. **다른 모델의 요소 검색 (Cross-Reference)**:
    - Room의 External ID를 가져옵니다.
    - 각 모델의 외부 참조 정보에서 Room의 로컬 참조 ID를 찾습니다.
    - 해당 Room에 속한 요소를 찾습니다.

**데이터 구조**:

-   `dbId2roomIds`: `{ [dbId: number]: number | number[] }` - 요소가 속한 Room ID(들)
-   `dbId2xroomIds`: `{ [dbId: number]: number | number[] }` - 외부 모델의 Room 참조 ID(들)
-   `xrefs`: `{ [modelUrn: string]: { [externalId: string]: number } }` - 외부 참조 맵

**참고**:

-   Room 요소는 특정 Flags 값으로 표시됩니다.
-   하나의 요소가 여러 Room에 동시에 속할 수 있습니다 (예: 벽이 두 방 사이에 있는 경우).

## Instance Tree와 Fragment

### Instance Tree

Instance Tree는 요소의 계층 구조를 나타냅니다 (Parent-Child 관계).

#### 가져오기

```javascript
const instanceTree = model.getInstanceTree();
```

**InstanceTree 인스턴스**는 다음 메서드를 제공합니다:

```javascript
// 루트 노드 ID
const rootId = instanceTree.getRootId();

// 부모 노드
const parentId = instanceTree.getNodeParentId(dbId);

// 자식 노드
const childCount = instanceTree.getChildCount(dbId);
instanceTree.enumNodeChildren(dbId, (childDbId) => {
    console.log("Child:", childDbId);
});

// 노드 이름
const name = instanceTree.getNodeName(dbId);

// 노드 Bounding Box
const bbox = new THREE.Box3();
instanceTree.getNodeBox(dbId, bbox);

// 가시성 상태
const isHidden = instanceTree.isNodeHidden(dbId);
const isOff = instanceTree.isNodeOff(dbId);
```

#### 계층 탐색

```javascript
// 모든 자손 노드 재귀 탐색
function getAllDescendants(dbId, instanceTree) {
    const descendants = [];
    instanceTree.enumNodeChildren(
        dbId,
        (childId) => {
            descendants.push(childId);
            descendants.push(...getAllDescendants(childId, instanceTree));
        },
        true
    ); // true: 재귀
    return descendants;
}
```

### Fragment

Fragment는 렌더링 단위입니다. 하나의 요소(dbId)가 여러 Fragment를 가질 수 있습니다.

#### FragmentList

```javascript
const fragList = model.getFragmentList();
```

**주요 메서드**:

```javascript
// Fragment 수
const fragCount = fragList.getCount();

// Fragment의 Bounding Box
const bbox = new THREE.Box3();
fragList.getWorldBounds(fragId, bbox);

// Fragment의 변환 행렬
const matrix = new THREE.Matrix4();
fragList.getOriginalWorldMatrix(fragId, matrix);

// Fragment의 Material ID
const materialId = fragList.getMaterialId(fragId);

// Fragment → dbId 매핑
const dbId = fragList.fragments.fragId2dbId[fragId];

// dbId → Fragment 매핑 (여러 개 가능)
const fragIds = [];
instanceTree.enumNodeFragments(
    dbId,
    (fragId) => {
        fragIds.push(fragId);
    },
    true
);
```

#### 모델 Bounding Box

```javascript
const bbox = model.getBoundingBox();
// THREE.Box3: 모델 전체의 AABB
```

## Streams (IoT 데이터)

StreamManager는 센서 데이터와 시계열 정보를 관리합니다.

### StreamManager 접근

```javascript
const streamMgr = facility.getStreamManager();
// 또는
const streamMgr = facility.streamMgr;
```

### 최신 데이터 조회

```javascript
const lastReadings = await streamMgr.getLastReadings([dbId1, dbId2]);
```

**반환 형식**:

```javascript
[
    {
        Temperature: { ts: "1700000000000", val: "23.5" },
        Humidity: { ts: "1700000000000", val: "45.2" },
    },
    {
        Temperature: { ts: "1700000005000", val: "24.1" },
    },
    // ...
];
```

### 시계열 데이터 조회

특정 시간 범위의 데이터를 가져옵니다.

```javascript
const streamMgr = facility.getStreamManager();
const range = [startDate, endDate]; // 예: ["2024-01-01", "2024-01-31"]
const granularity = "Raw"; // "Raw", "Hour", "Day", "Week", "Month"
const readings = await streamMgr.readingsByDate.getReadings(
    range,
    granularity,
    forceRefresh, // 캐시 무시 여부
    streamsFilter, // 필터링할 스트림 (선택)
    useSeconds // 초 단위 사용 여부 (선택)
);
```

**반환 형식**:

```javascript
{
  // 스트림별 데이터
  [streamId]: [
    { timestamp: 1700000000000, value: 23.5 },
    { timestamp: 1700003600000, value: 24.1 },
    // ...
  ],
  // ...
}
```

### Stream 요소 확인

```javascript
// dbId가 Stream 요소인지 확인
const flags = model.getData().dbId2flags;
const isStream = flags?.[dbId] === ElementFlags.Stream;
```

**Stream 요소**는 Default 모델에만 존재합니다.

## 조회 패턴

### 패턴 1: 초기 데이터 로드

```javascript
// 모델 로드 후 전체 데이터 쿼리
const allData = await model.query({
    families: ["n", "l"],
});

// 로컬 캐시 구축
const cache = new Map();
allData.forEach((item) => {
    cache.set(item.k, item);
});
```

이 패턴은 초기 로딩 시 모든 데이터를 한 번에 가져와 로컬 캐시를 구축할 때 유용합니다.

### 패턴 2: 선택 요소 속성 조회

```javascript
viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, async () => {
    const selection = viewer.getSelection();
    if (selection.length === 0) return;

    const props = await model.getPropertiesDt(selection, {
        intersect: selection.length > 1, // 다중 선택 시 공통 속성
    });

    displayProperties(props);
});
```

### 패턴 3: 카테고리 필터링

```javascript
// Query API로 특정 카테고리 검색
const walls = await model.query({
    families: ["n"],
    filter: { "n:CategoryId": "OST_Walls" },
});

// extId → dbId 변환
const extIds = walls.map((item) => item.k);
const dbIds = await model.getDbIdsFromElementIds(extIds);

// Viewer에 시각화
viewer.isolate(dbIds, model);
```

### 패턴 4: Level별 필터링

```javascript
// FacetsManager를 통한 Level 필터링
const levelFacet = facility.facetsManager.getFacet("levels");

// 특정 Level만 표시
function showLevel(levelId) {
    const levelNode = levelFacet[levelId];
    if (!levelNode) return;

    // FacetsManager를 사용하여 가시성 제어 (권장)
    facility.facetsManager.setVisibilityById(
        1, // Levels (getFacetDefs() 배열의 인덱스 1)
        [levelId],
        true // isolate: 다른 Level 숨김
    );

    // 단일 모델인 경우 Viewer API 직접 사용 가능
    const model = facility.getModels()[0];
    const dbIds = Array.from(levelNode.dbIds.get(model.urn()) || []);
    viewer.isolate(dbIds, model);
    viewer.fitToView(dbIds, model);
}
```

`FacetsManager.setVisibilityById`는 다중 모델 환경에서 자동으로 모든 모델의 해당 Level 요소를 처리합니다.

## 정리

### API 요약

| API                            | 용도               | 반환 형식                              |
| ------------------------------ | ------------------ | -------------------------------------- |
| `query()`                      | 조건부 데이터 검색 | `{ k, "family:column": value }[]`      |
| `getPropertiesDt()`            | 다중 요소 속성     | Tandem 속성 객체 (교집합/개별)         |
| `getHash2Attr()`               | 속성 정의          | `{ [attrId]: AttributeDef }`           |
| `getFacetDefs()`               | Facet 목록         | `FacetDef[]`                           |
| `getFacet()`                   | Facet 데이터       | `{ [id]: MergedFacetNode }`            |
| `getLevels()`                  | Level 정보         | `{ [dbId]: LevelData }`                |
| `getElementsForLevel()`        | Level 요소         | `number[]`                             |
| `getElementsInRoom()`          | Room 요소          | `{ model, dbIds }[]`                   |
| `getInstanceTree()`            | 계층 구조          | `InstanceTree`                         |
| `getFragmentList()`            | Fragment 데이터    | `FragmentList`                         |
| `getLastReadings()`            | 최신 센서 값       | `{ [property]: { ts, val } }[]`        |
| `readingsByDate.getReadings()` | 시계열 데이터      | `{ [streamId]: [{timestamp, value}] }` |
