---
title: "Autodesk Viewer 초기화 및 설정 완벽 가이드"
createdAt: "2025-01-20 14:00"
summary: "웹 브라우저에서 3D 모델을 렌더링하는 Viewer 초기화 방법을 배우세요. Initializer 설정, GuiViewer3D 생성, Light Preset, 확장 기능 로딩까지 모든 과정을 상세히 다룹니다."
---

Viewer는 웹 브라우저에서 3D 모델을 렌더링하는 컴포넌트입니다. `Autodesk.Viewing.Initializer()`로 서버 환경, API 주소, 인증 토큰을 설정하고, `GuiViewer3D` 인스턴스를 생성하여 HTML 요소에 연결합니다. `viewer.start()`는 3D 렌더링에 필요한 카메라, 씬, 도구 컨트롤러를 초기화하고 확장 기능을 불러옵니다. Light Preset은 실내, 실외, 스튜디오 등 16가지 조명 환경을 제공하며, 배경색, 모서리 라인, 바닥 그림자 같은 시각 요소를 설정할 수 있습니다. 측정, 단면, 워크스루 같은 확장 기능은 생성 시 자동으로 불러오거나 나중에 추가할 수 있습니다.

# 1. 초기화 프로세스

## Initializer

`Autodesk.Viewing.Initializer(options, callback)`는 Viewer SDK를 사용하기 전에 반드시 호출해야 하는 전역 초기화 함수입니다.

**수행 작업**:

- 환경 변수 설정 (`env`, `api`)
- 인증 초기화 (`getAccessToken` 콜백 등록)
- API 엔드포인트 초기화
- 로케일 설정 (`language`)
- Worker 스크립트 로드 (CORS 환경의 경우 `corsWorker: true`)

**주요 옵션**:

```javascript
{
  env: "AutodeskProduction",  // 또는 "AutodeskStaging", "AutodeskDevelopment"
  api: "modelDerivativeV2",   // 또는 "derivativeV2_EU" (유럽 데이터센터)
  language: "ko",             // RFC 4646 표준 (기본값: 브라우저 언어)
  getAccessToken: (onSuccess) => {
    // 토큰과 만료 시간(초)을 콜백으로 전달
    onSuccess(token, expireTimeInSeconds);
  },
  corsWorker: true            // 다른 도메인에서 Viewer 로드 시
}
```

`Initializer`는 Promise 기반으로 작동하며, 모든 초기화가 완료된 후 `callback`이 호출됩니다.

## Viewer3D 생성

```javascript
const viewer = new Autodesk.Viewing.GuiViewer3D(container, config);
```

**`container`**: HTML 요소 (반드시 `<div>`여야 하며, `<canvas>`는 허용되지 않음)

**`config` 주요 옵션**:

| 옵션                 | 타입     | 설명                                                             |
| -------------------- | -------- | ---------------------------------------------------------------- |
| `startOnInitialize`  | boolean  | `false` 설정 시 `viewer.start()` 수동 호출 필요 (기본값: `true`) |
| `theme`              | string   | `'light-theme'` 또는 `'dark-theme'` (기본값: `'dark-theme'`)     |
| `extensions`         | string[] | 자동 로드할 Extension ID 배열                                    |
| `disabledExtensions` | object   | Extension 비활성화 설정 (예: `{ measure: true }`)                |
| `localStoragePrefix` | string   | 설정 저장 시 사용할 localStorage key 접두사                      |
| `profileSettings`    | object   | 기본 설정 덮어쓰기 (프로필 설정)                                 |

생성 시 자동으로 수행되는 작업:

- Canvas 요소 생성 및 DOM 추가
- `Viewer3DImpl` (렌더링 엔진) 초기화
- 테마 클래스 적용
- Preferences 객체 생성
- 고유 Viewer ID 할당 (`viewer.id`)

## start()

```javascript
viewer.start(url, options, onSuccess, onError, initOptions);
```

`start()`는 내부적으로 `initialize()` → `setUp()` 순서로 호출됩니다.

**`initialize()`에서 수행하는 작업**:

- WebGL 컨텍스트 생성 및 검증
- Renderer, Scene, Camera 초기화
- Navigation 시스템 (`viewer.navigation`) 설정
- ToolController 생성
- Context Menu 초기화
- Progress Bar, Status Bar UI 생성
- Extension 로드 (`config.extensions` 목록)
- 기본 Navigation Tool 설정 (`"orbit"`)

**`setUp()`에서 수행하는 작업**:

- Extension 초기화 완료
- Navigation 오버라이드 적용
- 기본 설정값 적용

**파라미터**:

- `url` (선택): 모델 URN 또는 파일 경로 (전달 시 `loadModel()` 자동 호출)
- `options` (선택): `loadModel()`에 전달할 옵션
- `initOptions` (선택): `initialize()`에 전달할 옵션

`start()`가 호출되면 `viewer.started = true`로 설정되며, 중복 호출이 방지됩니다.

# 2. Extension 관리

## Extension 등록

커스텀 Extension을 사용하려면 먼저 등록해야 합니다:

