# YENA 명함 웹 코드 설계서

`business-card/plan.md`를 구현하기 위한 실전 설계 문서다.  
핵심은 구조를 단순하게 유지하고, 남는 리소스를 디자인 품질과 렌더링 최적화에 집중하는 것이다.

---

## 1. 구현 목표

- 첫 화면에서 핵심 정보를 즉시 읽을 수 있어야 한다.
- WebGPU 우선 렌더링, 미지원 환경은 WebGL로 자동 폴백한다.
- 모바일은 기울기, PC는 마우스 입력으로 카드가 미세 회전한다.
- 기능 확장보다 안정적인 프레임과 재질 품질을 우선한다.

---

## 2. 제외 범위

- 다중 페이지/라우팅
- 백오피스, CMS, API 연동
- 복잡한 상태관리 라이브러리
- 과한 포스트프로세싱 체인
- 스크롤 기반 스토리텔링 연출

---

## 3. 파일 구조

```txt
src/
  main.tsx
  App.tsx
  styles/
    global.scss
  config/
    profile.constants.ts
  card/
    CardScene.tsx
    card-renderer.ts
    card-material.ts
    card.constants.ts
    card.types.ts
    use-pointer-tilt.ts
    use-device-tilt.ts
    use-tilt-spring.ts
```

구조 원칙:

- 3D 관련 구현은 `card/` 내부에서 끝낸다.
- 표시 데이터는 `profile.constants.ts` 단일 소스로 관리한다.
- 모듈 간 공개 API를 최소화해 변경 범위를 작게 유지한다.

---

## 4. 데이터 설계

`config/profile.constants.ts`에서 단일 상수 객체를 export 한다.

- `name`
- `introLines`
- `education`
- `work`
- `links` (`github`, `mail`, `instagram`)
- `skills` (작은 화면에서 생략 가능)

원칙:

- 런타임 데이터 가공 최소화
- API 호출 없음
- UI 매핑 구조 고정

---

## 5. 컴포넌트/모듈 역할

### `App.tsx`

- 상단 헤더, 카드 영역, 하단 도킹 바를 배치한다.
- 페이지 레이아웃과 정보 렌더만 담당한다.

### `CardScene.tsx`

- 씬 생성/프레임 업데이트/리소스 해제를 담당한다.
- 카드 메시 1개, 카메라 1개, 라이트 1~2개만 사용한다.
- 텍스트와 링크는 HTML 오버레이로 유지한다.

### `card-renderer.ts`

- WebGPU 지원 여부를 감지한다.
- `WebGPURenderer` 또는 `WebGLRenderer`를 동일 인터페이스로 감싼다.

### `card-material.ts`

- 카드 전용 커스텀 머티리얼을 생성한다.
- 유니폼 갱신 로직(`uTime`, `uTilt`, `uResolution`, `uAccentColor`, `uQuality`)을 담당한다.

### `use-pointer-tilt.ts`

- 마우스 좌표를 정규화해 목표 회전값을 만든다.

### `use-device-tilt.ts`

- `DeviceOrientation` 입력을 카드 회전값으로 변환한다.

### `use-tilt-spring.ts`

- 입력값을 damping/smoothing 처리해 프레임 안정성을 높인다.

---

## 6. 타입/상수 설계

`card.types.ts`

- `TTilt` (`x`, `y`)
- `TRendererAdapter`
- `TCardUniforms`

`card.constants.ts`

- `MAX_POINTER_TILT_DEG = 5`
- `MAX_DEVICE_TILT_DEG = 6`
- `MAX_DPR = 2`
- `CARD_ASPECT_RATIO = 1.586`
- `SPRING_DAMPING`, `SPRING_STIFFNESS`

원칙:

- 매직 넘버 금지
- 타입은 명확한 접두사 규칙 유지

---

## 7. 인터랙션 흐름

1. 입력 수집:
    - PC: `use-pointer-tilt`
    - Mobile: `use-device-tilt`
2. 입력 통합:
    - 소스별 값에 clamp 적용
    - 단일 `targetTilt`로 정규화
3. 보간:
    - `use-tilt-spring`으로 `currentTilt` 생성
