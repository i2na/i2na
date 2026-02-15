# YENA 명함 웹 기획서 (Three.js + WebGPU)

이 문서는 한 페이지 명함 웹의 최종 구현 기준이다.  
목표는 "정보는 즉시 파악되고, 비주얼은 프리미엄 카드 앱 수준 이상"이다.

---

## 1. 들어갈 내용

### 1-1. 고정 텍스트 데이터

- 이름: `YENA`
- 소개:
    - `I build digital twins that turn real-world complexity into clear 3D experiences.`
    - `At Mossland, I create software that helps teams decide faster and operate smarter.`

### 1-2. 이력 정보

- `University of Seoul (2020-2025)` - B.S. in Electrical and Computer Engineering  
  `https://uos.ac.kr`
- `QUIPU, University of Seoul Computer Club (2022-2025)` - Former President and Frontend Developer  
  `https://quipu.uos.ac.kr`
- `Mossland (2025-Present)` - Software Engineer, Digital Twin Group  
  `https://moss.land`

### 1-3. 링크 정보

- GitHub (URL 입력) - https://github.com/i2na
- Mail (URL 또는 `mailto:` 입력) - yena@moss.land
- Instagram (URL 입력) - https://www.instagram.com/2ye._na

### 1-4. 기술 스택 노출 정책

- 공간이 좁으면 기술 스택은 과감히 생략하거나 핵심만 노출한다.
- 우선순위: `Three.js`, `WebGPU`, `React`, `Next.js`, `TypeScript`.
- 기술 스택은 정보 전달 요소가 아니라 "전문성 힌트"로만 사용한다.

---

## 2. 명함 웹 컨셉

### 2-1. 컨셉 이름

- **Holographic Single Card Dashboard**

### 2-2. 핵심 원칙

- 첫 화면에서 모든 핵심 정보를 동시에 보여준다.
- 정보는 숨기지 않는다. 인터랙션은 "재질 반응"만 담당한다.
- 카드가 덩그러니 떠 보이지 않도록 앱형 레이아웃 문맥을 제공한다.

### 2-3. 화면 구조

- 상단: 미니 헤더 (`YENA / Identity Card`)
- 중앙: 대형 가로 카드 1장 (신용카드 비율 1.586:1)
- 하단: 도킹 액션 바 (`GitHub`, `Mail`, `Instagram`)

### 2-4. 카드 내부 레이아웃 (동시 파악형)

- 좌상단: 짧은 소개
- 우상단: 학력 1줄 요약
- 좌하단: 현재 회사/포지션
- 우하단: 링크 3종
- 하단 띠: 기술 스택 아이콘(공간 부족 시 삭제 가능)

### 2-5. 비주얼 톤

- 레퍼런스 무드: 프리미엄 뱅킹 앱 카드
- 컬러: 거의 무채색 + 포인트 네온 민트/블루그린 1색
- 재질: 유광 카드 + 유리막 + 홀로그램 반사 + 미세 그레인
- 타이포: 굵은 타이틀 1개, 나머지는 얇고 간결하게

### 2-6. 금지 규칙

- 순차 등장 애니메이션 금지 (정보 지연 노출 금지)
- 과한 파티클/게임 느낌 이펙트 금지
- 복잡한 다중 섹션 스크롤 구조 금지

---

## 3. 구현 방법

### 3-1. 기술 스택

- `Yarn`
- 프레임워크: `Vite` + `React` + `TypeScript`
- 3D/렌더링: `Three.js` + WebGPU 우선 렌더러
- 스타일: `SCSS`
- 모션: `react-spring` 또는 커스텀 damping 로직

### 3-2. 렌더링 전략 (WebGPU 우선)

- 기본: WebGPU 경로 사용 (`WebGPURenderer` 가능 환경)
- 폴백: WebGL 경로 자동 전환 (`WebGLRenderer`)
- 목표: 기기별 지원 차이는 흡수하고, 시각 톤은 최대한 동일하게 유지

### 3-3. 카드 셰이더 레이어 설계

- `base`: 카드 기본 색과 라운드 형태
- `grain`: 미세 필름 노이즈
- `holo`: 시점에 따라 이동하는 컬러 밴드
- `specular`: 강한 하이라이트 반사
- `fresnel`: 가장자리 발광 느낌
- `content`: 텍스트/아이콘 UI 오버레이

### 3-4. 인터랙션 요구사항 (핵심)

- 모바일:
    - `DeviceOrientation` 기반으로 카드가 미세 회전
    - 최대 회전값은 `x/y ±6deg` 이내
    - 입력값은 low-pass filter로 흔들림 제거
- PC:
    - 마우스 위치를 정규화해서 카드 회전
    - 화면 중앙 기준으로 `x/y ±5deg` 이내
    - 카드 회전 + 스펙큘러 하이라이트 방향 동기화

### 3-5. 레이아웃/반응형 규칙

- 카드 비율은 항상 고정 (`1.586:1`)
- 모바일에서도 가로 카드 유지, 필요 시 카드 폭만 조절
- 작은 화면에서는 스택 아이콘 줄 삭제 가능
- 모든 텍스트는 카드 안에서 줄바꿈이 아닌 축약 규칙 우선

### 3-6. 애니메이션 규칙

- 초기 진입: 카드가 0.4초 내 부드럽게 안착
- 인터랙션 응답: 120~220ms 이내, 과한 탄성 금지
- 정보 텍스트는 고정, 움직이는 것은 빛/그림자/재질만 허용

### 3-7. 성능/품질 체크

- 목표 프레임: 모바일 50fps+, PC 60fps
- postprocessing 최소화, 셰이더 연산은 단계적으로 추가
- 저사양 모드에서 `grain/holo` 강도 자동 감쇠

### 3-8. 구현 단계 (실행 순서)

1. 카드 정적 레이아웃 완성 (정보 동시 노출)
2. Three.js 씬과 카드 메시 구성
3. WebGPU 렌더 경로 + WebGL 폴백 연결
4. 모바일 기울기/PC 마우스 회전 인터랙션 연결
5. 홀로그램/스펙큘러 셰이더 고도화
6. 반응형/성능 튜닝 및 미세 타이포 정리

### 3-9. 최종 경험 기준

- 3초 내에 방문자가 누구인지, 어디서 무엇을 하는지 바로 이해한다.
- 동시에 "이건 그냥 포트폴리오가 아니라 고급 인터랙티브 명함"이라고 느낀다.
