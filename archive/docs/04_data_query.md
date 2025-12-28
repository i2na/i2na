<sub>2025.12.28 19:24</sub>

# 데이터 조회 및 쿼리

모델 데이터는 칼럼 패밀리(Column Family) 방식으로 구성되어 지오메트리, 속성, 관계 정보를 분류합니다. `query()`는 조건에 맞는 요소만 필터링하여 검색합니다. `getPropertiesDt()`는 여러 요소의 속성을 조회합니다. Facets는 층(Level), 공간(Room), 카테고리(Category) 등으로 요소를 분류하고 `FacetsManager`로 필터링과 가시성을 제어합니다. Instance Tree는 요소 간 부모-자식 계층 구조를 나타내고, Fragment는 실제 렌더링되는 단위로 위치와 크기 정보를 가집니다. StreamManager는 센서의 최신 측정값과 시간별 데이터 이력을 조회합니다.

# 1. Column Families

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

# 2. Query API

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

## 필터 연산자

| 연산자    | 설명        | 예시                                                                            |
| --------- | ----------- | ------------------------------------------------------------------------------- |
| `=`       | 같음        | `{ column: "n:Name", operator: "=", value: "Wall_001" }`                        |
| `!=`      | 다름        | `{ column: "n:CategoryId", operator: "!=", value: "OST_Doors" }`                |
| `exists`  | 컬럼 존재   | `{ column: "l:Level", operator: "exists" }`                                     |
| `!exists` | 컬럼 미존재 | `{ column: "l:Rooms", operator: "!exists" }`                                    |
| `in`      | 값 포함     | `{ column: "n:CategoryId", operator: "in", value: ["OST_Walls", "OST_Doors"] }` |

## 반환 형식

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

# 3. Property 조회

특정 요소의 속성을 조회합니다.

## getPropertiesDt()

여러 요소의 속성을 한 번에 가져옵니다 (Tandem 전용):

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

# 4. Schema API

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

# 5. Facets 시스템

Facets는 요소를 계층적으로 분류하는 시스템입니다. UI에서 필터링, 테마, 가시성 제어에 사용됩니다.

## Facet 타입

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

## FacetsManager

`facility.facetsManager`는 모든 Facet을 관리합니다.

### Facet 정의 조회

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

### 특정 Facet 조회

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

### 가시성 제어

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
const levelsDef = facility.facetsManager.getFacetDefs()[1]; // Levels는 보통 index 1
facility.facetsManager.setVisibilityById(1, ["level-1"], true);

// 초기화
facility.facetsManager.resetVisibility();
```

## 커스텀 Facet

속성 기반 Facet을 동적으로 생성할 수 있습니다:

```javascript
const customFacet = await model.getCustomFacets({
    attributeHash: "a123", // 속성 ID
});
```

# 6. Level과 Room

## Level 구조

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

## Level 요소 조회

특정 Level에 속한 모든 요소의 dbId를 가져옵니다:

```javascript
const dbIds = model.getElementsForLevel(levelDbId);
// 반환: number[]
```

## Room 요소 조회

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

-   Room의 Bounding Box를 계산합니다.
-   모든 로드된 모델을 순회하며 해당 영역 내 요소를 검색합니다.
-   공간 쿼리는 Fragment의 Bounding Box 교집합으로 수행됩니다.

# 7. Instance Tree

Instance Tree는 요소의 계층 구조를 나타냅니다 (Parent-Child 관계).

## 가져오기

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

## 계층 탐색

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

# 8. Fragment

Fragment는 렌더링 단위입니다. 하나의 요소(dbId)가 여러 Fragment를 가질 수 있습니다.

## FragmentList

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

## 모델 Bounding Box

```javascript
const bbox = model.getBoundingBox();
// THREE.Box3: 모델 전체의 AABB
```

# 9. Streams (IoT 데이터)

StreamManager는 센서 데이터와 시계열 정보를 관리합니다.

## StreamManager 접근

```javascript
const streamMgr = facility.getStreamManager();
// 또는
const streamMgr = facility.streamMgr;
```

## 최신 데이터 조회

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

## 시계열 데이터 조회

특정 시간 범위의 데이터를 가져옵니다:

```javascript
const telemetryData = await streamMgr.getStreamData(
    streamDbId,
    startTimeMs,
    endTimeMs,
    granularity // "hour", "day", "week", "month"
);
```

**반환 형식**:

```javascript
{
  readings: [
    { timestamp: 1700000000000, value: 23.5 },
    { timestamp: 1700003600000, value: 24.1 },
    // ...
  ],
  property: "Temperature",
  units: "°C",
}
```

## Stream 요소 확인

```javascript
// dbId가 Stream 요소인지 확인
const flags = model.getData().dbId2flags;
const isStream = flags?.[dbId] === ElementFlags.Stream;
```

**Stream 요소**는 Default 모델에만 존재하며, `createStream()` 메서드로 생성됩니다.

# 10. 조회 패턴

## 패턴 1: 초기 데이터 로드

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

## 패턴 2: 선택 요소 속성 조회

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

## 패턴 3: 카테고리 필터링

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

## 패턴 4: Level별 필터링

```javascript
// FacetsManager를 통한 Level 필터링
const levelFacet = facility.facetsManager.getFacet("levels");

// 특정 Level만 표시
function showLevel(levelId) {
    const levelNode = levelFacet[levelId];
    if (!levelNode) return;

    // FacetsManager를 사용하여 가시성 제어 (권장)
    facility.facetsManager.setVisibilityById(
        1, // Levels는 보통 인덱스 1
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

# 정리

| API                     | 용도               | 반환 형식                         |
| ----------------------- | ------------------ | --------------------------------- |
| `query()`               | 조건부 데이터 검색 | `{ k, "family:column": value }[]` |
| `getPropertiesDt()`     | 다중 요소 속성     | Tandem 속성 객체 (교집합/개별)    |
| `getHash2Attr()`        | 속성 정의          | `{ [attrId]: AttributeDef }`      |
| `getFacetDefs()`        | Facet 목록         | `FacetDef[]`                      |
| `getFacet()`            | Facet 데이터       | `{ [id]: MergedFacetNode }`       |
| `getLevels()`           | Level 정보         | `{ [dbId]: LevelData }`           |
| `getElementsForLevel()` | Level 요소         | `number[]`                        |
| `getElementsInRoom()`   | Room 요소          | `{ model, dbIds }[]`              |
| `getInstanceTree()`     | 계층 구조          | `InstanceTree`                    |
| `getFragmentList()`     | Fragment 데이터    | `FragmentList`                    |
| `getLastReadings()`     | 최신 센서 값       | `{ [property]: { ts, val } }[]`   |
| `getStreamData()`       | 시계열 데이터      | `{ readings, property, units }`   |
