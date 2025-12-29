<sub>2025.12.29 12:41</sub>

# Tandem Helpers 가이드

Autodesk Tandem SDK를 활용한 3D 뷰어 제어 유틸리티 모음입니다. ViewerManager 싱글톤을 중심으로 카메라 제어, 시각화, 검색, 데이터 조회, 애니메이션 기능을 제공합니다.

## 아키텍처

```
tandemHelpers/
├── ViewerManager.ts        # Viewer, App, Facility 인스턴스 관리 (싱글톤)
├── ViewerControl.ts        # 카메라 제어 및 시각화 (선택, 투명도, 가시성)
├── ViewerSearch.ts         # 검색 및 필터링 (레벨, 룸, 카테고리, Facet)
├── ViewerData.ts           # ID 변환 및 속성 조회
├── ViewerAnimation.ts      # Fragment Transform 및 애니메이션
├── TandemAPI.ts            # Tandem API 통신 (Facility, 스캔, 스키마)
├── IndexedDB.ts            # 로컬 DB 캐싱
├── LevelRoomManager.ts     # 레벨/룸 데이터 관리
├── types.ts                # 타입 정의
└── constants.ts            # 설정 상수
```

### 핵심 패턴

**싱글톤 접근**: `ViewerManager` (VM)를 통해 모든 전역 인스턴스와 SDK 객체에 접근합니다.

```typescript
import { VM } from "@/utils/tandemHelpers";

VM.instance.viewer; // GuiViewer3D
VM.instance.app; // DtApp
VM.instance.facility; // DtFacility
VM.Autodesk.Viewing; // Autodesk SDK
VM.THREE; // THREE.js
VM.Events; // 이벤트 타입 상수
```

## ViewerManager

Viewer, App, Facility 인스턴스를 초기화하고 전역 관리합니다.

### 초기화

```typescript
import { VM } from "@/utils/tandemHelpers";

// 1. 토큰 관리자 설정
VM.instance.setTokenManager(tokenManager, {
    refreshTTL: 60, // 토큰 갱신 기준 시간 (초)
    defaultTTL: 3599, // 기본 만료 시간 (초)
});

// 2. Viewer 초기화
await VM.instance.initialize(divElement);

// 3. Facility 목록 조회
const facilities = await VM.instance.fetchFacilities();

// 4. Facility 열기
const facility = await VM.instance.openFacility(selectedFacility);

// 5. 뷰어 옵션 설정
VM.instance.setupViewerOptions();
```

**초기화 시 자동 설정**:

- Light Preset: "Plaza"
- 배경색 그라데이션
- Edge Rendering 활성화
- Ground Shadow 활성화
- Selection Mode: LEAF_OBJECT (0)

### 인스턴스 접근

```typescript
const viewer = VM.instance.viewer;
const app = VM.instance.app;
const facility = VM.instance.facility;
const streamManager = VM.instance.streamManager;

// 모델 URN으로 조회
const model = VM.instance.getModelByUrn("urn:adsk.dtm:...");
```

### 토큰 관리

`ITokenManager` 인터페이스를 구현하여 토큰 갱신을 자동화합니다:

```typescript
interface ITokenManager {
    getToken(): string | null;
    refreshToken(): Promise<string | null>;
    getTokenTTL(): number;
}
```

**401 에러 자동 재시도**: HTTP 요청 실패 시 자동으로 토큰을 갱신하고 요청을 재시도합니다.

## ViewerControl

카메라 이동, 선택, 가시성, 투명도를 제어합니다.

### 카메라 제어

```typescript
import { setCameraView, animateCameraTo, fitToViewAnimated } from "@/utils/tandemHelpers";

// 초기 뷰로 복귀 (1초 애니메이션)
await setCameraView(undefined, 1);

// 특정 뷰로 이동
const targetView = {
    eye: new VM.THREE.Vector3(100, 100, 100),
    target: new VM.THREE.Vector3(0, 0, 0),
    up: new VM.THREE.Vector3(0, 0, 1),
};
await animateCameraTo(viewer, targetView, {
    seconds: 2,
    easing: Easing.Quadratic.InOut,
    cancelOnInput: true, // 사용자 입력 시 취소
});

// 요소에 맞춤 (Top-Down 뷰 옵션)
await fitToViewAnimated(model, [dbId1, dbId2], {
    horizontalMargin: 0.3,
    verticalMargin: 0.3,
    duration: 1,
    topDown: true, // Z축 상단에서 내려다보기
});
```

