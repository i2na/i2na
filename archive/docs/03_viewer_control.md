---
visibility: private
sharedWith:
    [
        yena@moss.land,
        wooram.son@moss.land,
        mu@moss.land,
        yd@moss.land,
        alex@moss.land,
        jhkim@moss.land,
        chohyuntae@moss.land,
        akasimp@moss.land,
        sangminlee79@moss.land,
        jeong@moss.land,
        pks0303@moss.land,
        dosl1025@moss.land,
    ]
createdAt: 2025.12.30 23:47
---

# Viewer 제어

Viewer 런타임 제어는 로딩 완료 후 사용자 상호작용과 데이터 기반 시각화를 구현하는 단계입니다. 가시성 제어(`show()`, `hide()`, `isolate()`)로 특정 요소만 표시하고, 선택(`select()`)과 선택 모드(SelectionMode)로 사용자 인터랙션을 처리합니다. 카메라는 `navigation.setView()`로 위치를 지정하고 `fitToView()`로 화면에 맞추며, Camera Transition API로 부드러운 애니메이션 전환을 구현합니다. `setThemingColor()`는 색상 오버레이를 적용하고, Material 투명도 조작으로 유리 재질 효과를 만듭니다. 조명은 Directional Light와 Ambient Light로 구성되며 Light Preset으로 실내/실외 환경을 설정하고, IBL 환경 맵을 런타임에 회전하여 동적 조명 효과를 만듭니다. Fragment Transform 시스템은 Float32Array에 저장된 4x3 매트릭스를 조작하여 요소를 이동, 회전, 스케일하며, `requestAnimationFrame`과 Easing 함수로 부드러운 애니메이션을 구현합니다. EventDispatcher는 이벤트 리스너를 등록하고 커스텀 이벤트를 발생시킵니다.

## Visibility 제어

### 기본 메서드

요소의 표시 상태를 제어합니다.

```javascript
// 특정 요소 숨김
viewer.hide(dbId, model);
viewer.hide([dbId1, dbId2, dbId3], model);

// 특정 요소 표시
viewer.show(dbId, model);
viewer.show([dbId1, dbId2, dbId3], model);

// 모든 요소 표시 (isolation 해제)
viewer.showAll();

// 모든 요소 숨김
viewer.hideAll();
```

**파라미터**:

-   `dbId`: 요소 ID 또는 ID 배열
-   `model`: (선택) Model 인스턴스 (기본값: `viewer.model`)

### Isolation

특정 요소만 표시하고 나머지를 모두 숨깁니다.

```javascript
// 특정 요소만 표시
viewer.isolate(dbId, model);
viewer.isolate([dbId1, dbId2, dbId3], model);

// Isolation 해제 (모두 표시)
viewer.isolate(null);
// 또는
viewer.showAll();
```

**동작 방식**:

-   `isolate()`는 내부적으로 `visibilityManager.isolate()`를 호출합니다.
-   지정된 요소와 그 부모 노드만 표시되고 나머지는 모두 숨겨집니다.
-   `null`을 전달하면 isolation이 해제됩니다.

### Aggregate Isolation (다중 모델)

여러 모델에 걸친 요소를 동시에 제어할 수 있습니다.

```javascript
viewer.impl.visibilityManager.aggregateIsolate([
    { model: model1, ids: [1, 2, 3] },
    { model: model2, ids: [4, 5, 6] },
]);

// 해제
viewer.impl.visibilityManager.aggregateIsolate([]);
```

### 가시성 상태 조회

```javascript
// 숨겨진 요소 조회
const hidden = viewer.getHiddenNodes(); // 단일 모델
const aggregateHidden = viewer.getAggregateHiddenNodes(); // 모든 모델

// 반환 형식 (aggregateHidden):
// [{ model: Autodesk.Viewing.Model, ids: [1, 2, 3] }, ...]

// 고립된(isolated) 요소 조회
const isolated = viewer.getIsolatedNodes(); // 단일 모델
const aggregateIsolated = viewer.getAggregateIsolatedNodes(); // 모든 모델
```

### 이벤트

```javascript
viewer.addEventListener(Autodesk.Viewing.HIDE_EVENT, (event) => {
    console.log("Hidden:", event.nodeIdArray);
    console.log("Model:", event.model);
});

viewer.addEventListener(Autodesk.Viewing.SHOW_EVENT, (event) => {
    console.log("Shown:", event.nodeIdArray);
});

viewer.addEventListener(Autodesk.Viewing.ISOLATE_EVENT, (event) => {
    console.log("Isolated:", event.nodeIdArray);
});
```

## Selection 제어

### 선택 메서드

```javascript
// 요소 선택
viewer.select(dbId, model, selectionType);
viewer.select([dbId1, dbId2, dbId3], model, selectionType);

// 토글 (선택 ↔ 해제)
viewer.toggleSelect(dbId, model, selectionType);

// 선택 해제
viewer.clearSelection();
```

**`selectionType`** (선택 사항):

| Type                         | 값  | 설명                              |
| ---------------------------- | --- | --------------------------------- |
| `SelectionType.MIXED`        | 1   | 색상 틴트 + 엣지 강조 (기본값)    |
| `SelectionType.REGULAR`      | 2   | 색상 틴트만                       |
| `SelectionType.OVERLAYED`    | 3   | 색상 틴트 + 다른 요소 위에 렌더링 |
| `SelectionType.NO_HIGHLIGHT` | 4   | 강조 표시 없음 (선택 상태만 추적) |

### 선택 상태 조회

```javascript
// 단일 모델
const selection = viewer.getSelection();
// 반환: number[]

// 다중 모델
const aggregateSelection = viewer.getAggregateSelection();
// 반환: [{ model: Autodesk.Viewing.Model, selection: [1, 2, 3] }, ...]

// 선택 개수
const count = viewer.getSelectionCount();

// 선택 가시성 확인
const visibility = viewer.getSelectionVisibility();
// 반환: { hasVisible: boolean, hasHidden: boolean }
```

### Selection Mode

요소 선택 시 계층 구조의 어떤 레벨을 선택할지 결정합니다.

```javascript
viewer.setSelectionMode(Autodesk.Viewing.SelectionMode.LEAF_OBJECT);

const mode = viewer.getSelectionMode();
```

| Mode                         | 값  | 설명                            |
| ---------------------------- | --- | ------------------------------- |
| `SelectionMode.LEAF_OBJECT`  | 0   | 최하위 요소만 선택 (기본값)     |
| `SelectionMode.FIRST_OBJECT` | 1   | 루트에 가까운 비-복합 노드 선택 |
| `SelectionMode.LAST_OBJECT`  | 2   | 가장 가까운 복합 노드 선택      |

### Selection 이벤트

```javascript
// 단일 모델
viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, (event) => {
    console.log("Selected dbIds:", event.dbIdArray);
    console.log("Selected fragIds:", event.fragIdsArray);
    console.log("Model:", event.model);
});

// 다중 모델
viewer.addEventListener(Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT, (event) => {
    console.log("Selections:", event.selections);
    // [{ model: Autodesk.Viewing.Model, selection: [1, 2, 3] }, ...]
});
```

### Selection 비활성화

```javascript
// Selection 완전 비활성화
viewer.disableSelection(true);

// 다시 활성화
viewer.disableSelection(false);

// Highlight 비활성화 (마우스 오버 효과만)
viewer.disableHighlight(true);
```

## Camera 제어

### 카메라 정보 조회

```javascript
// 카메라 객체
const camera = viewer.getCamera();
// THREE.Camera 인스턴스 (PerspectiveCamera 또는 OrthographicCamera)

// 카메라 위치
const position = viewer.navigation.getPosition(); // THREE.Vector3

// 카메라 타겟 (보고 있는 지점)
const target = viewer.navigation.getTarget(); // THREE.Vector3

// 카메라 Up 벡터
const up = viewer.navigation.getCameraUpVector(); // THREE.Vector3

// 월드 Up 벡터
const worldUp = viewer.navigation.getWorldUpVector(); // THREE.Vector3

// FOV (Field of View, 원근 카메라만)
const fov = viewer.navigation.getVerticalFov(); // degrees

// Pivot Point
const pivot = viewer.navigation.getPivotPoint(); // THREE.Vector3
```