4. 반영:
    - 카드 회전 적용
    - 동일 값을 셰이더 유니폼 `uTilt`에 전달

제약:

- 텍스트 레이어는 고정
- 움직임은 카드 물성(반사/하이라이트/깊이) 중심

---

## 8. 렌더링/셰이더 전략

카드 머티리얼은 단일 파이프라인으로 유지한다.

- Base: 카드 바탕색과 기본 명암
- Grain: 미세 필름 노이즈
- Holo: 시점 기반 컬러 밴드
- Specular: 하이라이트 반사
- Fresnel: 가장자리 광택

품질 단계:

- `uQuality = 2`: 기본 품질
- `uQuality = 1`: 저사양 모바일
- `uQuality = 0`: 성능 우선 모드

---

## 9. 성능 최적화 기준

- DPR 상한: `Math.min(devicePixelRatio, MAX_DPR)`
- 백그라운드 탭에서 rAF 업데이트 중지
- 뷰포트 변경 시만 리사이즈 처리
- 포스트프로세싱 기본 비활성
- 저사양 모드에서 `grain/holo` 강도 감소

목표:

- PC: 60fps
- Mobile: 50fps 이상

---

## 10. 스타일 가이드

`styles/global.scss` 토큰 최소 집합:

- `--bg-0`, `--bg-1`
- `--text-primary`, `--text-secondary`
- `--accent`
- `--card-radius`
- `--safe-padding`

원칙:

- 색상 토큰 수를 제한한다.
- 레이아웃은 Grid 1개와 Flex 보조로 끝낸다.
- 애니메이션은 transform/opacity 중심으로 유지한다.

---

## 11. 구현 순서

1. `App.tsx` 정적 레이아웃 완성
2. `CardScene.tsx` 기본 카드 렌더 연결
3. `card-renderer.ts` WebGPU/WebGL 전환 적용
4. 포인터/디바이스 입력 훅 연결
5. `card-material.ts` 셰이더 품질 단계 적용
6. 반응형/프레임 튜닝

---

## 12. 완료 기준

- 정보가 첫 화면에서 즉시 읽힌다.
- 카드 회전이 입력에 자연스럽게 반응한다.
- WebGPU 미지원 환경에서도 시각적 이질감이 크지 않다.
- 코드 경계가 단순해 비주얼 고도화 작업에 집중할 수 있다.

# YENA 명함 웹 코드 설계서

`business-card/plan.md`를 구현하기 위한 최소 구조 설계 문서다.  
목표는 기능 확장이 아니라 **고품질 비주얼 + 안정적인 렌더링 성능**이다.

---

## 1) 설계 목표

- 정보는 첫 화면에서 즉시 파악 가능해야 한다.
- 코드 구조는 단순해야 한다. (파일 수, 상태 수, 추상화 수 최소화)
- WebGPU 우선, WebGL 폴백은 자동 처리한다.
- 모바일 기울기 + PC 마우스 회전을 동일 로직으로 처리한다.
- 렌더링 품질 개선에 시간을 쓰기 위해 비핵심 기능은 제거한다.

---

## 2) 비범위(의도적으로 안 함)

- 다중 페이지/라우팅
- 다국어 처리
- CMS/관리자 페이지
- 복잡한 상태관리 라이브러리
- 과한 포스트프로세싱 체인
- 스크롤 기반 스토리텔링

---

## 3) 폴더/파일 구조 (최소)

```txt
src/
  main.tsx
  App.tsx
  styles/
    global.scss
  config/
    profile.ts
  card/
    CardScene.tsx
    usePointerTilt.ts
    useDeviceTilt.ts
    useTiltSpring.ts
    shaderMaterial.ts
    renderer.ts
    constants.ts
```

구조 원칙:

- `card/` 안에서 3D 관련을 끝낸다.
- UI 데이터는 `config/profile.ts` 하드코딩 1곳에서 관리한다.
- 공통 유틸 과분리 금지. 필요 파일만 만든다.

---

## 4) 데이터 설계

`config/profile.ts`에 단일 객체로 유지한다.