### 선택 및 가시성

```typescript
import { isolateAndFitToView, showRoomAndSelectElement, resetViewer } from "@/utils/tandemHelpers";

// 요소 격리 및 포커스
await isolateAndFitToView(model, dbIds);

// 룸 내부 요소 표시 및 특정 요소 선택
await showRoomAndSelectElement(roomModelUrn, roomDbId, [elementDbId], elementModel);

// Viewer 초기화 (모두 표시 + 초기 카메라)
await resetViewer();
```

### 투명도 제어

```typescript
import { setTransparency, setTransparencyExcept } from "@/utils/tandemHelpers";

// 특정 요소에 투명도 적용
const dbIds = new Set([dbId1, dbId2]);
setTransparency(dbIds, 0.3, {
    depthWrite: true,
    depthTest: true,
    disableColors: false,
    disableShadows: false,
});

// 예외를 제외한 모든 요소 투명화
const exceptions = [{ modelUrn: "urn:adsk.dtm:...", dbIds: new Set([100, 200]) }];
const restore = setTransparencyExcept(exceptions, 0.1);

// 원래 상태로 복원
restore();
```

**투명도 옵션**:

- `opacity`: 0.0 (완전 투명) ~ 1.0 (불투명)
- `depthWrite`: Z-buffer 쓰기 여부
- `depthTest`: 깊이 테스트 여부
- `disableColors`: 색상 제거 (완전 검은색)
- `disableShadows`: 그림자 비활성화

## ViewerSearch

레벨, 룸, 카테고리, 필드, Facet 기반 검색을 제공합니다.

### 기본 검색

```typescript
import { searchByLevel, searchByRoom, searchByCategory } from "@/utils/tandemHelpers";

// 레벨명으로 검색
const levelData = searchByLevel("1F");

// 룸명으로 검색
const roomData = searchByRoom("Room 101");

// 카테고리명으로 검색
const wallData = await searchByCategory("Walls");
```

### 필드 검색

```typescript
import { searchDbIdsByField } from "@/utils/tandemHelpers";

// 단일 필드 검색
const result = await searchDbIdsByField("n:n", ["Wall-001", "Wall-002"]);

// 복수 필드 검색 (OR 조건)
const result = await searchDbIdsByField(
    ["n:n", "n:!n"], // 이름 또는 오버라이드 이름
    ["Wall-001"]
);

// 결과 구조
result.matchingAssets.forEach((asset) => {
    console.log(asset.k); // Element ID
    console.log(asset.dbIds); // DbId 배열
    console.log(asset.modelUrn); // 모델 URN
    console.log(asset["n:n"]); // 필드 값
});
```

### Facet 검색

```typescript
import { searchDbIdsByFacet, getFacetValues } from "@/utils/tandemHelpers";

// Facet 타입별 모든 값 조회
const levelValues = getFacetValues(VM.FacetTypes.levels);
const spaceValues = getFacetValues(VM.FacetTypes.spaces);
const categoryValues = getFacetValues(VM.FacetTypes.cats);

// Facet Value ID로 DbId 검색
const dbIdMap = searchDbIdsByFacet(
    VM.FacetTypes.levels,
    "level-1", // Facet Value ID
    "urn:adsk.dtm:..." // 특정 모델 (선택)
);

// 결과: { "urn:adsk.dtm:...": [dbId1, dbId2, ...] }
Object.entries(dbIdMap).forEach(([modelUrn, dbIds]) => {
    const model = VM.instance.getModelByUrn(modelUrn);
    viewer.isolate(dbIds, model);
});
```

### 복합 검색

```typescript
import { search } from "@/utils/tandemHelpers";

// 조건에 맞는 데이터 검색
const results = await search({
    field: { name: "n:z", values: ["OST_Walls"] }, // 카테고리
    // 또는
    category: "Walls",
    // 또는
    levelName: "1F",
    // 또는
    roomName: "Room 101",
});
```

## ViewerData

ID 변환, 속성 조회, 바운딩 박스 계산을 담당합니다.

### ID 변환