### 카메라 설정

```javascript
// 카메라 위치 및 타겟 설정
viewer.navigation.setView(position, target);

// 예시
viewer.navigation.setView(
    new THREE.Vector3(100, 100, 100), // eye position
    new THREE.Vector3(0, 0, 0) // target position
);

// FOV 설정 (3D만)
viewer.navigation.setVerticalFov(60, true); // degrees, updateCamera

// 카메라 투영 모드 전환
viewer.navigation.toPerspective(); // 원근
viewer.navigation.toOrthographic(); // 직교

// Pivot Point 설정
viewer.navigation.setPivotPoint(new THREE.Vector3(0, 0, 0));
```

### Fit To View

선택된 요소 또는 전체 모델에 카메라를 맞춥니다.

```javascript
// 현재 선택된 요소들에 카메라 맞춤 (선택이 없으면 전체 모델)
viewer.fitToView();

// 특정 요소들에 카메라 맞춤
viewer.fitToView([dbId1, dbId2, dbId3]);

// 전체 모델에 카메라 맞춤
viewer.fitToView(null);

// 애니메이션 없이 즉시 이동
viewer.fitToView(null, null, true);
```

**내부 동작**:

1. **Bounding Box 계산**:

    - 선택된 요소(dbId 배열)가 제공되면 해당 요소들의 Bounding Box를 계산합니다.
    - 선택이 없으면 현재 선택된 요소(`viewer.getSelection()`)의 Bounding Box를 사용합니다.
    - 선택이 없고 `null`이 전달되면 전체 모델의 가시 영역 Bounding Box를 사용합니다.

2. **카메라 위치 계산**:

    - Bounding Box의 중심점을 타겟으로 설정합니다.
    - 마진과 오프셋을 적용하여 최종 카메라 위치를 계산합니다.
    - FOV와 Aspect Ratio를 고려하여 모든 요소가 화면에 들어오는 거리를 계산합니다.

3. **카메라 이동**:
    - 세 번째 파라미터 `immediate`가 `true`이면 즉시 이동합니다.
    - `false`이거나 생략되면 `autocam.goToView()`를 통해 부드럽게 전환합니다.

#### Fit-to-View 마진 및 오프셋

`fitToView()`는 카메라를 배치할 때 마진과 오프셋을 적용합니다.

```javascript
// 마진 설정 (0.05 = 5% 여백)
viewer.navigation.FIT_TO_VIEW_VERTICAL_MARGIN = 0.1; // 상하 10% 여백
viewer.navigation.FIT_TO_VIEW_HORIZONTAL_MARGIN = 0.1; // 좌우 10% 여백

// 오프셋 설정 (0.0 = 중앙 정렬)
viewer.navigation.FIT_TO_VIEW_VERTICAL_OFFSET = 0.0;
viewer.navigation.FIT_TO_VIEW_HORIZONTAL_OFFSET = 0.0;

// fitToView 실행
viewer.fitToView([dbId1, dbId2]);
```

**마진 (Margin)**:

-   화면 가장자리와 객체 사이의 여백을 백분율로 지정합니다.
-   예: `0.25` (25%)로 설정 시 상하 각 25% 여백, 중앙 50%에 콘텐츠 표시
-   값은 반드시 `< 0.5`여야 합니다 (0.5 이상이면 콘텐츠 표시 공간이 없음).
-   기본값: `0.05` (5%)

**오프셋 (Offset)**:

-   표시 영역의 중심점을 이동합니다.
-   예: `0.5` (50%)로 설정 시 화면 아래쪽 절반만 보이도록 이동
-   기본값: `0.0` (중앙 정렬)

**마진/오프셋 임시 변경 패턴**:

```javascript
// 원본 마진 백업
const originalMargins = {
    horizontal: viewer.navigation.FIT_TO_VIEW_HORIZONTAL_MARGIN,
    vertical: viewer.navigation.FIT_TO_VIEW_VERTICAL_MARGIN,
};

// 임시 마진 설정
viewer.navigation.FIT_TO_VIEW_HORIZONTAL_MARGIN = 0.3;
viewer.navigation.FIT_TO_VIEW_VERTICAL_MARGIN = 0.3;

// fitToView 실행
viewer.fitToView([dbId1, dbId2]);

// 원본 마진 복원
viewer.navigation.FIT_TO_VIEW_HORIZONTAL_MARGIN = originalMargins.horizontal;
viewer.navigation.FIT_TO_VIEW_VERTICAL_MARGIN = originalMargins.vertical;
```

### Navigation 설정

```javascript
// Pivot 자동 설정
// true: 요소 선택 시 해당 요소의 중심으로 Pivot 자동 이동
// false: Pivot 고정 (Orbit 시 회전 중심이 변하지 않음)
viewer.navigation.setSelectionSetsPivot(true);

// Pivot 표시
// true: Pivot 위치에 시각적 마커 표시
// false: Pivot 마커 숨김
viewer.navigation.setPivotSetFlag(true);
```

### Camera Transition (애니메이션 이동)

SDK는 부드러운 카메라 전환을 위한 내장 애니메이션 시스템을 제공합니다.

#### setRequestTransition

```javascript
// 카메라 전환 요청 생성
viewer.navigation.setRequestTransition(
    true, // state: true로 설정하여 전환 요청 등록
    eyePosition, // THREE.Vector3: 목표 카메라 위치 (월드 좌표계)
    targetPosition, // THREE.Vector3: 카메라가 바라볼 지점 (Center of Interest)
    fov, // number: 수직 시야각 (Field of View, degrees 단위)
    reorient, // boolean: true이면 up 벡터를 자동 재계산하여 수평 유지
    pivot // THREE.Vector3: Orbit 회전 중심점 (선택 사항, 기본값: targetPosition)
);

// 사용 예시
const eyePos = new THREE.Vector3(100, 100, 100);
const targetPos = new THREE.Vector3(0, 0, 0);
const currentFov = viewer.navigation.getVerticalFov();

viewer.navigation.setRequestTransition(true, eyePos, targetPos, currentFov, false, targetPos);
```

**파라미터 상세**:

-   `state`: `true`로 설정 시 전환 요청 등록, `false`로 설정 시 요청 취소
-   `pos` (eyePosition): 카메라의 목표 위치 (월드 좌표계)
-   `coi` (Center of Interest): 카메라가 바라볼 타겟 지점
-   `fov`: 수직 시야각 (degrees, 범위: 1-179)
-   `reorient`:
    -   `true`: up 벡터를 자동으로 재계산하여 카메라를 수평으로 유지
    -   `false`: 현재 up 벡터 유지
-   `pivot`: Orbit 회전의 중심점 (기본값: `coi`와 동일)

#### setRequestTransitionWithUp

```javascript
// Up 벡터를 수동으로 지정하는 Camera Transition
viewer.navigation.setRequestTransitionWithUp(
    true, // state: true로 설정하여 전환 요청 등록
    eyePosition, // THREE.Vector3: 목표 카메라 위치 (월드 좌표계)
    targetPosition, // THREE.Vector3: 카메라가 바라볼 지점
    fov, // number: 수직 시야각 (degrees)
    upVector, // THREE.Vector3: 카메라의 up 벡터 (카메라 상단 방향)
    worldUpVector, // THREE.Vector3: 월드 up 벡터 (선택 사항, 기본값: 현재 worldUp)
    pivot // THREE.Vector3: Orbit 회전 중심점 (선택 사항, 기본값: targetPosition)
);
```

**setRequestTransition과의 차이**:

-   `setRequestTransition`: `reorient` 파라미터로 up 벡터 자동 계산 여부 선택
-   `setRequestTransitionWithUp`: up 벡터를 직접 지정하여 정확한 카메라 방향 제어

#### Transition 상태 확인

