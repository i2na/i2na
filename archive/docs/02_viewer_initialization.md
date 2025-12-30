<sub>2025.12.30 23:52</sub>

# Viewer 생성 및 초기 설정

Viewer는 웹 브라우저에서 3D 모델을 렌더링하는 컴포넌트입니다. `Autodesk.Viewing.Initializer()`로 서버 환경, API 주소, 인증 토큰을 설정하고, `GuiViewer3D` 인스턴스를 생성하여 HTML 요소에 연결합니다. `viewer.start()`는 내부적으로 `initialize()` → `setUp()`을 호출하여 WebGL 컨텍스트, 렌더러, 카메라, 씬, 네비게이션, 도구 컨트롤러를 초기화하고 확장 기능을 불러옵니다. Extension은 `Autodesk.Viewing.theExtensionManager`를 통해 등록하고 Viewer 생성 시 자동 로드하거나 런타임에 동적 로드할 수 있습니다. Light Preset, 배경색, 모서리 렌더링, 바닥 그림자 등의 시각 설정은 생성 직후 또는 Profile Settings에서 기본값을 지정하며, 대부분의 설정은 localStorage에 자동 저장되어 다음 세션에서 복원됩니다.

## 초기화 프로세스

### Initializer

`Autodesk.Viewing.Initializer(options, callback)`는 Viewer SDK를 사용하기 전에 반드시 호출해야 하는 전역 초기화 함수입니다.

**수행 작업**:

-   환경 변수 설정 (`env`, `api`)
-   인증 초기화 (`getAccessToken` 콜백 등록)
-   API 엔드포인트 초기화
-   로케일 설정 (`language`)
-   Worker 스크립트 로드 (CORS 환경의 경우 `corsWorker: true`)

**주요 옵션**:

```javascript
Autodesk.Viewing.Initializer(
    {
        env: "DtProduction", // "AutodeskProduction", "DtStaging" 등
        api: "dt", // "modelDerivativeV2", "derivativeV2_EU" 등
        language: "ko", // RFC 4646 표준 (기본값: 브라우저 언어)
        shouldInitializeAuth: false, // 수동 토큰 관리 시 false
        getAccessToken: (onSuccess) => {
            // SDK가 토큰이 필요할 때 호출
            const token = "..."; // Bearer 토큰
            const expireTimeInSeconds = 3600; // 만료 시간 (초)
            onSuccess(token, expireTimeInSeconds);
        },
        corsWorker: true, // 다른 도메인에서 Viewer 로드 시
    },
    () => {
        // 초기화 완료 콜백
        console.log("Initializer completed");
    }
);
```

**환경 옵션**:

| 환경                    | 설명                  |
| ----------------------- | --------------------- |
| `"AutodeskProduction"`  | Forge/APS Production  |
| `"AutodeskStaging"`     | Forge/APS Staging     |
| `"AutodeskDevelopment"` | Forge/APS Development |
| `"DtProduction"`        | Tandem Production     |
| `"DtStaging"`           | Tandem Staging        |

**API 옵션**:

| API                   | 설명                        |
| --------------------- | --------------------------- |
| `"modelDerivativeV2"` | Forge/APS (북미)            |
| `"derivativeV2_EU"`   | Forge/APS (유럽 데이터센터) |
| `"dt"`                | Tandem                      |

`Initializer`는 Promise 기반으로 작동하며, 모든 초기화가 완료된 후 `callback`이 호출됩니다. 이 함수는 애플리케이션 전체에서 단 한 번만 호출해야 합니다.

### Viewer3D 생성

```javascript
const viewer = new Autodesk.Viewing.GuiViewer3D(container, config);
```

**`container`**: HTML `<div>` 요소 (반드시 div여야 하며, canvas는 허용되지 않음)

