<sub>2025.12.28 19:24</sub>

# 시각화 및 제어

`show()`, `hide()`, `isolate()`로 요소를 보이거나 숨기고, `select()`로 요소를 선택하여 강조 표시합니다. 선택 타입(SelectionType)에 따라 테두리 강조, 색상 변경 등 표시 방식이 달라지고, 선택 모드(SelectionMode)는 계층 구조에서 어떤 레벨을 선택할지 결정합니다. 카메라는 `navigation.setView()`로 위치와 방향을 지정하고, `fitToView()`로 선택된 요소를 화면에 맞춥니다. `setThemingColor()`는 요소에 색상 오버레이를 적용하여 카테고리나 상태를 시각화하고, `enableHeatmap()`은 센서 데이터를 색상 그라데이션으로 표현합니다. 조명은 방향광과 환경광으로 구성되며 Light Preset(기본 9개 제공)에 따라 실내/실외 환경이 설정됩니다. 환경 맵은 IBL을 통해 실사적인 조명을 제공하며, WebGL 렌더러에서는 런타임에 회전하여 동적 조명 효과를 구현할 수 있습니다.

## Visibility 제어

### 기본 메서드

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
-   `model`: (선택) DtModel 인스턴스 (기본값: `viewer.model`)

### Isolation

특정 요소만 표시하고 나머지를 모두 숨깁니다:

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

여러 모델에 걸친 요소를 동시에 제어할 수 있습니다:

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
// [{ model: DtModel, ids: [1, 2, 3] }, ...]

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

## 선택 상태 조회

```javascript
// 단일 모델
const selection = viewer.getSelection();
// 반환: number[]

// 다중 모델
const aggregateSelection = viewer.getAggregateSelection();
// 반환: [{ model: DtModel, selection: [1, 2, 3] }, ...]

// 선택 개수
const count = viewer.getSelectionCount();

// 선택 가시성 확인
const visibility = viewer.getSelectionVisibility();
// 반환: { hasVisible: boolean, hasHidden: boolean }
```

### Selection Mode

요소 선택 시 계층 구조의 어떤 레벨을 선택할지 결정합니다:

```javascript
viewer.setSelectionMode(Autodesk.Viewing.SelectionMode.LEAF_OBJECT);

const mode = viewer.getSelectionMode();
```

| Mode                         | 값  | 설명                            |
| ---------------------------- | --- | ------------------------------- |
| `SelectionMode.LEAF_OBJECT`  | 0   | 최하위 요소만 선택 (기본값)     |
| `SelectionMode.FIRST_OBJECT` | 1   | 루트에 가까운 비-복합 노드 선택 |
| `SelectionMode.LAST_OBJECT`  | 2   | 가장 가까운 복합 노드 선택      |

## Selection 이벤트

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
    // [{ model: DtModel, selection: [1, 2, 3] }, ...]
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

선택된 요소 또는 전체 모델에 카메라를 맞춥니다:

```javascript
// 선택된 요소에 맞춤
viewer.fitToView();

// 특정 요소에 맞춤
viewer.fitToView([dbId1, dbId2, dbId3]);

// 전체 모델에 맞춤
viewer.fitToView(null);

// 즉시 이동 (애니메이션 없음)
viewer.fitToView(null, null, true); // immediate = true
```

**내부 동작**:

-   선택된 요소의 Bounding Box를 계산합니다.
-   `navigation.fitBounds(immediate, bounds)`를 호출하여 카메라를 이동합니다.
-   Bounding Box가 비어있으면 전체 모델의 가시 영역을 사용합니다.

### Navigation 설정

```javascript
// Fit-to-View 마진 설정 (기본값: 0.05 = 5%)
// 수직 마진 (상단/하단)
viewer.navigation.FIT_TO_VIEW_VERTICAL_MARGIN = 0.1; // 10% 마진
// 수평 마진 (좌측/우측)
viewer.navigation.FIT_TO_VIEW_HORIZONTAL_MARGIN = 0.1; // 10% 마진

// Fit-to-View 오프셋 설정 (기본값: 0.0)
viewer.navigation.FIT_TO_VIEW_VERTICAL_OFFSET = 0.0;
viewer.navigation.FIT_TO_VIEW_HORIZONTAL_OFFSET = 0.0;

// Pivot 자동 설정
viewer.navigation.setSelectionSetsPivot(true); // 선택 시 Pivot 이동

// Pivot 표시
viewer.navigation.setPivotSetFlag(true); // Pivot 마커 표시
```

## Material과 Color

### Theming Color

요소에 색상 오버레이를 적용합니다:

```javascript
// 단일 요소에 색상 적용
const color = new THREE.Vector4(1.0, 0.0, 0.0, 1.0); // RGBA, [0,1] 범위
viewer.setThemingColor(dbId, color, model);

// 재귀적으로 모든 자식에 적용
viewer.setThemingColor(dbId, color, model, true);

// 여러 요소에 적용
[dbId1, dbId2, dbId3].forEach((id) => {
    viewer.setThemingColor(id, color, model);
});
```