```javascript
// Transition 요청 정보 조회
const request = viewer.navigation.getRequestTransition();
if (request) {
    console.log("Position:", request.position);
    console.log("COI:", request.coi);
    console.log("FOV:", request.fov);
    console.log("Up:", request.up);
}

// Transition 활성 상태 확인
const isTransitioning = viewer.navigation.getTransitionActive();
```

#### Autocam 애니메이션

Autocam은 자동 카메라 경로 계산과 부드러운 애니메이션을 제공합니다.

```javascript
// Autocam을 통한 카메라 이동
viewer.autocam.goToView(eyePosition, targetPosition);
```

**내부 동작**:

1. 프레임마다 호출되는 애니메이션 함수가 진행률을 계산합니다.
2. Easing 함수로 부드러운 보간을 수행합니다.
3. 시작 위치와 목표 위치를 보간하여 현재 카메라 상태를 업데이트합니다.
4. 전환 완료 시 콜백을 실행합니다.

**Easing 함수** (SDK 내장):

```javascript
function easeClamp(x, a, b) {
    if (x <= a) return 0.0;
    if (x >= b) return 1.0;
    const t = (x - a) / (b - a);
    return 0.5 * (Math.sin((t - 0.5) * Math.PI) + 1.0); // 사인 곡선 기반
}
```

#### Transition 이벤트

```javascript
// Transition 상태 변경 이벤트
viewer.navigation.addEventListener("transitionActiveFlagChanged", (event) => {
    console.log("Transition active:", event.transitionActive);
});
```

**참고**:

-   `setRequestTransition`은 요청만 등록하며, 실제 애니메이션은 다음 프레임에 시작됩니다.
-   Transition 중에는 `getTransitionActive()`가 `true`를 반환합니다.

## Material과 Color

### Material Transparency 시스템

LMV는 THREE.js Material 객체를 기반으로 투명도를 제어합니다.

#### Material 투명도 속성

```javascript
const material = new THREE.MeshPhongMaterial({
    color: 0xff0000,
    transparent: true, // 투명도 활성화
    opacity: 0.5, // 투명도 값 (0.0 ~ 1.0)
    depthWrite: false, // 깊이 버퍼 쓰기 (기본값: transparent=true이면 false)
    depthTest: true, // 깊이 테스트 (기본값: true)
});
```

**속성 설명**:

-   `transparent`: 투명도 렌더링 활성화 여부 (기본값: `false`)
-   `opacity`: 불투명도 (1.0 = 완전 불투명, 0.0 = 완전 투명)
-   `depthWrite`: 깊이 버퍼에 쓰기 여부. `false`로 설정 시 뒤에 있는 투명 객체가 보임 (기본값: `!transparent`)
-   `depthTest`: 깊이 테스트 여부. `false`로 설정 시 다른 객체 위에 항상 렌더링 (기본값: `true`)

#### 투명도 렌더링 순서

WebGL 렌더러는 투명 객체를 **뒤에서 앞으로** (back-to-front) 순서로 렌더링합니다.

```javascript
// 불투명 객체 렌더링 (앞에서 뒤로)
state.setBlending(THREE.NoBlending);
renderObjects(opaqueObjects, camera, lights, fog, null);

// 투명 객체 렌더링 (뒤에서 앞으로)
renderObjects(transparentObjects, camera, lights, fog, null);
```

**투명도 렌더링 모드**:

1. **depthWrite = false, depthTest = true** (기본값):
    - 투명 객체가 서로 겹쳐 보이는 "유리" 효과
    - 뒤의 불투명 객체도 보임
2. **depthWrite = true, depthTest = true**:
    - 투명 객체가 뒤의 모든 객체를 가림
    - "반투명 차단막" 효과
3. **depthWrite = false, depthTest = false**:
    - 항상 최상위에 렌더링 (다른 객체 무시)
    - Overlay, HUD 요소에 사용

#### Material 복제 및 투명도 적용

Fragment에 투명도를 적용하려면 Material을 복제하고 속성을 변경해야 합니다.

```javascript
const fragmentList = model.getFragmentList();
const originalMaterial = fragmentList.getMaterial(fragId);

// Material 복제 (원본 Material 보존)
const transparentMaterial = originalMaterial.clone();

// 투명도 렌더링 활성화
transparentMaterial.transparent = true;

// 불투명도 설정 (0.0 = 완전 투명, 1.0 = 완전 불투명)
transparentMaterial.opacity = 0.3;

// 깊이 버퍼 쓰기 비활성화
transparentMaterial.depthWrite = false;

// 깊이 테스트 활성화
transparentMaterial.depthTest = true;

// Fragment에 변경된 Material 적용
fragmentList.setMaterial(fragId, transparentMaterial);

// 렌더링 갱신 (필수)
viewer.impl.invalidate(true, true, true);
```

**Material 복제 시 주의사항**:

-   **Texture 공유**: `clone()` 메서드는 Texture 객체를 복사하지 않고 참조만 복사합니다. 원본 Material과 복제된 Material이 동일한 Texture 인스턴스를 공유합니다.
-   **커스텀 속성**: THREE.js 기본 속성 외에 추가된 커스텀 속성(`material.customProperty`)은 수동으로 복사해야 합니다.
-   **Material ID**: 복제된 Material은 새로운 고유 ID(`material.id`)를 자동으로 받습니다.

#### 색상 및 발광 비활성화

투명 객체의 색상을 제거하려면:

```javascript
// 색상 비활성화
if (transparentMaterial.color) {
    transparentMaterial.color.setRGB(0, 0, 0);
}
if (transparentMaterial.emissive) {
    transparentMaterial.emissive.setRGB(0, 0, 0);
}
if (transparentMaterial.specular) {
    transparentMaterial.specular.setRGB(0, 0, 0);
}

// 그림자 비활성화
transparentMaterial.castShadow = false;
transparentMaterial.receiveShadow = false;
```

#### 투명도 Material 캐싱

여러 Fragment에 동일한 투명도를 적용할 때는 Material을 캐싱하여 성능을 향상시킵니다. 캐싱을 사용하면 동일한 원본 Material을 공유하는 모든 Fragment가 하나의 복제된 Material을 재사용하므로 메모리 사용량과 렌더링 비용이 감소합니다.

```javascript
const materialCache = new Map();

fragIds.forEach((fragId) => {
    const originalMaterial = fragmentList.getMaterial(fragId);

    // 캐시에서 Material ID로 검색
    // Material ID는 THREE.js가 자동 할당하는 고유 식별자
    let transparentMaterial = materialCache.get(originalMaterial.id);

    // 캐시에 없으면 새로 생성
    if (!transparentMaterial) {
        transparentMaterial = originalMaterial.clone();
        transparentMaterial.transparent = true;
        transparentMaterial.opacity = 0.3;
        transparentMaterial.depthWrite = false;
        transparentMaterial.depthTest = true;

        // 생성한 Material을 캐시에 저장
        // 동일한 원본 Material을 사용하는 Fragment들이 변환된 Material을 재사용
        materialCache.set(originalMaterial.id, transparentMaterial);
    }

    // Fragment에 캐시된 Material 적용
    fragmentList.setMaterial(fragId, transparentMaterial);
});

// 모든 Fragment 처리 완료 후 한 번만 렌더링 갱신
viewer.impl.invalidate(true, true, true);
```

**캐싱 효과**:

-   메모리 사용량 감소: 원본 Material당 하나의 복제본만 생성
-   렌더링 성능 향상: Material 전환 비용 감소
-   GPU 메모리 절약: Shader 컴파일 및 업로드 최소화

### Theming Color

요소에 색상 오버레이를 적용합니다.

```javascript
// THREE.Vector4를 사용한 색상 정의
// x, y, z: RGB 값 (0.0 = 최소, 1.0 = 최대)
// w: Intensity (색상 혼합 강도, 0.0 = 원본 색상 유지, 1.0 = 완전 덮어쓰기)
const color = new THREE.Vector4(1.0, 0.0, 0.0, 1.0); // 빨간색 100%

// 단일 요소에 Theming Color 적용
viewer.setThemingColor(dbId, color, model);

// 재귀적으로 모든 자식 요소에 동일한 색상 적용
viewer.setThemingColor(dbId, color, model, true);

// 여러 요소에 동일한 색상 적용
[dbId1, dbId2, dbId3].forEach((id) => {
    viewer.setThemingColor(id, color, model);
});
```