**참고**: `GuiViewer3D`는 `Viewer3D`를 확장한 UI가 포함된 버전입니다. Toolbar, Context Menu, ViewCube, Progress Bar 등이 자동으로 포함됩니다. UI가 필요 없는 경우 `Viewer3D`를 사용할 수 있지만, 대부분의 경우 `GuiViewer3D`를 사용합니다.

**`config` 주요 옵션**:

| 옵션                 | 타입     | 기본값         | 설명                                              |
| -------------------- | -------- | -------------- | ------------------------------------------------- |
| `startOnInitialize`  | boolean  | `true`         | `false` 설정 시 `viewer.start()` 수동 호출 필요   |
| `theme`              | string   | `'dark-theme'` | `'light-theme'` 또는 `'dark-theme'`               |
| `extensions`         | string[] | `[]`           | 자동 로드할 Extension ID 배열                     |
| `disabledExtensions` | object   | `{}`           | Extension 비활성화 설정 (예: `{ measure: true }`) |
| `localStoragePrefix` | string   | 기본 접두사    | 설정 저장 시 사용할 localStorage key 접두사       |
| `profileSettings`    | object   | `{}`           | 기본 설정 덮어쓰기 (프로필 설정)                  |

**예제**:

```javascript
const config = {
    theme: "light-theme",
    extensions: ["Autodesk.Measure", "Autodesk.Section"],
    disabledExtensions: {
        viewcube: true, // ViewCube 비활성화
    },
    profileSettings: {
        lightPreset: 1, // Sharp Highlights
        backgroundColorPreset: "Custom",
        backgroundColor: [230, 230, 230, 150, 150, 150],
    },
};

const viewer = new Autodesk.Viewing.GuiViewer3D(container, config);
```

생성 시 자동으로 수행되는 작업:

-   Canvas 요소 생성 및 DOM 추가
-   렌더링 엔진 초기화 준비
-   테마 클래스 적용
-   Preferences 객체 생성 (localStorage 기반 설정 관리)
-   고유 Viewer ID 할당

### start()

```javascript
viewer.start(url, options, onSuccess, onError, initOptions);
```

`start()`는 내부적으로 `initialize()` → `setUp()` 순서로 호출됩니다.

**`initialize()`에서 수행하는 작업**:

-   WebGL/WebGPU 컨텍스트 생성 및 검증
-   Renderer, Scene, Camera 초기화
-   Navigation 시스템 설정
-   ToolController 생성
-   Context Menu 초기화
-   Progress Bar, Status Bar UI 생성
-   Extension 로드
-   기본 Navigation Tool 설정
-   VIEWER_INITIALIZED 이벤트 발생

**`setUp()`에서 수행하는 작업**:

-   Extension 초기화 완료
-   Navigation 오버라이드 적용
-   Canvas 클릭 동작 설정
-   Profile 설정 초기화 (기본 시각 설정 적용)

**파라미터**:

-   `url` (선택): 모델 URN 또는 파일 경로 (전달 시 `loadModel()` 자동 호출)
-   `options` (선택): `loadModel()`에 전달할 옵션
-   `onSuccess` (선택): 성공 콜백
-   `onError` (선택): 실패 콜백
-   `initOptions` (선택): `initialize()`에 전달할 옵션

**예제 1: 모델 없이 Viewer만 초기화**:

```javascript
viewer.start();

// 나중에 모델 로드
viewer.loadModel("urn:adsk.dtm:...");
```

**예제 2: 모델과 함께 초기화**:

```javascript
viewer.start(
    "urn:adsk.dtm:...",
    {
        // loadModel 옵션
        keepCurrentModels: false,
        globalOffset: { x: 0, y: 0, z: 0 },
    },
    () => {
        console.log("Model loaded successfully");
    },
    (errorCode, errorMsg) => {
        console.error("Load failed:", errorCode, errorMsg);
    }
);
```

`start()`가 호출되면 `viewer.started = true`로 설정되며, 중복 호출이 방지됩니다. 이미 시작된 Viewer에서 `start()`를 다시 호출하면 아무 동작도 하지 않습니다.