**Vector4 구성**:

-   `x, y, z`: RGB 값 (0.0 ~ 1.0)
-   `w`: Intensity (0.0 ~ 1.0, 색상 혼합 강도)

```javascript
// 예시: 빨간색 50% 강도
const red = new THREE.Vector4(1.0, 0.0, 0.0, 0.5);

// 파란색 100% 강도
const blue = new THREE.Vector4(0.0, 0.0, 1.0, 1.0);

// RGB 255 값을 0-1 범위로 변환
const rgbToColor = (r, g, b, intensity) => new THREE.Vector4(r / 255, g / 255, b / 255, intensity);

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
facility.getModels().forEach((model) => {
    const dbIds = [1, 2, 3]; // 각 모델의 요소 ID
    dbIds.forEach((dbId) => {
        viewer.setThemingColor(dbId, color, model);
    });
});
```

### Heatmap 시각화 (Tandem)

StreamManager를 통해 센서 데이터를 Heatmap으로 시각화할 수 있습니다:

```javascript
const streamMgr = facility.getStreamManager();

// Heatmap 활성화
await streamMgr.enableHeatmap({
    propertyName: "Temperature",
    minValue: 20,
    maxValue: 30,
    colorStops: [
        { value: 20, color: new THREE.Color(0x0000ff) }, // 파란색
        { value: 25, color: new THREE.Color(0x00ff00) }, // 초록색
        { value: 30, color: new THREE.Color(0xff0000) }, // 빨간색
    ],
});

// Heatmap 비활성화
streamMgr.disableHeatmap();
```

**작동 방식**:

-   각 Stream 요소의 최신 센서 값을 조회합니다.
-   `colorStops` 범위에 따라 색상을 계산합니다.
-   `setThemingColor()`를 사용하여 색상을 적용합니다.

## Lighting 제어

### Light 초기화

Viewer는 생성 시 자동으로 조명을 초기화합니다:

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

방향성 광원은 카메라에 부착되어 항상 뷰 방향을 따릅니다:

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

환경광은 모든 방향에서 균등하게 비춥니다:

```javascript
const ambLight = viewer.impl.amb_light;

// 색상 변경
ambLight.color.setRGB(0.8, 0.9, 1.0);
```

### Light Preset

Light Preset은 조명 색상을 자동으로 설정합니다:

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

LMV는 기본적으로 다음 9개의 Light Preset을 제공합니다:

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

#### Debug 전용 Light Preset (기본 비활성화)

LMV 소스 코드에는 추가로 **27개의 Debug용 Preset**이 정의되어 있으나, 기본적으로 비활성화되어 있습니다:

**비활성화 이유** (소스 코드 주석):

> "환경 맵이 Revit 데이터와 잘 맞도록 노출 설정을 수동으로 튜닝해야 하며, 많은 프리셋이 시각적으로 반복적입니다."

**Debug Preset 목록**:

-   Grey Room, Photo Booth, Tranquility, Infinity Pool
-   Simple White, Simple Black
-   Riverbank, Rim Highlights, Cool Light, Warm Light, Soft Light, Grid Light, Field
-   Night, Parking, River Road, Flat Shading
-   Crossroads, Seaport, Glacier, RaaS Test Env

**활성화 조건**:

```javascript
// LightPresets.js 코드 (566-568번 줄)
if (getGlobal().ENABLE_DEBUG) {
    Array.prototype.push.apply(LightPresets, DebugEnvironments);
}
```

Debug 모드가 활성화된 경우에만 자동으로 추가됩니다.

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

환경 맵은 런타임에 회전할 수 있으며, 이는 조명 방향을 동적으로 변경하는 데 유용합니다:

```javascript
// 환경 맵 회전 (라디안 단위)
viewer.impl.renderer().setEnvRotation(Math.PI / 2); // 90도 회전

// 현재 회전 각도 조회
const rotation = viewer.impl.renderer().getEnvRotation();
```

**WebGPU 제한사항**: WebGPU 렌더러를 사용하는 경우, `setEnvRotation`은 현재 구현되지 않았습니다 (TODO 상태). WebGL 렌더러에서만 정상 작동합니다.

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

## 고급 렌더링 커스터마이징

### WebGPU 셰이더 후킹 (Edge/Outline 색상 변경)

WebGPU 렌더러를 사용하는 경우, 셰이더 코드를 런타임에 수정하여 아웃라인(엣지) 색상을 변경할 수 있습니다.

**작동 원리**:

1. WebGPU 디바이스 생성 시점을 가로챕니다.
2. `createShaderModule` 함수를 후킹합니다.
3. 셰이더 WGSL 코드에서 색상 관련 코드를 찾아 교체합니다.

**구현 코드**:

```javascript
// 1. 커스텀 엣지 색상 정의 (0.0~1.0 범위)
function getNormalizedColor(colorObj) {
  if (!colorObj) return { r: 1, g: 1, b: 1, a: 1 };

  return {
    r: colorObj.r / 255,
    g: colorObj.g / 255,
    b: colorObj.b / 255,
    a: colorObj.a,
  };
}

// 전역 변수에 색상 저장
(window as any).MY_CUSTOM_EDGE_COLOR = getNormalizedColor({
  r: 255,
  g: 0,
  b: 0,
  a: 1,
}); // 빨간색 예시

// 2. WebGPU 디바이스 생성 가로채기
const originalRequestDevice = (window as any).GPUAdapter.prototype.requestDevice;

(window as any).GPUAdapter.prototype.requestDevice = async function (...args: any[]) {
  const device = await originalRequestDevice.apply(this, args);

  // 3. createShaderModule 함수 후킹
  const originalCreateShaderModule = device.createShaderModule;

  device.createShaderModule = function (descriptor: any) {
    let code = descriptor.code;

    // 4. 엣지 색상 코드 찾기 및 교체
    const targetSignature = "var color = intToVecf(commonMaterialUniforms.edgeColor);";

    if (code.includes(targetSignature)) {
      const { r, g, b, a } = (window as any).MY_CUSTOM_EDGE_COLOR;

      // WGSL 코드로 교체
      const replacement = `
        // [Custom Edge Color Hook]
        var color = vec4f(${r}, ${g}, ${b}, ${a});
      `;

      code = code.replace(targetSignature, replacement);
    }

    // 수정된 셰이더 코드로 생성
    return originalCreateShaderModule.call(this, { ...descriptor, code: code });
  };

  return device;
};

// 5. Viewer 초기화 (반드시 후킹 이후에 실행)
await viewer.initialize();
```

**주의사항**:

-   **반드시 Viewer 초기화 전에** 후킹 코드를 실행해야 합니다.
-   WebGPU를 사용하지 않는 브라우저에서는 작동하지 않습니다.
-   셰이더 코드 구조가 변경되면 `targetSignature`를 업데이트해야 합니다.
-   색상은 0.0~1.0 범위로 정규화해야 합니다 (RGB 255 기준을 255로 나눔).

**다른 색상 적용 예시**:

```javascript
// 파란색 엣지
(window as any).MY_CUSTOM_EDGE_COLOR = getNormalizedColor({
  r: 0,
  g: 100,
  b: 255,
  a: 1,
});

// 초록색 엣지 (투명도 50%)
(window as any).MY_CUSTOM_EDGE_COLOR = getNormalizedColor({
  r: 0,
  g: 255,
  b: 0,
  a: 0.5,
});
```

**동적 색상 변경**:

셰이더는 디바이스 생성 시점에만 컴파일되므로, 색상을 런타임에 변경하려면 다음 방법을 사용합니다:

```javascript
// 방법 1: Theming Color 사용 (권장)
viewer.setThemingColor(dbId, new THREE.Vector4(r, g, b, intensity), model);

// 방법 2: Viewer 재시작 (비권장, 성능 이슈)
// MY_CUSTOM_EDGE_COLOR를 변경한 후 Viewer를 다시 초기화
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

### 패턴 3: Level별 가시성 제어

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

**설명**: `FacetsManager.setVisibilityById`는 다중 모델 환경에서 자동으로 모든 모델의 해당 Level 요소를 처리합니다. 단일 모델인 경우 `viewer.isolate`를 직접 사용할 수 있습니다.

### 패턴 4: 부드러운 카메라 이동

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

방향광과 환경 맵을 동기화하여 태양의 일주 운동을 시뮬레이션합니다:

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

## 정리

### API 요약

| 기능             | API                                         | 용도                 |
| ---------------- | ------------------------------------------- | -------------------- |
| **Visibility**   | `show()`, `hide()`, `isolate()`             | 요소 표시/숨김       |
| **Selection**    | `select()`, `clearSelection()`              | 요소 선택            |
| **Camera**       | `fitToView()`, `navigation.setView()`       | 카메라 제어          |
| **Color**        | `setThemingColor()`, `clearThemingColors()` | 색상 오버레이        |
| **Heatmap**      | `streamMgr.enableHeatmap()`                 | 센서 데이터 시각화   |
| **Lighting**     | `setLightPreset()`, `toggleLights()`        | 조명 제어            |
| **IBL**          | `setLightPreset()`, `setEnvMapBackground()` | 환경 맵 기반 조명    |
| **Env Rotation** | `renderer().setEnvRotation()`               | 환경 맵 회전 (WebGL) |
| **Events**       | `SELECTION_CHANGED_EVENT`, `ISOLATE_EVENT`  | 사용자 인터랙션 추적 |

## 주요 이벤트

-   `SELECTION_CHANGED_EVENT`: 선택 변경
-   `AGGREGATE_SELECTION_CHANGED_EVENT`: 다중 모델 선택 변경
-   `HIDE_EVENT`: 요소 숨김
-   `SHOW_EVENT`: 요소 표시
-   `ISOLATE_EVENT`: Isolation 변경
-   `SHOW_ALL_EVENT`: 모두 표시
-   `CAMERA_CHANGE_EVENT`: 카메라 변경