- `name`
- `introLines[2]`
- `education`
- `work`
- `links` (`github`, `mail`, `instagram`)
- `skills` (옵션, 모바일에서 숨김 가능)

원칙:

- API 호출 없음
- 런타임 변환 최소화
- 렌더 시 그대로 매핑

---

## 5) 컴포넌트 설계

## `App.tsx`

- 상단 헤더, 중앙 카드 영역, 하단 도킹 링크 렌더.
- 전체 페이지 레이아웃만 담당.

## `CardScene.tsx`

- Three.js 씬 생성/업데이트/해제 담당.
- 카드 메시 1개 + 라이트 1~2개 + 카메라 1개만 사용.
- 텍스트/링크/스택은 HTML 오버레이로 배치 (가독성 우선).

## 입력 훅

- `usePointerTilt.ts`: PC 마우스 좌표를 정규화해 목표 회전값 생성.
- `useDeviceTilt.ts`: 모바일 `DeviceOrientation` 값을 회전값으로 변환.
- `useTiltSpring.ts`: 두 입력의 목표값을 단일 damping 값으로 평활화.

---

## 6) 렌더러/머티리얼 설계

## `renderer.ts`

- 초기화 시 WebGPU 지원 확인
- 지원 시 `WebGPURenderer`, 미지원 시 `WebGLRenderer`
- 외부에는 동일 인터페이스만 노출:
    - `initRenderer(canvas)`
    - `resizeRenderer(w, h, dpr)`
    - `render(scene, camera)`
    - `disposeRenderer()`

## `shaderMaterial.ts`

- 커스텀 머티리얼 1종만 운영
- 유니폼 최소 세트:
    - `uTime`
    - `uTilt` (x, y)
    - `uResolution`
    - `uAccentColor`
    - `uQuality`

레이어 표현(셰이더 내부):

- base color
- grain
- holographic band
- specular highlight
- fresnel edge

---

## 7) 인터랙션 통합 로직

입력 소스는 다르지만 최종 제어는 한 값으로 통합한다.

1. PC: 마우스 위치 -> `targetTilt`
2. Mobile: 기울기 값 -> `targetTilt`
3. `useTiltSpring`에서 `currentTilt` 생성
4. 매 프레임 카드 회전 + `uTilt` 유니폼 동기화

제한값:

- PC: `±5deg`
- Mobile: `±6deg`
- 공통 clamp 적용 후 spring 적용

---

## 8) 성능 최적화 원칙 (중요)

- DPR 상한: `Math.min(window.devicePixelRatio, 2)`
- 카드 지오메트리 세그먼트 과다 금지 (필요 최소)
- 포스트프로세싱 기본 비활성
- 탭 비활성/백그라운드 시 애니메이션 정지
- `prefers-reduced-motion`에서 회전 강도 축소
- 저사양 모드(`uQuality=0`)에서 grain/holo 강도 자동 감소

프레임 목표:

- PC 60fps
- Mobile 50fps 이상

---

## 9) 스타일 설계

`global.scss`에서 토큰 최소 세트만 관리:

- `--bg-0`, `--bg-1`
- `--text-primary`, `--text-secondary`
- `--accent`
- `--card-radius`
- `--safe-padding`

원칙:

- 색상 토큰 수를 늘리지 않는다.
- 레이아웃은 CSS Grid 1개 + Flex 보조만 사용.
- 애니메이션은 transform/opacity 중심.

---

## 10) 구현 순서 (짧고 강하게)

1. `App.tsx` 정적 레이아웃 완성
2. `CardScene.tsx`에 기본 씬/카드 1장 렌더
3. WebGPU/WebGL 자동 전환 연결
4. PC 마우스/모바일 기울기 입력 연결
5. 셰이더 퀄리티 단계적 고도화
6. 성능 측정 후 품질-프레임 균형 조정

---

## 11) 완료 기준

- 정보가 첫 화면에서 즉시 읽힌다.
- 카드가 입력에 따라 자연스럽게 미세 회전한다.
- WebGPU 미지원 환경에서도 동일 UX로 동작한다.
- 코드가 단순해서 셰이더/디자인 고도화에 집중할 수 있다.
