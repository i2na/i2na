---
title: "Tandem SDK 핵심 구조: DtApp, DtFacility, DtModel"
createdAt: "2025-01-15 10:30"
summary: "SDK의 계층 구조를 이해하세요. DtApp(애플리케이션) → DtFacility(건물) → DtModel(모델 파일) 구조와 실시간 통신, 백그라운드 작업 처리 방법을 학습합니다."
---

SDK는 `DtApp`(애플리케이션) → `DtFacility`(건물) → `DtModel`(모델 파일) 계층 구조로 데이터를 관리합니다. `DtApp`은 애플리케이션 세션을 나타내며 사용자 인증, 실시간 통신 연결, 백그라운드 작업 처리를 초기화합니다. `DtFacility`는 하나의 건물을 나타내며 건축, 구조, 설비 등 여러 개의 `DtModel`을 포함할 수 있습니다. 각 `DtModel`은 개별 3D 형상 데이터, 요소 속성, 계층 구조 정보를 가지고 있습니다. 실시간 통신으로 다른 사용자의 변경사항을 받아오고, 무거운 연산은 백그라운드에서 처리하여 화면이 멈추지 않습니다.

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

# DtApp

애플리케이션당 하나만 생성합니다. 모든 API 호출, WebSocket 연결, Worker 관리의 진입점입니다.

## 생성

```javascript
const app = new Autodesk.Tandem.DtApp(options);
```

생성 시 자동으로 초기화되는 항목:

- 세션 ID (UUID)
- WebSocket 연결
- HTTP 헤더 (Session-Id, x-dt-sdk-version)
- Worker 풀 (모바일 2개, 데스크톱 4개)

## 주요 속성

```javascript
app.sessionId; // 세션 고유 ID
app.sdkVersion; // SDK 버전 (예: "1.0.620")
app.loadContext; // 모든 API 호출에 사용되는 설정
app.currentFacility; // displayFacility() 호출 시 설정됨
app.msgWs; // WebSocket 인스턴스
```

## 팀과 시설

```javascript
// 팀 조회
const teams = await app.getTeams();
// 반환: DtTeam[]

// 활성 팀 (소유자 > 관리자 > 첫 번째 팀 순서로 결정)
const activeTeam = await app.getActiveTeam();

// 팀의 시설 목록
const facilities = await team.getFacilities();
// 반환: DtFacility[]

// 사용자에게 직접 공유된 시설 ("Shared with me")
await app.loadUserFacilities();
const sharedFacilities = app.userFacilities;
```

## 시설 로드

```javascript
await app.displayFacility(facility, initialView, viewer, forceReload);
```

**파라미터**:

- `facility`: DtFacility 인스턴스
- `initialView`: View 객체 또는 `Set<modelUrn>` (null 가능)
- `viewer`: Viewer3D 인스턴스
- `forceReload`: 이미 로드된 경우에도 다시 로드 (기본값: false)

이 함수는 모델 로드, 뷰 복원, `app.currentFacility` 설정, 이벤트 구독을 모두 처리합니다.

## Worker

속성 쿼리, ID 변환, Instance Tree 계산 등을 백그라운드에서 처리합니다.

```javascript
const worker = app.getWorker(seqNo); // seqNo % 워커수로 라운드로빈
```

각 Worker는 `DtPropWorker` 인스턴스이며 메시지 기반으로 통신합니다.

## 이벤트 구독

```javascript
app.subscribeToEvents(target); // target: DtModel | DtFacility | DtTeam
app.unsubscribeFromEvents(target);
```

WebSocket을 통해 실시간 변경 사항을 수신하며, 타입에 따라 다른 핸들러가 호출됩니다:

- DtModel: Worker로 전달되어 Instance Tree 재계산
- DtFacility: `onFacilityChanged()` 직접 호출
- DtTeam: `onTeamChanged()` 직접 호출

# DtFacility

Twin(건물, 시설)을 나타냅니다. 하나의 Facility는 여러 모델을 포함할 수 있습니다.

**URN**: `urn:adsk.dtt:{GUID}`

## 모델 조회

```javascript
// 모든 모델 (Default 모델 포함)
const allModels = facility.getModels();

// Default 모델 제외 (Revit 등 원본 파일에서 가져온 모델만)
const sourceModels = facility.getModels(true);

// Default 모델: Tandem이 호스팅하는 특수 모델
const defaultModel = facility.getDefaultModel();

// URN으로 특정 모델 조회
const model = facility.getModelByUrn("urn:adsk.dtm:...");
```

## Default vs Primary

**Default Model**:

- Facility GUID = Model GUID (항상 하나만 존재)
- Tandem이 관리하는 모델
- 사용자가 생성한 요소, 스트림, MEP 시스템 저장
- `createGeometry()`, `createElement()` 사용 가능

**Primary Model**:

- `settings.links[].main: true`로 표시된 모델
- 시설의 주요 모델 (보통 건축 모델)
- 로딩 우선순위 가장 높음

하나의 모델이 Default이면서 동시에 Primary일 수 없습니다 (일반적으로).

## Settings

```javascript
facility.settings.links = [
    {
        modelId: "urn:adsk.dtm:...",
        label: "1층 평면도",
        main: true, // Primary 여부
        on: true, // 로드 시 기본 표시
        accessLevel: "edit", // "view", "edit", "admin"
    },
];

// 서버에서 최신 설정 다시 가져오기
await facility.reloadSettings();
```

## Managers

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

## 좌표 변환