**Vector4 구성 요소 상세**:

-   `x, y, z`: RGB 값 (0.0 ~ 1.0 범위)
-   `w`: Intensity (색상 혼합 강도)
    -   `0.0`: 원본 Material 색상 유지 (효과 없음)
    -   `0.5`: 원본 색상 50% + Theming 색상 50% 혼합
    -   `1.0`: Theming 색상으로 완전 덮어쓰기

```javascript
// 예시: 빨간색 50% Intensity
const red = new THREE.Vector4(1.0, 0.0, 0.0, 0.5);

// 파란색 100% Intensity
const blue = new THREE.Vector4(0.0, 0.0, 1.0, 1.0);

// RGB 255 값을 0-1 범위로 변환하는 유틸리티
const rgbToColor = (r, g, b, intensity) => new THREE.Vector4(r / 255, g / 255, b / 255, intensity);

// 주황색(255, 165, 0) 80% Intensity
const orange = rgbToColor(255, 165, 0, 0.8);
```

### Theming Color 제거

```javascript
// 모든 Theming Color 제거
viewer.clearThemingColors(model);

// 특정 모델의 색상만 제거
viewer.clearThemingColors(model1);
```

### 다중 모델 Theming

```javascript
// 여러 모델에 걸친 색상 적용
const models = viewer.impl.modelQueue().getModels();
models.forEach((model) => {
    const dbIds = [1, 2, 3]; // 각 모델의 요소 ID
    dbIds.forEach((dbId) => {
        viewer.setThemingColor(dbId, color, model);
    });
});
```

### Theming 활용 예시

`setThemingColor()`를 사용하면 데이터 시각화(온도, 센서 값 등)를 구현할 수 있습니다.

```javascript
// 데이터 값에 따라 색상 그라데이션 적용
function applyDataVisualization(dbIds, values, colorScale) {
    dbIds.forEach((dbId, index) => {
        const value = values[index];
        const normalizedValue = (value - colorScale.min) / (colorScale.max - colorScale.min);

        // 색상 보간 (파란색 → 빨간색)
        const r = normalizedValue;
        const g = 0.0;
        const b = 1.0 - normalizedValue;

        const color = new THREE.Vector4(r, g, b, 0.8);
        viewer.setThemingColor(dbId, color, model);
    });
}

// 사용 예시
const roomIds = [100, 101, 102];
const temperatures = [20.5, 23.2, 26.8]; // °C
const tempScale = { min: 18, max: 28 };

applyDataVisualization(roomIds, temperatures, tempScale);
```

### 패턴 3: Level별 가시성 제어

```javascript
// 특정 Level의 모든 요소 ID 가져오기
async function getLevelElements(model, levelName) {
    // Level 속성으로 필터링하여 요소 조회
    const allData = await model.query({
        families: ["l"], // Refs 패밀리
        columns: ["l:Level"], // Level 컬럼
    });

    const levelElements = [];
    for (const item of allData) {
        if (item["l:Level"] === levelName) {
            levelElements.push(item.k); // extId
        }
    }

    // extId → dbId 변환
    const dbIds = await model.getDbIdsFromElementIds(levelElements);
    return dbIds;
}

// 특정 Level만 표시
async function showLevel(model, levelName) {
    const dbIds = await getLevelElements(model, levelName);
    viewer.isolate(dbIds, model);
    viewer.fitToView(dbIds, model);
}

// 사용
await showLevel(model, "Level 1");
```

**설명**: Query API를 사용하여 특정 Level에 속한 모든 요소를 찾고, `isolate()`로 해당 요소만 표시합니다. Level 정보는 `l:Level` (Refs Level) 컬럼에 저장되어 있습니다.

### 패턴 4: 부드러운 카메라 이동

### Light 초기화

Viewer는 생성 시 자동으로 조명을 초기화합니다.

```javascript
viewer.impl.initLights();
```

**생성되는 조명**:

-   `viewer.impl.dir_light1`: `THREE.DirectionalLight` (방향성 광원)
-   `viewer.impl.amb_light`: `THREE.AmbientLight` (환경광)

### Light 배열

```javascript
// 조명이 활성화된 배열
viewer.impl.lights; // [dir_light1, amb_light]

// 조명 비활성화 시 빈 배열
viewer.impl.no_lights; // []

// 현재 조명 상태
const isOn = viewer.impl.lightsOn; // boolean
```

### Light 제어

```javascript
// 조명 켜기/끄기
viewer.impl.toggleLights(true); // 켜기
viewer.impl.toggleLights(false); // 끄기

// 오버레이용 조명 제어
viewer.impl.toggleLights(true, true); // isForOverlay = true
```

**`toggleLights()` 동작**:

-   `state = true`: Light Preset에 따라 색상 적용
-   `state = false`: 조명 비활성화 (환경광만 유지)
-   `isForOverlay = true`: Overlay 렌더링 시 특수 처리

### Directional Light

방향성 광원은 카메라에 부착되어 항상 뷰 방향을 따릅니다.

```javascript
const dirLight = viewer.impl.dir_light1;

// 색상 변경
dirLight.color.setRGB(1.0, 1.0, 1.0);

// 강도 변경
dirLight.intensity = 1.0;

// 위치 (카메라 좌표계, 정규화된 방향 벡터)
dirLight.position.set(0.5, -0.2, -0.06);

// 타겟 위치 설정
dirLight.target.position.set(0, 0, 0);
```

**주의사항**:

-   Directional Light는 카메라에 부착되어 있으므로 카메라 회전 시 함께 회전합니다.
-   Light의 target도 카메라에 부착되어 있어 카메라 위치에 영향받지 않습니다.
-   Light Preset을 변경하면 조명 색상과 강도가 Preset 값으로 재설정됩니다.

### Ambient Light

환경광은 모든 방향에서 균등하게 비춥니다.

```javascript
const ambLight = viewer.impl.amb_light;

// 색상 변경
ambLight.color.setRGB(0.8, 0.9, 1.0);
```

### Light Preset

Light Preset은 미리 정의된 조명 환경을 제공합니다.

```javascript
// Light Preset 변경 (인덱스 또는 이름)
viewer.setLightPreset(0); // 인덱스로 설정
viewer.setLightPreset("Plaza"); // 이름으로 설정

// 현재 Preset 인덱스 조회
const currentIndex = viewer.impl.currentLightPreset();

// Preset 목록 조회
const LightPresets = Autodesk.Viewing.Private.LightPresets;
console.log(
    "Available Presets:",
    LightPresets.map((p) => p.name)
);

// 현재 Preset 정보
const preset = LightPresets[currentIndex];
console.log("Ambient Color:", preset.ambientColor); // [r, g, b]
console.log("Directional Color:", preset.directLightColor); // [r, g, b]
console.log("Light Multiplier:", preset.lightMultiplier); // 강도 배율
```

#### 기본 제공 Light Preset 목록

| 인덱스 | 이름             | 설명              | 특징                      |
| ------ | ---------------- | ----------------- | ------------------------- |
| 0      | Simple Grey      | 기본 프리셋       | IBL 없음, 기본 조명만     |
| 1      | Sharp Highlights | 선명한 하이라이트 | SharpHighlights 환경 맵   |
| 2      | Boardwalk        | 산책로 환경       | Boardwalk 환경 맵         |
| 3      | Snow Field       | 눈밭 환경         | 높은 조도 (50,000 lux)    |
| 4      | Harbor           | 항구 환경         | Harbor 환경 맵            |
| 5      | Dark Sky         | 어두운 하늘       | 실내 환경, 낮은 조도      |
| 6      | Plaza            | 광장 환경         | 가장 많이 사용, 높은 조도 |
| 7      | City Night       | 도시 야경         | 야간 환경                 |
| 8      | Contrast         | 고대비 환경       | IDViz 환경 맵             |