## Extension 관리

Extension은 Viewer의 기능을 확장하는 플러그인 시스템입니다. 각 Extension은 `Autodesk.Viewing.Extension`을 상속한 클래스로 정의되며, 필수 메서드인 `load()`와 `unload()`를 구현해야 합니다.

### Extension 등록

커스텀 Extension을 사용하려면 먼저 전역 Extension Manager에 등록해야 합니다. 등록은 Viewer 생성 전에 수행되어야 하며, 등록된 Extension ID로 로드할 수 있습니다.

```javascript
Autodesk.Viewing.theExtensionManager.registerExtension("MyExtension", MyExtensionClass);
```

**Extension 클래스 구조**:

```javascript
class MyExtensionClass extends Autodesk.Viewing.Extension {
    constructor(viewer, options) {
        super(viewer, options);
        this.viewer = viewer; // Viewer 인스턴스 참조
        this.options = options; // loadExtension() 시 전달된 옵션
    }

    load() {
        // Extension 로드 시 호출됨
        // UI 초기화, 이벤트 리스너 등록 등 수행
        console.log("MyExtension loaded");

        // 반환값:
        // - true: 로드 성공
        // - Promise: 비동기 로드 지원 (resolve 시 로드 완료)
        return true;
    }

    unload() {
        // Extension 언로드 시 호출됨
        // 이벤트 리스너 제거, UI 정리 등 수행
        console.log("MyExtension unloaded");

        // 반환값:
        // - true: 언로드 성공
        // - false: 언로드 실패 (Extension이 계속 활성 상태로 유지됨)
        return true;
    }
}
```

### Extension 로드

**자동 로드** (Viewer 생성 시):

```javascript
const config = {
    extensions: ["Autodesk.Measure", "Autodesk.Section", "MyExtension"],
};
const viewer = new Autodesk.Viewing.GuiViewer3D(container, config);
```

**수동 로드** (런타임):

```javascript
// Extension 로드 (비동기)
await viewer.loadExtension("Autodesk.BimWalk", options);

// 로드 성공 시 Extension 인스턴스 반환
const extension = viewer.getExtension("Autodesk.BimWalk");
```

`loadExtension()`은 비동기 함수이며, Extension이 이미 로드되어 있으면 기존 인스턴스를 반환합니다. 새로 로드하지 않으므로 중복 로드를 방지할 수 있습니다.

**언로드**:

```javascript
// Extension 언로드
const success = viewer.unloadExtension("Autodesk.BimWalk");

// success: true (언로드 성공) 또는 false (언로드 실패)
```

언로드 시 Extension의 `unload()` 메서드가 호출되며, Extension 인스턴스는 Viewer에서 제거됩니다.

### 기본 제공 Extensions

| Extension ID            | 기능                |
| ----------------------- | ------------------- |
| `Autodesk.Measure`      | 측정 도구           |
| `Autodesk.Section`      | 단면 도구           |
| `Autodesk.BimWalk`      | 1인칭 워크스루      |
| `Autodesk.ViewCubeUi`   | ViewCube 네비게이션 |
| `Autodesk.BoxSelection` | 박스 선택           |
| `Autodesk.Snapping`     | 스냅 기능           |

**비활성화 방법**:

```javascript
const config = {
    disabledExtensions: {
        viewcube: true, // ViewCube 비활성화
        measure: true, // Measure 비활성화
    },
};
```

**참고**: `disabledExtensions`의 키는 Extension ID가 아닌 내부 키 이름을 사용합니다 (예: `viewcube`, `measure`).

### Extension 옵션 전달

Extension 로드 시 옵션을 전달할 수 있습니다:

```javascript
await viewer.loadExtension("MyExtension", {
    color: "red",
    size: 10,
});
```

Extension 생성자의 `options` 파라미터로 전달됩니다.

## 초기 시각 설정

### Light Preset