Facility는 모든 모델을 공통 좌표계로 정렬하기 위해 `globalOffset`을 관리합니다.

```javascript
facility.globalOffset; // THREE.Vector3

// 공유(전역) 좌표계 → 로컬 좌표계
const transform = facility.getSharedToLocalSpaceTransform();

// 로컬 좌표계 → 공유(전역) 좌표계
const inverseTransform = facility.getLocalToSharedSpaceTransform();
```

원본 Revit 파일의 위치가 제각각인 경우, 이 변환을 통해 모든 모델을 정렬합니다.

# DtModel

개별 3D 모델 파일을 나타냅니다. 지오메트리, 속성, Fragment 데이터를 포함합니다.

**URN**: `urn:adsk.dtm:{GUID}`

## 타입 확인

**Default Model** (`model.isDefault()`):

- Facility의 GUID와 Model의 GUID가 동일
- Tandem이 호스팅하며 원본 파일 없음
- 사용자 생성 요소, 지오메트리, 스트림 저장
- 다음 작업만 Default 모델에서 가능:
    - `createGeometry()`, `createSketchedGeometry()`
    - `createElement()`, `deleteElement()`
    - `createStream()`
    - MEP 시스템 관리

**Primary Model** (`model.isPrimaryModel()`):

- `facility.settings.links[].main: true`
- 로딩 우선순위: Primary(0) > Visible(1) > Hidden(2)
- Ghosting 모드 활성화 시 배경으로 유지

## 속성 메서드

```javascript
model.label(); // settings.links[].label
model.fileName(); // 원본 파일명 (Default 모델은 "(Tandem hosted)")
model.isVisibleByDefault(); // settings.links[].on
model.accessLevel(); // settings.links[].accessLevel
model.getParentFacility(); // 부모 Facility 반환
```

## 데이터 조회

DtModel은 요소 데이터를 조회하는 메서드를 제공합니다:

```javascript
// 속성
await model.getProperties(dbId);
await model.getPropertiesDt(dbIds, options);

// 검색
await model.query({ families, filter });
await model.scan({ families });

// 구조
model.getLevels();
model.getInstanceTree();
model.getBoundingBox();
```

# 인증

OAuth 2.0 토큰을 사용합니다. 토큰은 만료 전에 갱신되어야 합니다.

## Viewer 초기화

```javascript
Autodesk.Viewing.Initializer(
    {
        env: "DtProduction", // 환경
        api: "dt", // Tandem API
        shouldInitializeAuth: false, // 수동 토큰 관리
        getAccessToken: (callback) => {
            // SDK가 토큰이 필요할 때 호출
            const token = "...";
            const expireInSeconds = 3600;
            callback(token, expireInSeconds);
        },
    },
    () => {
        // 초기화 완료
    }
);
```

SDK는 토큰 만료 시간을 추적하여 자동으로 `getAccessToken`을 재호출합니다.

## HTTP 헤더

모든 API 요청에 자동으로 추가되는 헤더:

```javascript
Autodesk.Viewing.endpoint.HTTP_REQUEST_HEADERS = {
    "Session-Id": "...", // DtApp 생성 시 설정
    "x-dt-sdk-version": "...", // SDK 버전
    Authorization: "Bearer ...", // 액세스 토큰
};
```

## 토큰 수동 갱신

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

# loadContext

모든 API 호출에 사용되는 설정 객체입니다. 각 계층이 부모의 context를 복사하여 확장합니다.

```javascript
// DtApp
app.loadContext = {
  sessionId: "...",
  sdkVersion: "...",
  endpoint: "https://...",
  headers: {...},
  cbId: -1, // Worker 콜백 ID
};

// DtFacility (App context 복사 + twinId 추가)
facility.loadContext = { ...app.loadContext };
facility.loadContext.twinId = "urn:adsk.dtt:...";

// DtModel (Facility context 공유)
model.loadContext = facility.loadContext;
```

이를 통해 모든 API 호출이 자동으로 세션 정보와 인증을 포함합니다.

# WebSocket

실시간 이벤트 수신을 위한 WebSocket 연결입니다.

```javascript
// 구독
app.msgWs.subscribeForChanges(urn, (change) => {
    // change: { ctype, dbIds, ... }
});

// 구독 해제
app.msgWs.unsubscribeFromChanges(urn);

// 수동 재연결
app.msgWs.reconnect(force);
```

**수신 이벤트 타입**:

- 모델 데이터 변경 (요소 추가/삭제/수정)
- 시설 설정 변경 (링크 추가/제거)
- 템플릿 적용/제거
- 문서 업로드/삭제

이벤트는 URN 단위로 구독되며, 다른 사용자의 변경 사항을 실시간으로 반영할 수 있습니다.

# API 엔드포인트

```javascript
endpoint.ENDPOINT_API_TANDEM_V1 = "dt";

// 기본 URL
baseURL: "/modeldata";
msgWS: "/msgws"; // WebSocket
fragsWS: "/fragsws"; // Fragment WebSocket
```

**주요 API 경로**:

```
GET  /groups                          팀 목록
GET  /groups/${groupId}/twins         팀의 시설 목록
GET  /twins/${twinId}                 시설 정보
POST /twins/${twinId}/import          모델 가져오기
GET  /users/@me/twins                 사용자 시설
POST /modeldata/${modelUrn}/scan      데이터 스캔
GET  /modeldata/${modelUrn}/schema    스키마 조회
```

모든 경로는 `endpoint.getEndpointAndApi()` + 경로 형태로 구성됩니다.