#### Debug 전용 Light Preset (기본 비활성화)

LMV 소스 코드에는 추가로 Debug용 Preset이 정의되어 있으나, 기본적으로 비활성화되어 있습니다.

**비활성화 이유**:

환경 맵이 Revit 데이터와 잘 맞도록 노출 설정을 수동으로 튜닝해야 하며, 많은 프리셋이 시각적으로 반복적입니다.

**Debug Preset 목록**:

-   Grey Room, Photo Booth, Tranquility, Infinity Pool
-   Simple White, Simple Black
-   Riverbank, Rim Highlights, Cool Light, Warm Light, Soft Light, Grid Light, Field
-   Night, Parking, River Road, Flat Shading
-   Crossroads, Seaport, Glacier, RaaS Test Env

Debug 모드가 활성화된 경우에만 자동으로 추가됩니다.

### Preset 속성 구조

```javascript
{
  name: "Sharp Highlights",
  path: "SharpHighlights",           // 환경 맵 경로
  type: "logluv",                    // 환경 맵 타입
  tonemap: 2,                        // 톤맵핑 방식 (0=None, 1=Cannon-Lum, 2=Cannon RGB)
  E_bias: -9.0,                      // 노출 바이어스 (EV 값)
  E_correction: 1.2,                 // 노출 보정
  directLightColor: [0.5, 0.5, 0.5], // 방향광 색상
  ambientColor: [0.03125, 0.03125, 0.03125], // 환경광 색상
  lightMultiplier: 0.0,              // 조명 강도 배율 (0.0 = IBL 사용)
  lightDirection: [0.5, -0.2, -0.06],// 방향광 방향
  bgColorGradient: [237, 237, 237, 237, 237, 237], // 배경 그라데이션
  useIrradianceAsBackground: true,   // Irradiance를 배경으로 사용
  darkerFade: true,                  // 페이드 효과
  rotation: 0.0,                     // 환경 맵 회전 (라디안)
  saoRadius: 0.5,                    // Screen Space Ambient Occlusion 반경
  saoIntensity: 2.0,                 // SSAO 강도
  saoBias: 0.0                       // SSAO 바이어스
}
```

**톤맵 방식**:

-   `0`: None (톤맵 미적용)
-   `1`: Prism Cannon-Lum (색상 보존)
-   `2`: OGC Cannon RGB (색상 비보존, 대부분 Preset의 기본값)

### IBL (Image-Based Lighting)

Image-Based Lighting은 환경 맵(HDRI)을 사용한 조명입니다.

#### IBL 설정

```javascript
// IBL 환경 맵 로드 (Light Preset 변경 시 자동)
viewer.setLightPreset("Plaza");

// 환경 맵을 배경으로 사용
viewer.setEnvMapBackground(true);

// 반사 강도 조정 (Material에 영향)
viewer.impl.setEnvExposure(1.0); // 기본값: 1.0
```

#### 환경 맵 회전

환경 맵은 런타임에 회전할 수 있으며, 이는 조명 방향을 동적으로 변경하는 데 유용합니다.

```javascript
// 환경 맵 회전 (라디안 단위)
viewer.impl.renderer().setEnvRotation(Math.PI / 2); // 90도 회전

// 현재 회전 각도 조회
const rotation = viewer.impl.renderer().getEnvRotation();
```

**WebGPU 제한사항**: WebGPU 렌더러에서는 `setEnvRotation` 구현이 완료되지 않았습니다. WebGL 렌더러에서만 정상 작동합니다.

#### IBL 특징

-   실사적인 조명과 반사 제공
-   HDR (High Dynamic Range) 데이터 사용
-   톤맵핑(Tone Mapping)으로 밝기 조정
-   환경 맵의 회전 지원 (WebGL만)

### 조명 디버깅

```javascript
// 조명 정보 출력
console.log("Lights On:", viewer.impl.lightsOn);
console.log("Directional Light:", viewer.impl.dir_light1);
console.log("Ambient Light:", viewer.impl.amb_light);
console.log("Current Light Preset:", viewer.impl.currentLightPreset());

// 조명 위치 (카메라 좌표계)
console.log("Dir Light Position:", viewer.impl.dir_light1.position);
console.log("Dir Light Target:", viewer.impl.dir_light1.target.position);
```

### 고급 렌더링 커스터마이징

SDK는 `Viewer3D` 공개 메서드를 통해 렌더링 커스터마이징을 제공합니다. 이러한 메서드는 내부적으로 `Viewer3DImpl`을 통해 MaterialManager, RenderContext, WebGLRenderer 등의 내부 컴포넌트를 조작합니다.

**SDK 공개 API를 사용해야 하는 이유**:

1. **파라미터 검증**: `Viewer3D`는 입력값의 유효성을 검사하여 잘못된 값으로 인한 렌더링 오류를 방지합니다.
2. **일관성 유지**: 여러 내부 컴포넌트 간의 상태를 동기화하여 일관된 렌더링 결과를 보장합니다.
3. **버전 호환성**: 내부 구현이 변경되더라도 공개 API는 호환성을 유지하므로 업그레이드 시 안전합니다.
4. **자동 무효화**: 설정 변경 시 자동으로 `invalidate()`를 호출하여 화면 갱신을 처리합니다.

**공개 API 설계 구조**:

```
Viewer3D (public API)
  ├─ 파라미터 검증
  ├─ Preferences 저장
  └─> Viewer3DImpl (internal)
        ├─> MaterialManager
        ├─> RenderContext
        ├─> WebGLRenderer
        └─> invalidate()
```

직접 `viewer.impl` 내부 객체를 조작하면 Preferences와 동기화되지 않고 다음 설정 변경 시 덮어씌워질 수 있습니다.

## Fragment Transform 시스템

Fragment는 화면에 그려지는 최소 단위이며, 각 Fragment는 Transform 매트릭스를 통해 3D 공간에서의 위치, 회전, 스케일을 관리합니다.

### Fragment 기본 개념

하나의 요소(dbId)는 여러 개의 Fragment를 가질 수 있습니다. Fragment ID를 가져오는 방법:

```javascript
const fragIds = [];
model.getInstanceTree().enumNodeFragments(
    dbId,
    (fragId) => {
        fragIds.push(fragId);
    },
    true // recursive
);
```

### Transform 배열 구조

FragmentList는 모든 Fragment의 Transform을 **Float32Array**로 저장합니다. 각 Fragment는 **12개의 float 값**(4x3 매트릭스)을 사용합니다.

```javascript
const fragmentList = model.getFragmentList();
const transforms = fragmentList.transforms; // Float32Array

// fragId=10의 Transform: offset = 10 * 12 = 120
// transforms[120] ~ transforms[131]: 12개 값
```

**4x3 매트릭스 구조**:

```
[m00, m10, m20,  // 첫 번째 열: X축 방향 벡터 (회전/스케일)
 m01, m11, m21,  // 두 번째 열: Y축 방향 벡터 (회전/스케일)
 m02, m12, m22,  // 세 번째 열: Z축 방향 벡터 (회전/스케일)
 m03, m13, m23]  // 네 번째 열: 위치 (Translation)
```

**인덱스별 의미**:

| Offset | 의미         | 설명                   |
| ------ | ------------ | ---------------------- |
| +0     | m00 (X축 X)  | X축 방향 벡터의 X 성분 |
| +1     | m10 (X축 Y)  | X축 방향 벡터의 Y 성분 |
| +2     | m20 (X축 Z)  | X축 방향 벡터의 Z 성분 |
| +3     | m01 (Y축 X)  | Y축 방향 벡터의 X 성분 |
| +4     | m11 (Y축 Y)  | Y축 방향 벡터의 Y 성분 |
| +5     | m21 (Y축 Z)  | Y축 방향 벡터의 Z 성분 |
| +6     | m02 (Z축 X)  | Z축 방향 벡터의 X 성분 |
| +7     | m12 (Z축 Y)  | Z축 방향 벡터의 Y 성분 |
| +8     | m22 (Z축 Z)  | Z축 방향 벡터의 Z 성분 |
| +9     | m03 (위치 X) | 월드 좌표계 X 위치     |
| +10    | m13 (위치 Y) | 월드 좌표계 Y 위치     |
| +11    | m23 (위치 Z) | 월드 좌표계 Z 위치     |

