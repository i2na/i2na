<sub>2025.12.28 19:23</sub>

# Tandem ID 체계

건물의 벽, 문, 창문 같은 요소 하나하나는 고유한 식별자를 가집니다. Autodesk Tandem에서는 같은 요소를 두 가지 방식으로 식별하는데, 화면에서 보여주고 조작할 때는 간단한 숫자(dbId)를, 서버와 데이터를 주고받을 때는 영구적인 문자열(extId)을 사용합니다. 숫자 ID는 프로그램을 실행할 때마다 달라질 수 있어 빠르지만 저장할 수 없고, 문자열 ID는 항상 동일하게 유지되어 데이터베이스에 저장하거나 다른 시스템과 공유할 수 있습니다.

# ID 타입

## dbId (Database ID)

**타입**: `number`  
**크기**: 정수형  
**용도**: 뷰어 내부 식별자

뷰어가 런타임에 모델 로딩 시 생성하는 임시 숫자 ID입니다. `dbId`는 1부터 시작하며, 모델의 루트 요소는 항상 `dbId = 1`을 가집니다. 뷰어 세션 내에서 객체의 시각적 조작에 사용됩니다:

-   객체 선택: `viewer.select(dbId)`
-   객체 격리: `viewer.isolate(dbIds)`
-   객체 숨기기/보이기: `viewer.hide(dbId)` / `viewer.show(dbId)`
-   카메라 포커싱: `viewer.fitToView(dbIds)`

`dbId`는 세션이나 모델 로딩 순서에 따라 값이 달라질 수 있으므로, 데이터베이스나 로컬 스토리지에 영구 저장하는 용도로 사용할 수 없습니다. 저장이 필요한 경우 반드시 `extId`로 변환한 후 저장해야 합니다.

## extId (External ID)

**타입**: `string`  
**인코딩**: Base64URL  
**크기**: 20바이트 (인코딩 시 27자) 또는 24바이트 (인코딩 시 32자)  
**용도**: 영구 식별자

원본 설계 파일(Revit)과 Tandem 데이터베이스가 공유하는 고유 ID로, 세션과 무관하게 동일한 객체를 식별할 수 있습니다. Base64URL로 인코딩된 문자열 형태(예: `AAAAAF8gDdJvQbCY1TvYDFdF`)이며, 컨텍스트에 따라 다양한 이름으로 참조됩니다:

-   **`extId`**: SDK 내부 코드
-   **`key`** / **`k`**: API 요청/응답
-   **`HostElementID`**: CSV 데이터, 원본 파일
-   **`elementId`**: 함수 파라미터명

### extId 구조

SDK는 두 가지 형식의 extId를 처리합니다:

1. **Core Element ID (20바이트)**

    ```
    [20바이트 고유 식별자]
    ```

    - Tandem DB에 저장되는 순수 ID
    - Base64URL 인코딩 시 27자

2. **Element ID with Flags (24바이트)**
    ```
    [4바이트 Flags] + [20바이트 고유 식별자]
    ```
    - 뷰어가 반환하는 ID 형식
    - Flags: 요소의 타입과 상태 정보
    - Base64URL 인코딩 시 32자

### Flags 구조

`ElementFlags`는 요소의 타입과 상태를 나타내는 32비트 비트마스크입니다. 최상위 바이트(Big-Endian의 첫 번째 바이트)로 요소의 주요 분류를 구분합니다:

```javascript
// dt-schema.js 참조
const ElementFlags = {
    // 물리적 요소 (지오메트리 있음, 최상위 바이트 = 0x00)
    SimpleElement: 0x00000000, // 일반 요소
    NestedChild: 0x00000001, // 중첩된 자식 요소 (호스트 내부)
    NestedParent: 0x00000002, // 호스트 패밀리 (가구, 엘리베이터 등)
    CompositeChild: 0x00000003, // 커튼월 구성 요소 (패널, 멀리온)
    CompositeParent: 0x00000004, // 커튼월 부모 요소
    Room: 0x00000005, // 룸 경계

    // 논리적 요소 (지오메트리 없음, 최상위 바이트 = 0x01)
    FamilyType: 0x01000000, // 패밀리 타입 (물리적 요소의 부모)
    Level: 0x01000001, // 레벨
    DocumentRoot: 0x01000002, // Revit 문서 루트
    Stream: 0x01000003, // IoT 데이터 스트림
    System: 0x01000004, // MEP 시스템
    GenericAsset: 0x01000005, // 일반 자산

    // 가상 요소 (인스턴스 트리 내부 노드, 최상위 바이트 = 0x03)
    Virtual: 0x03000000,

    // 런타임 플래그
    Deleted: 0xfffffffe, // 세션 내 삭제 예정
    Unknown: 0xffffffff,
};

const ElementIdSize = 20; // Core Element ID
const ElementFlagsSize = 4; // Flags 크기
const ElementIdWithFlagsSize = 24; // Flags + Element ID
```

# ID 변환

뷰어 조작(`dbId` 기반)과 데이터 조회(`extId` 기반)를 연동하려면 두 ID 타입 간 변환이 필요합니다.

## API 메서드

SDK는 배치 처리를 위해 배열 기반 변환 메서드를 제공합니다:

```javascript
// extId → dbId 변환
const dbIds = await model.getDbIdsFromElementIds([extId1, extId2]);

// dbId → extId 변환
const extIds = await model.getElementIdsFromDbIds([dbId1, dbId2]);
```

두 메서드 모두 Worker와 통신하는 비동기 함수이므로 반드시 `await`를 사용해야 합니다. 여러 ID를 변환할 때는 루프 내에서 개별 호출하지 말고 배열로 한 번에 처리하는 것이 효율적입니다.