Light Preset은 미리 정의된 조명 환경을 제공합니다. 각 Preset은 Directional Light, Ambient Light, IBL (Image-Based Lighting) 설정을 포함합니다.

```javascript
viewer.setLightPreset(1); // 인덱스로 지정
// 또는
viewer.setLightPreset("Sharp Highlights"); // 이름으로 지정
```

**기본 제공 Preset** (인덱스 0-8):

| Index | 이름             | 특징           |
| ----- | ---------------- | -------------- |
| 0     | Simple Grey      | 기본 환경      |
| 1     | Sharp Highlights | HDR, 1000 lux  |
| 2     | Boardwalk        | HDR            |
| 3     | Snow Field       | HDR, 고조도    |
| 4     | Harbor           | HDR            |
| 5     | Dark Sky         | HDR, 실내 환경 |
| 6     | Plaza            | HDR, 실외 환경 |
| 7     | City Night       | 야간 환경      |
| 8     | Contrast         | 고대비 환경    |

**톤맵 방식**:

-   `0`: None (톤맵 미적용)
-   `1`: Prism Cannon-Lum (색상 보존)
-   `2`: OGC Cannon RGB (색상 비보존, 대부분 Preset의 기본값)

**참고**:

-   2D 모델에서는 Light Preset이 적용되지 않습니다.

**작동 조건**:

-   3D 모델에만 적용됩니다.
-   2D 모델에서는 Light Preset이 무시됩니다.

### 배경색

그라데이션 배경색을 설정합니다 (상단 → 하단):

```javascript
viewer.setBackgroundColor(red, green, blue, red2, green2, blue2);
```

**예제**:

```javascript
// 밝은 회색 → 중간 회색
viewer.setBackgroundColor(230, 230, 230, 150, 150, 150);

// 흰색 → 연한 파란색
viewer.setBackgroundColor(255, 255, 255, 200, 220, 240);
```

각 RGB 값은 0-255 범위입니다. 6개의 인자 중 뒤 3개를 생략하면 단색 배경이 적용됩니다.

**기본값 설정**:

```javascript
const config = {
    profileSettings: {
        backgroundColorPreset: "Custom",
        backgroundColor: [230, 230, 230, 150, 150, 150],
    },
};
```

### Edge Rendering

지오메트리의 모서리 라인 표시를 제어합니다:

```javascript
viewer.setDisplayEdges(true); // 모서리 표시
viewer.setDisplayEdges(false); // 모서리 숨김
```

**작동 조건**:

-   3D 모델에만 적용됩니다. 2D 모델(`model.is2d() === true`)에서는 무시됩니다.
-   모델이 Edge Topology 데이터를 포함해야 합니다. Edge Topology가 없는 모델에서는 효과가 없습니다.

**Edge 스타일 설정**:

```javascript
// Edge 색상
viewer.setEdgeColor(new THREE.Color(0x000000));

// Edge 두께
viewer.impl.setEdgeWidth(1.0); // 픽셀 단위
```

**기본값 설정**:

```javascript
const config = {
    profileSettings: {
        edgeRendering: true,
    },
};
```

### Ground Shadow

바닥 그림자 표시를 제어합니다:

```javascript
viewer.setGroundShadow(true); // 그림자 활성화
viewer.setGroundShadow(false); // 그림자 비활성화
```

**추가 설정**:

```javascript
// 그림자 색상
viewer.setGroundShadowColor(new THREE.Color(0x000000));

// 그림자 투명도 (0.0 ~ 1.0)
viewer.setGroundShadowAlpha(0.5);
```

**작동 조건**:

-   3D 모델에만 적용됩니다. 2D 모델(`model.is2d() === true`)에서는 무시됩니다.
-   Shadow Map이 활성화되어야 합니다 (`viewer.impl.renderer().settings.shadows === true`).
-   일부 브라우저나 GPU에서는 성능 문제로 자동 비활성화될 수 있습니다.