### Transform 읽기

Float32Array에서 Transform을 THREE.Matrix4로 변환합니다.

```javascript
function getTransformFromArray(transforms, fragId, targetMatrix) {
    const offset = 12 * fragId;
    const e = targetMatrix.elements;

    // 4x3 → 4x4 변환 (마지막 행은 [0, 0, 0, 1])
    e[0] = transforms[offset + 0]; // m00
    e[1] = transforms[offset + 1]; // m10
    e[2] = transforms[offset + 2]; // m20
    e[3] = 0;

    e[4] = transforms[offset + 3]; // m01
    e[5] = transforms[offset + 4]; // m11
    e[6] = transforms[offset + 5]; // m21
    e[7] = 0;

    e[8] = transforms[offset + 6]; // m02
    e[9] = transforms[offset + 7]; // m12
    e[10] = transforms[offset + 8]; // m22
    e[11] = 0;

    e[12] = transforms[offset + 9]; // m03 (X 위치)
    e[13] = transforms[offset + 10]; // m13 (Y 위치)
    e[14] = transforms[offset + 11]; // m23 (Z 위치)
    e[15] = 1;
}

// 사용
const matrix = new THREE.Matrix4();
getTransformFromArray(fragmentList.transforms, fragId, matrix);
```

### Transform 쓰기

```javascript
// 위치 변경
const matrix = new THREE.Matrix4();
getTransformFromArray(fragmentList.transforms, fragId, matrix);

// 위치만 수정 (회전/스케일 보존)
matrix.elements[12] = newX;
matrix.elements[13] = newY;
matrix.elements[14] = newZ;

// Fragment에 적용
fragmentList.setTransform(fragId, matrix);

// 렌더링 갱신
viewer.impl.invalidate(true, true, true);
```

**`invalidate()` 파라미터**:

-   첫 번째: 렌더링 무효화
-   두 번째: Overlay 렌더링 무효화
-   세 번째: 즉시 재렌더링 (false: 다음 프레임)

### 위치 추출

Matrix4에서 위치 벡터를 추출합니다.

```javascript
const position = new THREE.Vector3();
position.setFromMatrixPosition(matrix);

console.log(position.x, position.y, position.z);
```

## Matrix4 변환

THREE.Matrix4는 4x4 동차 좌표계 매트릭스로, 위치, 회전, 스케일을 모두 표현합니다.

### 기본 변환 생성

```javascript
// 단위 행렬 (변환 없음)
const identity = new THREE.Matrix4();

// 이동 (Translation)
const translation = new THREE.Matrix4();
translation.makeTranslation(x, y, z);

// 회전 (Rotation, 라디안)
const rotationX = new THREE.Matrix4();
rotationX.makeRotationX(Math.PI / 4); // 45도

const rotationY = new THREE.Matrix4();
rotationY.makeRotationY(angle);

const rotationZ = new THREE.Matrix4();
rotationZ.makeRotationZ(angle);

// 스케일
const scale = new THREE.Matrix4();
scale.makeScale(sx, sy, sz);
```

### 변환 합성

여러 변환을 결합할 때는 순서가 중요합니다 (오른쪽에서 왼쪽으로 적용).

```javascript
const composed = new THREE.Matrix4();

// TRS 순서: Translation * Rotation * Scale
composed
    .makeTranslation(x, y, z) // 먼저 이동
    .multiply(new THREE.Matrix4().makeRotationZ(angle)) // 그 다음 회전
    .multiply(new THREE.Matrix4().makeScale(sx, sy, sz)); // 마지막 스케일

// 또는 직접 곱셈
const result = new THREE.Matrix4();
result.multiplyMatrices(matrixA, matrixB); // A * B
```

### 변환 분해

Matrix4에서 위치, 회전, 스케일을 개별로 추출합니다.

```javascript
const position = new THREE.Vector3();
const quaternion = new THREE.Quaternion(); // 회전 (사원수)
const scale = new THREE.Vector3();

matrix.decompose(position, quaternion, scale);

// Euler 각도로 변환 (라디안)
const euler = new THREE.Euler();
euler.setFromQuaternion(quaternion);

console.log("Position:", position);
console.log("Rotation (rad):", euler.x, euler.y, euler.z);
console.log("Scale:", scale);
```

### 역행렬

Transform을 되돌릴 때 사용합니다.

```javascript
const inverse = new THREE.Matrix4();
inverse.copy(matrix).invert();

// 원본 변환 취소
composed.multiplyMatrices(inverse, matrix); // 단위 행렬
```

## Fragment 애니메이션

Fragment의 Transform을 시간에 따라 변경하여 부드러운 애니메이션을 구현합니다.

### requestAnimationFrame 기반 애니메이션

브라우저의 렌더링 주기(표준 60fps)에 맞춰 애니메이션을 실행합니다.

```javascript
let startTime = null;
const duration = 2000; // 2초
const startPosition = { x: 0, y: 0, z: 0 };
const targetPosition = { x: 100, y: 50, z: 200 };

function animate(currentTime) {
    if (!startTime) startTime = currentTime;
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1); // 0~1

    // 선형 보간 (Linear Interpolation)
    const x = startPosition.x + (targetPosition.x - startPosition.x) * progress;
    const y = startPosition.y + (targetPosition.y - startPosition.y) * progress;
    const z = startPosition.z + (targetPosition.z - startPosition.z) * progress;

    // Transform 업데이트
    const matrix = new THREE.Matrix4();
    getTransformFromArray(fragmentList.transforms, fragId, matrix);
    matrix.elements[12] = x;
    matrix.elements[13] = y;
    matrix.elements[14] = z;
    fragmentList.setTransform(fragId, matrix);

    // 렌더링 갱신
    viewer.impl.invalidate(true, true, true);

    // 애니메이션 계속 (progress < 1이면)
    if (progress < 1) {
        requestAnimationFrame(animate);
    }
}

// 시작
requestAnimationFrame(animate);
```

### 애니메이션 라이브러리 활용

부드러운 애니메이션을 위해 TWEEN.js 같은 애니메이션 라이브러리를 사용할 수 있습니다. 이러한 라이브러리는 SDK에 포함되어 있지 않으므로 별도로 설치해야 합니다.

**예시** (TWEEN.js 사용):

```javascript
// TWEEN.js 설치 필요: npm install @tweenjs/tween.js
import TWEEN from "@tweenjs/tween.js";

// 애니메이션 상태 객체
const state = { progress: 0 };

// Tween 생성
const tween = new TWEEN.Tween(state)
    .to({ progress: 1 }, 2000) // 2초 동안 progress: 0 → 1
    .easing(TWEEN.Easing.Quadratic.InOut) // 가속/감속
    .onUpdate(() => {
        // 매 프레임마다 호출
        const x = startPosition.x + (targetPosition.x - startPosition.x) * state.progress;
        const y = startPosition.y + (targetPosition.y - startPosition.y) * state.progress;
        const z = startPosition.z + (targetPosition.z - startPosition.z) * state.progress;

        // Transform 업데이트
        const matrix = new THREE.Matrix4();
        getTransformFromArray(fragmentList.transforms, fragId, matrix);
        matrix.elements[12] = x;
        matrix.elements[13] = y;
        matrix.elements[14] = z;
        fragmentList.setTransform(fragId, matrix);

        viewer.impl.invalidate(true, true, true);
    })
    .onComplete(() => {
        console.log("Animation complete");
    });

// 애니메이션 루프
function animate(time) {
    tween.update(time);
    if (tween.isPlaying()) {
        requestAnimationFrame(animate);
    }
}

// 시작
tween.start();
requestAnimationFrame(animate);
```

**주요 Easing 함수**:

| Easing            | 설명                     |
| ----------------- | ------------------------ |
| `Linear.None`     | 일정한 속도              |
| `Quadratic.In`    | 천천히 시작, 가속        |
| `Quadratic.Out`   | 빠르게 시작, 감속        |
| `Quadratic.InOut` | 가속 후 감속 (가장 흔함) |
| `Cubic.InOut`     | 더 부드러운 가속/감속    |
| `Elastic.Out`     | 탄성 효과                |
| `Bounce.Out`      | 튕기는 효과              |

### 여러 Fragment 동시 애니메이션

```javascript
const fragIds = [101, 102, 103]; // 여러 Fragment
const animationData = fragIds.map((fragId) => {
    const matrix = new THREE.Matrix4();
    getTransformFromArray(fragmentList.transforms, fragId, matrix);
    const position = new THREE.Vector3();
    position.setFromMatrixPosition(matrix);

    return {
        fragId,
        startX: position.x,
        startY: position.y,
        startZ: position.z,
        targetX: position.x + 50, // 각각 50 이동
        targetY: position.y,
        targetZ: position.z,
    };
});

const state = { progress: 0 };
const tween = new TWEEN.Tween(state)
    .to({ progress: 1 }, 1500)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .onUpdate(() => {
        animationData.forEach((data) => {
            const x = data.startX + (data.targetX - data.startX) * state.progress;
            const y = data.startY + (data.targetY - data.startY) * state.progress;
            const z = data.startZ + (data.targetZ - data.startZ) * state.progress;

            const matrix = new THREE.Matrix4();
            getTransformFromArray(fragmentList.transforms, data.fragId, matrix);
            matrix.elements[12] = x;
            matrix.elements[13] = y;
            matrix.elements[14] = z;
            fragmentList.setTransform(data.fragId, matrix);
        });

        viewer.impl.invalidate(true, true, true);
    });

function animate(time) {
    tween.update(time);
    if (tween.isPlaying()) {
        requestAnimationFrame(animate);
    }
}

tween.start();
requestAnimationFrame(animate);
```

### 애니메이션 중단

```javascript
let animationFrameId = null;
let currentTween = null;

function stopAnimation() {
    if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    if (currentTween) {
        currentTween.stop();
        currentTween = null;
    }
}

// 사용
stopAnimation(); // 실행 중인 애니메이션 중단
```

## Geometry 심화

### 중심 좌표 계산

Fragment의 Bounding Box 중심을 계산합니다.

```javascript
const bbox = new THREE.Box3();
fragmentList.getWorldBounds(fragId, bbox);

// 중심 좌표
const center = new THREE.Vector3();
bbox.getCenter(center);

console.log("Center:", center.x, center.y, center.z);

// 크기
const size = new THREE.Vector3();
bbox.getSize(size);

console.log("Size:", size.x, size.y, size.z);
```

### Bounding Box 합집합

여러 Fragment의 Bounding Box를 합칩니다.

```javascript
const combinedBBox = new THREE.Box3();

fragIds.forEach((fragId) => {
    const bbox = new THREE.Box3();
    fragmentList.getWorldBounds(fragId, bbox);
    combinedBBox.union(bbox); // 합집합
});

console.log("Combined min:", combinedBBox.min);
console.log("Combined max:", combinedBBox.max);
```

### 거리 계산

두 Fragment 간의 거리를 계산합니다.

```javascript
// Fragment 1 중심
const bbox1 = new THREE.Box3();
fragmentList.getWorldBounds(fragId1, bbox1);
const center1 = new THREE.Vector3();
bbox1.getCenter(center1);

// Fragment 2 중심
const bbox2 = new THREE.Box3();
fragmentList.getWorldBounds(fragId2, bbox2);
const center2 = new THREE.Vector3();
bbox2.getCenter(center2);

// 유클리드 거리
const distance = center1.distanceTo(center2);
console.log("Distance:", distance);
```

## EventDispatcher

LMV SDK의 모든 주요 객체는 EventDispatcher를 상속합니다.

### 이벤트 등록

```javascript
viewer.addEventListener(eventType, callback);

// 예시
viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, (event) => {
    console.log("Selected:", event.dbIdArray);
});
```

### 이벤트 제거

```javascript
const callback = (event) => {
    console.log(event);
};

viewer.addEventListener("customEvent", callback);

// 제거
viewer.removeEventListener("customEvent", callback);
```

**주의**: 콜백 함수의 참조가 동일해야 제거됩니다.

```javascript
// ❌ 제거 안 됨 (다른 함수 인스턴스)
viewer.addEventListener("event", () => console.log("A"));
viewer.removeEventListener("event", () => console.log("A"));

// ✅ 제거 됨 (동일 참조)
const handler = () => console.log("A");
viewer.addEventListener("event", handler);
viewer.removeEventListener("event", handler);
```

### 커스텀 이벤트 발생

```javascript
viewer.fireEvent({
    type: "myCustomEvent",
    data: { key: "value" },
    timestamp: Date.now(),
});

// 리스너
viewer.addEventListener("myCustomEvent", (event) => {
    console.log("Custom event:", event.data);
});
```

### 일회성 이벤트

한 번만 실행되는 이벤트 리스너:

```javascript
function onceHandler(event) {
    console.log("This will run once");
    viewer.removeEventListener("myEvent", onceHandler);
}

viewer.addEventListener("myEvent", onceHandler);
```

### 이벤트 버블링 방지

일부 이벤트는 `stopPropagation`을 지원하지 않으므로 플래그로 제어합니다.

```javascript
let eventHandled = false;

viewer.addEventListener("someEvent", (event) => {
    if (eventHandled) return;
    eventHandled = true;

    // 처리 로직
    console.log("Handled");

    // 다음 이벤트를 위해 리셋
    setTimeout(() => {
        eventHandled = false;
    }, 0);
});
```

## 실용적인 패턴

### 패턴 1: 선택 요소 하이라이트

```javascript
viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, (event) => {
    // 이전 색상 제거
    viewer.clearThemingColors();

    // 선택된 요소 강조
    const color = new THREE.Vector4(0.0, 1.0, 0.0, 0.5); // 초록색 50%
    event.dbIdArray.forEach((dbId) => {
        viewer.setThemingColor(dbId, color, event.model);
    });

    // 카메라 맞춤
    viewer.fitToView(event.dbIdArray);
});
```

### 패턴 2: 카테고리별 색상 적용

```javascript
// 카테고리별 색상 매핑
const categoryColors = {
    OST_Walls: new THREE.Vector4(0.8, 0.8, 0.8, 0.7), // 회색
    OST_Doors: new THREE.Vector4(0.6, 0.3, 0.0, 0.7), // 갈색
    OST_Windows: new THREE.Vector4(0.5, 0.7, 1.0, 0.5), // 연한 파란색
};

// Query API로 모든 요소의 카테고리 조회
const allData = await model.query({ families: ["n"] });

// extId → dbId 변환
const extIds = allData.map((item) => item.k);
const dbIds = await model.getDbIdsFromElementIds(extIds);

allData.forEach((item, index) => {
    const categoryId = item["n:CategoryId"];
    const color = categoryColors[categoryId];

    if (color) {
        const dbId = dbIds[index];
        viewer.setThemingColor(dbId, color, model);
    }
});
```

### 패턴 3: 부드러운 카메라 이동

```javascript
// 목표 위치 설정
const targetPosition = new THREE.Vector3(0, 0, 0);
const eyePosition = new THREE.Vector3(100, 100, 100);

// Navigation API를 사용한 애니메이션 전환
viewer.navigation.setRequestTransition(
    true, // 애니메이션 사용
    eyePosition,
    targetPosition,
    viewer.navigation.getFov(),
    viewer.navigation.getCameraUpVector(),
    viewer.navigation.getWorldUpVector()
);

// 또는 Autocam 사용 (더 간단)
viewer.autocam.goToView(eyePosition, targetPosition);
```

**설명**: `setRequestTransition`은 현재 카메라 위치에서 목표 위치로 부드럽게 이동합니다. `autocam.goToView`는 내부적으로 최적의 경로를 계산하여 이동합니다.

### 패턴 5: 동적 조명 시뮬레이션 (태양의 움직임)