```typescript
import { getDbIdsFromElementIds, getElementIdFromDbId } from "@/utils/tandemHelpers";

// ElementId → DbId 변환
const elementIds = ["AAAAAA==", "BBBBBB=="];
const dbIds = await getDbIdsFromElementIds(model, elementIds);

// DbId → ElementId 변환
const elementId = await getElementIdFromDbId(model, dbId);
```

**주의**: ElementId는 Base64URL 인코딩된 24바이트 문자열입니다 (Flags 포함).

### 속성 조회

```typescript
import { getProperties, getParameterValue } from "@/utils/tandemHelpers";

// DbId의 속성 조회
const props = await getProperties(model, dbId);
console.log(props.name);
console.log(props.properties);

// 모델 데이터에서 파라미터 값 추출
const data = { "r:gQg": "value1", "r:igg": "value2" };
const paramValue = getParameterValue(data); // "value1"
```

### 바운딩 박스

```typescript
import { getBoundingBox } from "@/utils/tandemHelpers";

// DbId의 3D 바운딩 박스
const bbox = getBoundingBox(model, dbId);
if (bbox) {
    console.log(bbox.min); // THREE.Vector3
    console.log(bbox.max); // THREE.Vector3

    const center = new VM.THREE.Vector3();
    bbox.getCenter(center);

    const size = new VM.THREE.Vector3();
    bbox.getSize(size);
}
```

## ViewerAnimation

Fragment Transform을 조작하여 요소 이동 애니메이션을 구현합니다.

### Fragment ID 조회

```typescript
import { getFragmentIds, getFragmentTransformMatrix } from "@/utils/tandemHelpers";

// DbId에 연결된 모든 Fragment ID
const fragIds = getFragmentIds(model, dbId);

// Fragment Transform Matrix
const matrix = getFragmentTransformMatrix(model, fragId);
console.log(matrix.elements); // Float32Array[16]
```

### 애니메이션 실행

```typescript
import { FragmentAnimator, Easing } from "@/utils/tandemHelpers";

const animator = FragmentAnimator.instance;

// Fragment를 목표 위치로 이동
const tweenId = animator.translateFragments({
    modelUrn: "urn:adsk.dtm:...",
    fragIds: [100, 101, 102],
    x: 50, // X축 목표 위치 (mm)
    y: 0, // Y축 목표 위치
    z: 0, // Z축 목표 위치
    durationMs: 2000, // 애니메이션 시간 (밀리초)
    easingFunction: Easing.Quadratic.InOut,
});

// 애니메이션 중단
animator.stop(tweenId);

// 모든 애니메이션 중단
animator.stopAll();
```

**Easing 함수**:

- `Easing.Linear.None`
- `Easing.Quadratic.In`, `Out`, `InOut`
- `Easing.Cubic.In`, `Out`, `InOut`
- `Easing.Elastic.Out`
- `Easing.Bounce.Out`

## TandemAPI

Tandem API 통신을 담당합니다.

### 설정

```typescript
import { TandemAPI } from "@/utils/tandemHelpers";

// HTTP 클라이언트 설정
TandemAPI.instance.setHttpClient(axiosInstance);
```

`IHttpClient` 인터페이스:

```typescript
interface IHttpClient {
    get<T = any>(url: string, config?: any): Promise<{ data: T }>;
    post<T = any>(url: string, data?: any, config?: any): Promise<{ data: T }>;
}
```

### API 호출

```typescript
// Facility 정보 조회
const facilityData = await TandemAPI.instance.getFacility(facilityUrn);

// 모델 데이터 스캔
const scanResults = await TandemAPI.instance.scanModel(modelUrn, {
    families: ["n", "l", "r"],
    filter: { "n:CategoryId": "OST_Walls" },
});

// 모델 스키마 조회 (캐싱 지원)
const schema = await TandemAPI.instance.getSchema(modelUrn);
console.log(schema.attributes);

// 스키마 캐시 초기화
TandemAPI.instance.clearSchemaCache();
```

**API 엔드포인트**:

- Developer API: `https://developer.api.autodesk.com/tandem/v1`
- Web API: `https://tandem.autodesk.com/api/v1`

## IndexedDB

Tandem 데이터를 로컬 IndexedDB에 캐싱합니다.

### 데이터 저장