```javascript
Autodesk.Viewing.theExtensionManager.registerExtension("MyExtension", MyExtensionClass);
```

## Extension 로드

**자동 로드** (Viewer 생성 시):

```javascript
const config = {
    extensions: ["Autodesk.Measure", "Autodesk.Section", "MyExtension"],
};
const viewer = new Autodesk.Viewing.GuiViewer3D(container, config);
```

**수동 로드** (런타임):

```javascript
await viewer.loadExtension("Autodesk.BimWalk", options);
```

**언로드**:

```javascript
viewer.unloadExtension("Autodesk.BimWalk");
```

## 기본 제공 Extensions

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

# 3. 초기 시각 설정

## Light Preset

16가지 사전 정의된 조명 환경을 제공합니다:

```javascript
viewer.setLightPreset("Plaza"); // 이름 사용 (권장)
viewer.setLightPreset(15); // 또는 인덱스
```

**주요 Preset**:

| Index | 이름                 | 특징                             |
| ----- | -------------------- | -------------------------------- |
| 0     | `"Simple Grey"`      | 비-HDR 환경, 외부 환경 맵 불필요 |
| 1     | `"Sharp Highlights"` | HDR, 1000 lux, Photo Booth 배경  |
| 2     | `"Dark Sky"`         | HDR, Dark Grey 배경              |
| 3     | `"Grey Room"`        | HDR                              |
| 4     | `"Photo Booth"`      | HDR, 밝은 배경                   |
| 5     | `"Tranquility"`      | HDR, 파란색 배경                 |
| 6     | `"Infinity Pool"`    | HDR, 흰색 배경                   |
| 15    | `"Plaza"`            | HDR, 야외 환경, 가장 많이 사용됨 |

**톤맵 방식**:

- `0`: None
- `1`: Prism Cannon-Lum (색상 보존)
- `2`: OGC Cannon RGB (색상 비보존, 기본값)

**참고**: 2D 모델에서는 Light Preset이 적용되지 않습니다. `setLightPreset`은 내부적으로 `is2d()` 체크 후 경고 로그를 출력합니다.

## 배경색

그라데이션 배경색을 설정합니다 (상단 → 하단):

```javascript
viewer.setBackgroundColor(red, green, blue, red2, green2, blue2);
// 예: viewer.setBackgroundColor(230, 230, 230, 150, 150, 150);
```

각 RGB 값은 0-255 범위입니다.

## Edge Rendering

지오메트리의 모서리 라인 표시를 제어합니다:

```javascript
viewer.setDisplayEdges(true); // 모서리 표시
viewer.setDisplayEdges(false); // 모서리 숨김
```

**작동 조건**:

- 3D 모델에만 적용 (2D 모델은 무시)
- 모델이 Edge Topology 데이터를 포함해야 함

## Ground Shadow

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

- 3D 모델에만 적용
- Shadow Map이 활성화되어야 함

## 기타 시각 설정

```javascript
// 고스팅 (투명 처리) 활성화/비활성화
viewer.setGhosting(true);

// 품질 레벨 (Ambient Shadows, Anti-aliasing)
viewer.setQualityLevel(ambientShadows, antiAliasing);

// Ground Reflection (바닥 반사)
viewer.setGroundReflection(true);

// 환경 맵을 배경으로 사용
viewer.setEnvMapBackground(true);
```

# 4. 기본 선택 설정

Viewer 생성 시 선택 동작의 기본값을 설정할 수 있습니다.

**Selection Mode** (계층 구조 선택 레벨):

```javascript
// ProfileSettings에서 기본값 설정
const config = {
    profileSettings: {
        selectionMode: Autodesk.Viewing.SelectionMode.LEAF_OBJECT, // 기본값
    },
};
```

**Selection Type** (강조 표시 방식):

```javascript
// 기본 선택 색상 설정
viewer.setSelectionColor(new THREE.Color(0xff6600), Autodesk.Viewing.SelectionType.MIXED);
```

# 5. 설정 저장 (Preferences)

Viewer는 사용자 설정을 localStorage에 자동 저장합니다.

**저장되는 항목 예시**:

- Light Preset
- Edge Rendering 상태
- Ground Shadow 상태
- Selection Mode
- Display Units

**Preference 변경 리스너**:

```javascript
viewer.prefs.addListeners("lightPreset", (value) => {
    console.log("Light preset changed to:", value);
});
```

**수동 설정**:

```javascript
viewer.prefs.set("lightPreset", 15); // Plaza
viewer.prefs.get("lightPreset"); // 현재 값
```

설정은 `localStoragePrefix` (기본값: `'Autodesk.Viewing.Private.GuiViewer3D.SavedSettings.'`) 접두사로 저장됩니다.

# 6. 초기화 완료 이벤트

```javascript
viewer.addEventListener(Autodesk.Viewing.VIEWER_INITIALIZED, () => {
    console.log("Viewer initialized, ID:", viewer.id);
});

viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, () => {
    console.log("Model geometry loaded");
});
```

`VIEWER_INITIALIZED`는 `initialize()` 완료 후, `GEOMETRY_LOADED_EVENT`는 모델의 지오메트리 로드 완료 후 발생합니다.