방향광과 환경 맵을 동기화하여 태양의 일주 운동을 시뮬레이션합니다.

```javascript
// 태양의 일주 운동 시뮬레이션
function simulateSunMovement() {
    const start = performance.now();
    const cycleSec = 30; // 30초에 하루 사이클

    // Simple Grey 프리셋 사용 (기본 조명만)
    const LightPresets = Autodesk.Viewing.Private.LightPresets;
    const simpleGreyIdx = LightPresets.findIndex((p) => p.name === "Simple Grey");
    viewer.setLightPreset(simpleGreyIdx);

    const dirLight = viewer.impl.dir_light1;
    dirLight.intensity = 1;

    function loop(now) {
        const t = (((now - start) / 1000) % cycleSec) / cycleSec; // 0~1
        const azimuth = t * Math.PI * 2; // 0~360도 (동→남→서→북)
        const altitude = (Math.sin(t * Math.PI) * Math.PI) / 4; // 0~45도~0

        // 방향광 위치 설정 (구면 좌표 → 직교 좌표)
        const dir = new THREE.Vector3()
            .setFromSphericalCoords(1, Math.PI / 2 - altitude, azimuth)
            .multiplyScalar(-1);
        dirLight.position.copy(dir);
        dirLight.target.position.set(0, 0, 0);

        // 환경 맵 회전 (WebGL만 지원)
        if (viewer.impl.renderer().setEnvRotation) {
            viewer.impl.renderer().setEnvRotation(azimuth);
        }

        // 렌더링 갱신
        viewer.impl.invalidate(false, true, true);

        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
}
```

**설명**:

-   구면 좌표계(`setFromSphericalCoords`)를 사용하여 방향광 위치를 계산합니다.
-   환경 맵을 동일한 각도로 회전시켜 조명 방향을 동기화합니다.
-   WebGPU에서는 환경 맵 회전이 지원되지 않습니다.

### 패턴 6: DbId로부터 모든 Fragment 이동

```javascript
async function moveElement(model, dbId, offsetX, offsetY, offsetZ) {
    const fragmentList = model.getFragmentList();
    const instanceTree = model.getInstanceTree();
    const fragIds = [];

    // DbId → FragmentIds
    instanceTree.enumNodeFragments(
        dbId,
        (fragId) => {
            fragIds.push(fragId);
        },
        true
    );

    // 각 Fragment 이동
    fragIds.forEach((fragId) => {
        const matrix = new THREE.Matrix4();
        getTransformFromArray(fragmentList.transforms, fragId, matrix);

        // 현재 위치에 offset 추가
        matrix.elements[12] += offsetX;
        matrix.elements[13] += offsetY;
        matrix.elements[14] += offsetZ;

        fragmentList.setTransform(fragId, matrix);
    });

    viewer.impl.invalidate(true, true, true);
}

// 사용
await moveElement(model, dbId, 100, 0, 0); // X축으로 100 이동
```

### 패턴 7: 요소 회전

```javascript
function rotateElement(model, dbId, angleRad, axis = "z") {
    const fragmentList = model.getFragmentList();
    const instanceTree = model.getInstanceTree();
    const fragIds = [];

    instanceTree.enumNodeFragments(
        dbId,
        (fragId) => {
            fragIds.push(fragId);
        },
        true
    );

    // 회전 행렬 생성
    const rotation = new THREE.Matrix4();
    if (axis === "x") {
        rotation.makeRotationX(angleRad);
    } else if (axis === "y") {
        rotation.makeRotationY(angleRad);
    } else {
        rotation.makeRotationZ(angleRad);
    }

    fragIds.forEach((fragId) => {
        const matrix = new THREE.Matrix4();
        getTransformFromArray(fragmentList.transforms, fragId, matrix);

        // 회전 적용 (현재 Transform * Rotation)
        matrix.multiply(rotation);

        fragmentList.setTransform(fragId, matrix);
    });

    viewer.impl.invalidate(true, true, true);
}

// 사용
rotateElement(model, dbId, Math.PI / 4, "z"); // Z축 45도 회전
```

### 패턴 8: 원점으로 초기화

```javascript
function resetTransform(model, fragId) {
    const fragmentList = model.getFragmentList();
    const originalMatrix = new THREE.Matrix4();

    // 원본 Transform 가져오기
    fragmentList.getOriginalWorldMatrix(fragId, originalMatrix);

    // 적용
    fragmentList.setTransform(fragId, originalMatrix);

    viewer.impl.invalidate(true, true, true);
}
```

### 패턴 9: 애니메이션 관리 클래스

```javascript
class AnimationManager {
    constructor(viewer) {
        this.viewer = viewer;
        this.animations = new Map(); // tweenId → { tween, frameId }
    }

    start(tweenId, tween) {
        const animate = (time) => {
            const ctx = this.animations.get(tweenId);
            if (!ctx) return;

            tween.update(time);

            if (tween.isPlaying()) {
                ctx.frameId = requestAnimationFrame(animate);
            } else {
                this.stop(tweenId);
            }
        };

        this.animations.set(tweenId, {
            tween,
            frameId: requestAnimationFrame(animate),
        });
    }

    stop(tweenId) {
        const ctx = this.animations.get(tweenId);
        if (!ctx) return;

        cancelAnimationFrame(ctx.frameId);
        ctx.tween.stop();
        this.animations.delete(tweenId);
    }

    stopAll() {
        this.animations.forEach((ctx, tweenId) => {
            this.stop(tweenId);
        });
    }
}

// 사용
const animMgr = new AnimationManager(viewer);

const tween = new TWEEN.Tween(state).to({ progress: 1 }, 2000).onUpdate(() => {
    /* ... */
});

tween.start();
animMgr.start("anim-1", tween);

// 중단
animMgr.stop("anim-1");
```

## 정리

### API 요약

| 기능               | API                                         | 용도                    |
| ------------------ | ------------------------------------------- | ----------------------- |
| **Visibility**     | `show()`, `hide()`, `isolate()`             | 요소 표시/숨김          |
| **Selection**      | `select()`, `clearSelection()`              | 요소 선택               |
| **Camera**         | `fitToView()`, `navigation.setView()`       | 카메라 제어             |
| **Color**          | `setThemingColor()`, `clearThemingColors()` | 색상 오버레이           |
| **Lighting**       | `setLightPreset()`, `toggleLights()`        | 조명 제어               |
| **IBL**            | `setLightPreset()`, `setEnvMapBackground()` | 환경 맵 기반 조명       |
| **Env Rotation**   | `renderer().setEnvRotation()`               | 환경 맵 회전 (WebGL)    |
| **Transform 읽기** | `fragmentList.transforms`                   | Float32Array 직접 접근  |
| **Transform 쓰기** | `fragmentList.setTransform()`               | Matrix4로 변환 적용     |
| **위치 추출**      | `Vector3.setFromMatrixPosition()`           | Matrix4에서 위치 가져옴 |
| **애니메이션**     | `requestAnimationFrame` + `TWEEN.js`        | 부드러운 보간           |
| **중심 좌표**      | `bbox.getCenter()`                          | Bounding Box 중심       |
| **이벤트**         | `addEventListener()`, `fireEvent()`         | 커스텀 이벤트           |

### 주요 이벤트

-   `SELECTION_CHANGED_EVENT`: 선택 변경
-   `AGGREGATE_SELECTION_CHANGED_EVENT`: 다중 모델 선택 변경
-   `HIDE_EVENT`: 요소 숨김
-   `SHOW_EVENT`: 요소 표시
-   `ISOLATE_EVENT`: Isolation 변경
-   `SHOW_ALL_EVENT`: 모두 표시
-   `CAMERA_CHANGE_EVENT`: 카메라 변경

### 주의사항

-   Transform 변경 후 반드시 `viewer.impl.invalidate()` 호출
-   애니메이션은 항상 cleanup 로직 구현
-   이벤트 리스너는 제거할 때 동일한 함수 참조를 사용해야 합니다
-   WebGPU에서는 환경 맵 회전이 지원되지 않습니다 (WebGL만 가능)