## 내부 구현

SDK는 `IdMapper` 클래스로 양방향 매핑을 관리합니다. 내부적으로 extId는 packed binary string 형태로 저장되며, Base64URL 인코딩은 입출력 시에만 수행됩니다:

```javascript
// IdMapper.js
class IdMapper {
    constructor() {
        this.extIds = [zeroString]; // dbId → extId (packed binary)
        this.extIdToIndex = new Map(); // extId → dbId
        this.numLoaded = 1;
        this.rootId = 1; // 루트는 항상 1, all-zero ID
    }

    // Base64 extId를 추가하고 새 dbId 반환
    addEntityFromB64(extId) {
        let binString = b64ToBinaryString(extId);

        // 24바이트(flags 포함)면 20바이트로 정규화
        if (binString.length === 12 /*24바이트 / 2*/) {
            binString = binString.slice(2); // 앞 4바이트 제거
        }

        return this.addEntity(binString);
    }

    addEntity(extId) {
        if (!extId) return 0;

        let dbId = this.extIdToIndex.get(extId);
        if (dbId === undefined) {
            dbId = this.numLoaded++;
            this.extIdToIndex.set(extId, dbId);
            this.extIds[dbId] = extId;
        }
        return dbId;
    }

    // dbId → extId (Base64URL)
    getEncodedElementId(dbId) {
        if (dbId === this.rootId) return "";

        let eid = this.extIds[dbId];
        if (!eid) return null;

        packedToBin(eid, _buf, 0);
        return base64EncArr(_buf);
    }

    // Base64 extId → dbId
    getDbIdFromB64ExternalId(extId) {
        const len = base64DecToArr(extId, _buf24);
        let res;

        if (len === 20) {
            res = binToPackedString(_buf24, 0, ElementIdSize);
        } else if (len === 24) {
            // flags 제거
            res = binToPackedString(_buf24, 4, ElementIdSize);
        }

        return this.extIdToIndex.get(res);
    }
}
```

# ID 정규화

Tandem API 응답의 `k` 필드는 20바이트 Core Element ID를 반환하지만, 뷰어의 `getElementIdsFromDbIds`는 24바이트(flags 포함)를 반환합니다. 두 소스의 ID를 비교하거나 매칭하려면 정규화가 필요합니다:

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

# Revit GUID 변환

SDK는 extId를 Revit GUID 형식으로 변환하는 기능도 제공합니다. Revit GUID는 `8-4-4-4-12-8` 그룹의 16진수 문자열로 구성됩니다:

```javascript
// IdMapper.js
getEncodedElementGUID(dbId) {
  if (dbId === this.rootId) return "";

  let eid = this.getElementId(dbId);
  if (!eid) return null;

  packedToBin(eid, _buf, 0);
  const hex = binToHexString(_buf).split('');

  // Revit GUID 형식: 8-4-4-4-12-8
  const hexGroups = [8, 4, 4, 4, 12];
  let dashPosition = 0;
  for (let i = 0; i < hexGroups.length; i++) {
    dashPosition += hexGroups[i];
    hex.splice(dashPosition, 0, '-');
    dashPosition++;
  }

  return hex.join('');
  // 예: "3a7b9c1d-4e2f-5a6b-8c9d-1e2f3a4b5c6d-7e8f9a0b"
}
```

# 사용 시나리오

## 1. 뷰어 선택 → API 데이터 조회

```javascript
viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, async (event) => {
    const dbId = event.dbIdArray[0];

    // dbId → extId 변환
    const [extId] = await model.getElementIdsFromDbIds([dbId]);

    // extId로 API 호출
    const response = await fetch(`/api/elements/${extId}`);
    const data = await response.json();
});
```

## 2. API 데이터 → 뷰어 시각화

```javascript
// API 응답 (예: HVAC 시스템 요소 목록)
const response = await fetch("/api/elements?category=HVAC");
const elements = await response.json(); // [{ k: "extId1" }, { k: "extId2" }, ...]

// extId 추출 및 변환
const extIds = elements.map((el) => el.k);
const dbIds = await model.getDbIdsFromElementIds(extIds);

// 뷰어에서 시각화
viewer.isolate(dbIds, model);
viewer.fitToView(dbIds, model);
```

## 3. 영구 저장 및 복원

```javascript
// 저장: dbId → extId 변환 후 localStorage에 저장
const selection = viewer.getSelection();
const extIds = await model.getElementIdsFromDbIds(selection);
localStorage.setItem("bookmark", JSON.stringify(extIds));

// 복원: extId → dbId 변환 후 선택
const savedExtIds = JSON.parse(localStorage.getItem("bookmark"));
const dbIds = await model.getDbIdsFromElementIds(savedExtIds);
viewer.select(dbIds, model);
```

**중요**: `dbId`는 세션마다 변경되므로 저장 시 반드시 `extId`로 변환해야 합니다.

# 특수 케이스

## Root Element

모델의 루트 요소는 항상 `dbId = 1`을 가지며, all-zero ID로 초기화됩니다. `getElementIdsFromDbIds([1])`은 빈 문자열 `""`을 반환합니다.

## 존재하지 않는 ID

-   `getDbIdsFromElementIds`에 존재하지 않는 extId를 전달하면 해당 위치에 `undefined`가 반환됩니다.
-   `getElementIdsFromDbIds`에 존재하지 않는 dbId를 전달하면 해당 위치에 `null`이 반환됩니다.

## ID 배열 순서

변환 메서드는 입력 배열의 순서를 유지합니다. `[dbId1, dbId2, dbId3]`를 변환하면 `[extId1, extId2, extId3]` 순서로 반환됩니다.