**기본값 설정**:

```javascript
const config = {
    profileSettings: {
        groundShadow: true,
        groundShadowAlpha: 0.5,
    },
};
```

### 기타 시각 설정

```javascript
// 고스팅 (선택되지 않은 요소 투명 처리) 활성화/비활성화
viewer.setGhosting(true);

// 품질 레벨 (Ambient Shadows, Anti-aliasing)
viewer.setQualityLevel(ambientShadows, antiAliasing);
// ambientShadows: true/false
// antiAliasing: true/false

// Ground Reflection (바닥 반사)
viewer.setGroundReflection(true);

// 환경 맵을 배경으로 사용
viewer.setEnvMapBackground(true);

// Progressive Rendering (점진적 렌더링)
viewer.setProgressiveRendering(true);

// Ambient Occlusion (주변광 차폐)
viewer.setAOEnabled(true);
```

**기본값 설정**:

```javascript
const config = {
    profileSettings: {
        ghosting: true,
        ambientShadows: true,
        antialiasing: true,
        groundReflection: false,
        envMapBackground: false,
    },
};
```

## 기본 선택 설정

Viewer 생성 시 선택 동작의 기본값을 설정할 수 있습니다.

### Selection Mode

계층 구조에서 선택할 레벨을 지정합니다:

| Mode           | 값  | 설명                      |
| -------------- | --- | ------------------------- |
| `LEAF_OBJECT`  | 1   | 최하위 요소 선택 (기본값) |
| `FIRST_OBJECT` | 2   | 최상위 요소 선택          |
| `LAST_OBJECT`  | 3   | 중간 레벨 선택            |

```javascript
const config = {
    profileSettings: {
        selectionMode: Autodesk.Viewing.SelectionMode.LEAF_OBJECT,
    },
};
```

### Selection Type

강조 표시 방식을 지정합니다:

| Type        | 값  | 설명               |
| ----------- | --- | ------------------ |
| `MIXED`     | 0   | 일반 선택 (기본값) |
| `REGULAR`   | 1   | 일반 선택          |
| `OVERLAYED` | 2   | 오버레이 강조      |

```javascript
// 선택 색상 설정
viewer.setSelectionColor(new THREE.Color(0xff6600), Autodesk.Viewing.SelectionType.MIXED);
```

### 다중 선택 모드

```javascript
// 기본값 설정
const config = {
    profileSettings: {
        clickToSetCOI: false, // 클릭 시 카메라 중심점 변경 방지
        reverseMouseZoomDir: false, // 마우스 휠 방향
    },
};
```

## 설정 저장 (Preferences)

Viewer는 사용자 설정을 localStorage에 자동 저장합니다.

**저장되는 항목 예시**:

-   Light Preset
-   배경색
-   Edge Rendering 상태
-   Ground Shadow 상태
-   Selection Mode
-   Display Units
-   Navigation 설정

### Preference 접근

```javascript
// 값 읽기
const lightPreset = viewer.prefs.get("lightPreset");

// 값 쓰기
viewer.prefs.set("lightPreset", 1);

// 기본값으로 리셋
viewer.prefs.reset("lightPreset");
```

### Preference 리스너

```javascript
viewer.prefs.addListeners("lightPreset", (value) => {
    console.log("Light preset changed to:", value);
});

// 리스너 제거
viewer.prefs.removeListeners("lightPreset", callback);
```

### 저장 위치

설정은 `localStoragePrefix` (기본값: `'Autodesk.Viewing.Private.GuiViewer3D.SavedSettings.'`) 접두사로 저장됩니다:

```javascript
const config = {
    localStoragePrefix: "MyApp.Viewer.Settings.",
};
```

### Preference 비활성화

localStorage 저장을 비활성화하려면:

```javascript
viewer.prefs.disableSaving();

// 다시 활성화
viewer.prefs.enableSaving();
```

## 초기화 완료 이벤트