```typescript
import { db } from "@/utils/tandemHelpers";

// 데이터 저장
await db.bulkSaveData([
    { k: "AAAAAA==", l_l: "level-1", l_r: "room-1", modelUrn: "..." },
    { k: "BBBBBB==", l_l: "level-1", l_r: "room-2", modelUrn: "..." },
]);

// 스키마 저장
await db.bulkSaveSchema([
    { id: "attr-1", name: "Temperature" },
    { id: "attr-2", name: "Pressure" },
]);
```

### 데이터 조회

```typescript
// 전체 데이터 조회
const allData = await db.getAllData();

// Element ID로 조회
const data = await db.getByElementId("AAAAAA==");

// 레벨 ID로 조회
const levelData = await db.getByLevelId("level-1");

// 룸 ID로 조회
const roomData = await db.getByRoomId("room-1");

// 스키마 조회
const allSchema = await db.getAllSchema();
```

### 데이터 삭제

```typescript
// 전체 데이터 삭제
await db.clearAllData();

// 전체 스키마 삭제
await db.clearAllSchema();
```

**IndexedDB 구조**:

- DB 이름: `dt`
- 테이블: `tandemData`, `tandemSchema`
- 인덱스: `k`, `l_l`, `l_r`, `x_r`

## LevelRoomManager

레벨과 룸 데이터를 메모리에 캐싱하고 빠른 검색을 제공합니다.

### 초기화

```typescript
import { LevelRoomManager } from "@/utils/tandemHelpers";

const manager = LevelRoomManager.instance;

// 모든 모델 데이터 로드
await manager.loadAllModels();
```

### 레벨 데이터 조회

```typescript
// 레벨명으로 데이터 검색
const dataList = manager.getDataByLevelName("1F");

// 레벨 ID로 이름 조회
const levelName = manager.getNameByLevelId("level-1");

// 레벨 ID 목록
const levelIds = manager.getLevelIds();

// 레벨 이름 목록
const levelNames = manager.getLevelNames();
```

### 룸 데이터 조회

```typescript
// 룸명으로 데이터 검색
const dataList = manager.getDataByRoomName("Room 101");

// 룸 ID로 이름 조회
const roomName = manager.getNameByRoomId("room-1");

// 룸 ID 목록
const roomIds = manager.getRoomIds();

// 룸 이름 목록
const roomNames = manager.getRoomNames();
```

### 룸 내부 요소 조회

```typescript
// 특정 룸에 포함된 모든 모델의 요소 검색
const roomElements = await manager.getElementsInRoom(roomModelUrn, roomDbId);

// 결과 구조
roomElements.forEach(({ model, dbIds }) => {
    console.log(model.urn());
    console.log(dbIds); // 이 모델에서 룸 내부에 있는 요소들
});
```

## 상수 및 타입

### 주요 상수

```typescript
import { TANDEM_VIEWER, TANDEM_API, TANDEM_FIELDS, INDEXED_DB } from "@/utils/tandemHelpers";

// Viewer 설정
TANDEM_VIEWER.ENV; // "DtProduction"
TANDEM_VIEWER.LIGHT_PRESET; // "Plaza"
TANDEM_VIEWER.SELECTION_MODE; // 0 (LEAF_OBJECT)

// API 엔드포인트
TANDEM_API.DEVELOPER_URL;
TANDEM_API.WEB_URL;

// 데이터 필드명
TANDEM_FIELDS.NAME; // "n:n"
TANDEM_FIELDS.LEVEL; // "l:l"
TANDEM_FIELDS.ROOM; // "l:r"
TANDEM_FIELDS.CATEGORY; // "n:z"

// IndexedDB 설정
INDEXED_DB.NAME; // "dt"
INDEXED_DB.TABLES.TANDEM_DATA; // "tandemData"
```

### 주요 타입

```typescript
import type {
    IVector3,
    TCameraView,
    IModelData,
    TLevelDataMap,
    TRoomDataMap,
    TFacetDbIdMap,
    IFragmentAnimationParams,
} from "@/utils/tandemHelpers";
```

## 사용 패턴

### 1. 레벨별 요소 시각화

