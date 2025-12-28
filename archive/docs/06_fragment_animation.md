<sub>2025.12.28 19:24</sub>

# Fragment 조작 및 애니메이션

Fragment는 화면에 그려지는 최소 단위로, 각 Fragment는 위치, 회전, 크기를 나타내는 변환 행렬을 배열 형태로 저장합니다. `fragmentList.transforms`로 직접 수정하거나 `setTransform()`으로 변환 행렬을 적용하며, 변경 후 `viewer.impl.invalidate()`를 호출해야 화면이 갱신됩니다. `requestAnimationFrame`과 TWEEN.js를 사용하여 부드러운 움직임을 만들고, Easing 함수로 가속과 감속 효과를 추가합니다. `getWorldBounds()`는 Fragment의 경계 박스를, `getCenter()`는 중심 좌표를 반환합니다. Worker는 ID 변환, 속성 조회, 계층 구조 계산을 백그라운드에서 처리하고, EventDispatcher는 이벤트 리스너를 등록하고 커스텀 이벤트를 발생시킵니다.

## Fragment Transform 시스템

Fragment는 렌더링의 최소 단위이며, 각 Fragment는 Transform 매트릭스를 통해 3D 공간에서의 위치, 회전, 스케일을 관리합니다.

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

## Transform 읽기

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

브라우저의 렌더링 주기(일반적으로 60fps)에 맞춰 애니메이션을 실행합니다.

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

### TWEEN.js를 활용한 애니메이션

Easing 함수를 사용하여 더 자연스러운 애니메이션을 구현합니다.

**설치**:

```bash
npm install @tweenjs/tween.js
```

**기본 사용**:

```javascript
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

## 여러 Fragment 동시 애니메이션

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

### Centerline

일부 요소(파이프, 덕트 등)는 중심선 정보를 포함합니다.

```javascript
// Property 조회로 Centerline 데이터 확인
const props = await model.getPropertiesDt([dbId]);
const centerline = props.element.properties.find((p) => p.attributeName === "Centerline");

if (centerline) {
    const centerlineData = centerline.displayValue; // 좌표 배열
    console.log("Centerline points:", centerlineData);
}
```

**Centerline 데이터 형식**:

```javascript
// 예시: [x1, y1, z1, x2, y2, z2, x3, y3, z3, ...]
[100, 200, 0, 150, 200, 0, 200, 200, 0];
```

각 3개의 값이 하나의 3D 점을 나타냅니다.

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

## Worker 시스템

Tandem SDK는 백그라운드 Worker를 사용하여 무거운 연산을 메인 스레드에서 분리합니다.

### Worker 풀

DtApp은 Worker 풀을 자동으로 생성합니다.

```javascript
// Worker 수: 모바일 2개, 데스크톱 4개
const workerCount = app.getWorkerCount();

// 특정 Worker 가져오기 (라운드로빈)
const worker = app.getWorker(seqNo); // seqNo % workerCount
```

### Worker가 처리하는 작업

1. **ID 변환**:

    - `getDbIdsFromElementIds`
    - `getElementIdsFromDbIds`

2. **속성 쿼리**:

    - `getPropertiesDt`
    - `query`
    - `search`

3. **Instance Tree 계산**:

    - 계층 구조 빌드
    - Fragment 매핑

4. **Facet 생성**:
    - Level, Room, Category 등의 Facet 트리 계산

### Worker 메시지 구조

Worker와 메인 스레드는 메시지 기반으로 통신합니다.

```javascript
// 메인 → Worker
{
  type: "getDbIdsFromElementIds",
  cbId: 123,  // 콜백 ID
  data: {
    elementIds: ["AAAAAA...", "BBBBBB..."],
    modelUrn: "urn:adsk.dtm:...",
  }
}

// Worker → 메인
{
  cbId: 123,
  result: [10, 20, 30],  // dbIds
}
```

### 콜백 ID

각 Worker 호출은 고유한 콜백 ID를 할당받습니다.

```javascript
app.loadContext.cbId = -1; // 초기값

// 각 호출마다 자동 증가
app.loadContext.cbId--; // -2, -3, -4, ...
```

음수를 사용하여 메인 스레드 ID와 충돌을 방지합니다.

## EventDispatcher

Tandem SDK의 모든 주요 객체는 EventDispatcher를 상속합니다.

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

// ✅ 제거 됨 (같은 참조)
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

## 실용 패턴

### 패턴 1: DbId로부터 모든 Fragment 이동

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

### 패턴 2: 요소 회전

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

### 패턴 3: 원점으로 초기화

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

### 패턴 4: 애니메이션 관리 클래스

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

| 기능               | API                                  | 용도                    |
| ------------------ | ------------------------------------ | ----------------------- |
| **Transform 읽기** | `fragmentList.transforms`            | Float32Array 직접 접근  |
| **Transform 쓰기** | `fragmentList.setTransform()`        | Matrix4로 변환 적용     |
| **위치 추출**      | `Vector3.setFromMatrixPosition()`    | Matrix4에서 위치 가져옴 |
| **애니메이션**     | `requestAnimationFrame` + `TWEEN.js` | 부드러운 보간           |
| **중심 좌표**      | `bbox.getCenter()`                   | Bounding Box 중심       |
| **Worker 통신**    | `app.getWorker()` + 메시지 전송      | 백그라운드 처리         |
| **이벤트**         | `addEventListener()`, `fireEvent()`  | 커스텀 이벤트           |

**주의사항**:

-   Transform 변경 후 반드시 `viewer.impl.invalidate()` 호출
-   애니메이션은 항상 cleanup 로직 구현
-   Worker는 비동기이므로 `await` 필수
-   이벤트 리스너는 제거할 때 같은 함수 참조 사용