```javascript
viewer.addEventListener(Autodesk.Viewing.VIEWER_INITIALIZED, () => {
    console.log("Viewer initialized, ID:", viewer.id);
    // Extension 로드, UI 초기화 등
});

viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, (event) => {
    console.log("Model geometry loaded:", event.model);
    // 모델별 초기 설정, 카메라 조정 등
});

viewer.addEventListener(Autodesk.Viewing.MODEL_ADDED_EVENT, (event) => {
    console.log("Model added:", event.model);
    // 다중 모델 환경에서 모델 추가 시
});

viewer.addEventListener(Autodesk.Viewing.MODEL_ROOT_LOADED_EVENT, (event) => {
    console.log("Model root loaded:", event.model);
    // Instance Tree 접근 가능
});
```

**이벤트 순서**:

1. `VIEWER_INITIALIZED` - Viewer 초기화 완료
2. `MODEL_ROOT_LOADED_EVENT` - 모델 메타데이터 로드 완료
3. `GEOMETRY_LOADED_EVENT` - 지오메트리 로드 완료
4. `MODEL_ADDED_EVENT` - 모델이 뷰어에 추가됨

## 전체 초기화 예제

```javascript
// 1. Initializer 호출
Autodesk.Viewing.Initializer(
    {
        env: "DtProduction",
        api: "dt",
        getAccessToken: (onSuccess) => {
            const token = getTokenFromServer();
            const expireInSeconds = 3600;
            onSuccess(token, expireInSeconds);
        },
    },
    () => {
        // 2. Viewer 생성
        const config = {
            theme: "dark-theme",
            extensions: ["Autodesk.Measure", "Autodesk.Section"],
            disabledExtensions: {
                viewcube: true,
            },
            profileSettings: {
                lightPreset: 1,
                backgroundColorPreset: "Custom",
                backgroundColor: [230, 230, 230, 150, 150, 150],
                edgeRendering: true,
                groundShadow: true,
            },
        };

        const viewer = new Autodesk.Viewing.GuiViewer3D(container, config);

        // 3. 이벤트 리스너 등록
        viewer.addEventListener(Autodesk.Viewing.VIEWER_INITIALIZED, () => {
            console.log("Viewer ready");
        });

        viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, () => {
            console.log("Model loaded");
            viewer.fitToView();
        });

        // 4. Viewer 시작
        viewer.start();

        // 5. 모델 로드 (start 후)
        viewer.loadModel("urn:adsk.dtm:...");
    }
);
```

## 정리

### 초기화 순서

1. `Autodesk.Viewing.Initializer()` - 전역 환경 설정
2. `new Autodesk.Viewing.GuiViewer3D()` - Viewer 인스턴스 생성
3. `viewer.start()` - 렌더링 엔진 초기화
4. `viewer.loadModel()` - 모델 로드

### 주요 설정 옵션

| 설정           | 메서드 / 옵션          | 기본값        |
| -------------- | ---------------------- | ------------- |
| Light Preset   | `setLightPreset()`     | 0             |
| 배경색         | `setBackgroundColor()` | 그라데이션    |
| Edge Rendering | `setDisplayEdges()`    | `false`       |
| Ground Shadow  | `setGroundShadow()`    | `false`       |
| Ghosting       | `setGhosting()`        | `true`        |
| Selection Mode | `profileSettings`      | `LEAF_OBJECT` |
| Theme          | `config.theme`         | `dark-theme`  |

### 주요 이벤트

| 이벤트                    | 발생 시점            |
| ------------------------- | -------------------- |
| `VIEWER_INITIALIZED`      | Viewer 초기화 완료   |
| `MODEL_ROOT_LOADED_EVENT` | 모델 메타데이터 로드 |
| `GEOMETRY_LOADED_EVENT`   | 지오메트리 로드 완료 |
| `MODEL_ADDED_EVENT`       | 모델 추가 완료       |