```typescript
import { VM, getFacetValues, searchDbIdsByFacet, fitToViewAnimated } from "@/utils/tandemHelpers";

// 모든 레벨 조회
const levels = getFacetValues(VM.FacetTypes.levels);

// 특정 레벨의 요소 검색
const dbIdMap = searchDbIdsByFacet(VM.FacetTypes.levels, "level-1");

// 시각화
Object.entries(dbIdMap).forEach(([modelUrn, dbIds]) => {
    const model = VM.instance.getModelByUrn(modelUrn);
    VM.instance.viewer.isolate(dbIds, model);
});

// 카메라 포커스
const firstModel = VM.instance.getModelByUrn(Object.keys(dbIdMap)[0]);
await fitToViewAnimated(firstModel, dbIdMap[firstModel.urn()]);
```

### 2. 카테고리별 색상 적용

```typescript
import { VM, searchByCategory, getDbIdsFromElementIds } from "@/utils/tandemHelpers";

const wallData = await searchByCategory("Walls");
const elementIds = wallData.map((d) => d.k);
const model = VM.instance.getModelByUrn(wallData[0].modelUrn);
const dbIds = await getDbIdsFromElementIds(model, elementIds);

// 색상 적용
const wallColor = new VM.THREE.Vector4(0.8, 0.8, 0.8, 0.7);
dbIds.forEach((dbId) => {
    VM.instance.viewer.setThemingColor(dbId, wallColor, model);
});
```

### 3. 룸 기반 필터링

```typescript
import { LevelRoomManager, showRoomAndSelectElement } from "@/utils/tandemHelpers";

const manager = LevelRoomManager.instance;
await manager.loadAllModels();

// 룸명 목록
const roomNames = manager.getRoomNames();

// 특정 룸 선택 시
const roomData = manager.getDataByRoomName(selectedRoomName)[0];
const roomModel = VM.instance.getModelByUrn(roomData._modelUrn);
const roomDbIds = await getDbIdsFromElementIds(roomModel, [roomData.k]);

// 룸 내부 요소 표시
const elementDbIds = [
    /* 선택된 요소 DbId */
];
await showRoomAndSelectElement(roomData._modelUrn, roomDbIds[0], elementDbIds, elementModel);
```

### 4. 애니메이션 시퀀스

```typescript
import { FragmentAnimator, Easing, getFragmentIds } from "@/utils/tandemHelpers";

const animator = FragmentAnimator.instance;
const model = VM.instance.viewer.getVisibleModels()[0];
const fragIds = getFragmentIds(model, dbId);

// 위로 이동
const tweenId1 = animator.translateFragments({
    modelUrn: model.urn(),
    fragIds,
    z: 100,
    durationMs: 1000,
    easingFunction: Easing.Quadratic.Out,
});

// 1초 후 원래 위치로 복귀
setTimeout(() => {
    animator.translateFragments({
        modelUrn: model.urn(),
        fragIds,
        z: 0,
        durationMs: 1000,
        easingFunction: Easing.Quadratic.In,
    });
}, 2000);
```

## 확장 기능

### VisualClusters Extension

`ViewerManager`는 VisualClusters Extension을 자동으로 로드합니다:

```typescript
await VM.instance.loadExtensions();

// Extension 접근
const clusters = VM.instance.clusters;

// 사용법은 Extension 문서 참조
```

### 커스텀 Extension 등록

```typescript
import { VM } from "@/utils/tandemHelpers";

// Extension 등록
VM.Autodesk.Viewing.theExtensionManager.registerExtension("MyExtension", MyExtensionClass);

// 로드
await VM.instance.viewer.loadExtension("MyExtension");
```

## 주의사항

**비동기 함수**: ID 변환, 속성 조회, API 호출은 모두 비동기이므로 `await` 필수입니다.

**모델 로드 확인**: Viewer에서 모델이 완전히 로드된 후 데이터 조회를 시작해야 합니다.

```typescript
VM.instance.viewer.addEventListener(VM.Events.MODEL_ADDED_EVENT, async () => {
    // 모델 로드 완료 후 작업
    await LevelRoomManager.instance.loadAllModels();
});
```

**Fragment Transform 갱신**: Transform 변경 후 반드시 `invalidate()` 호출해야 화면에 반영됩니다.

```typescript
VM.instance.viewer.impl.invalidate(true, true, true);
```

**Element ID 정규화**: API 응답의 Element ID (20바이트)와 Viewer의 Element ID (24바이트)는 서로 다르므로 비교 시 주의가 필요합니다.
