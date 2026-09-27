# 썸네일 프롬프트

썸네일은 모든 글이 같은 틀을 쓴다. 틀(종이 배경·격자·경로선·`YENA / BLOG`·`blog.yena.io.kr`)은 `src/lib/cover.ts`에 고정돼 있고, 글마다 바뀌는 것은 두 가지뿐이다.

- 왼쪽 키워드: 영어 1~3줄
- 오른쪽 원 안의 그림: 240×240 SVG 한 개(글리프)

AI에게 이 파일과 글 본문을 주고 아래 요청을 붙여 넣는다. 받은 SVG를 `posts/<slug>/img/thumbnail.svg`로 저장한 뒤 PNG로 만든다.

```text
blog/template/thumbnail/prompt.md 규칙대로 posts/<slug>/index.md 의 썸네일 SVG를 만들어서
posts/<slug>/img/thumbnail.svg 로 저장해 줘.
```

```bash
npm run thumbnail -- <slug>
```

`img/thumbnail.png`(1200×630)가 생기고, 블로그 카드·글 머리·링크 미리보기에 그대로 쓰인다. 글자가 들어간 언어별 썸네일이 필요하면 `thumbnail.en.svg`처럼 만들면 `thumbnail.en.png`가 함께 생긴다.

## SVG 형식

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" data-keywords="Digital Twin|Tandem">
  <!-- 도형만 -->
</svg>
```

- `viewBox="0 0 240 240"` 고정. 그림은 가운데 200×200 안에 둔다(원 테두리와 겹치지 않게).
- `data-keywords`: 글의 핵심을 영어 키워드 1~3개로, `|`로 나눈다. 한 줄은 22자 이하, 영문·숫자·기호만(번들 폰트가 라틴 문자만 지원). 태그와 같을 필요는 없다.
- 쓸 수 있는 요소: `g` `path` `circle` `ellipse` `rect` `line` `polyline` `polygon` `defs` `linearGradient` `radialGradient` `stop` `clipPath` `mask`.
- 쓰면 안 되는 것: `text` `image` `use` `style` `script` `foreignObject`, 외부 링크(`href`). 색과 굵기는 속성으로만 준다.
- 직접 만드는 `id`는 모두 `g-`로 시작한다(`g-fade`). 틀에 있는 `url(#glyph-line)`(시안→블루→핑크 그라데이션)은 가져다 써도 된다.

## 그림 규칙

- 글의 주제를 한눈에 알 수 있는 사물·구조 하나를 선 중심의 도식으로 그린다. 장면·사람·로고·글자는 그리지 않는다.
- bio와 같은 결: 얇은 선(1.5~3px), 둥근 선 끝, 여백이 넉넉한 구성. 면은 아주 옅게만 채운다.
- 색은 profile 팔레트만 쓴다: 잉크 `#071018`, 시안 `#17c8bf`, 블루 `#4969ff`, 핑크 `#ff5f9f`, 앰버 `#f3aa23`(포인트 한두 곳). 선은 `rgba(7,16,24,0.2~0.6)`나 `url(#glyph-line)`.
- 노드(작은 원)는 흰 테두리(`stroke="#fff" stroke-width="3"`)를 둘러 틀의 경로선 노드와 맞춘다.
- 한 글리프에 도형은 20개 안팎으로. 너무 촘촘하면 카드 크기(약 380px)에서 뭉개진다.

## 예시

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" data-keywords="Git|Working Tree">
  <path d="M70 60 V180" stroke="rgba(7,16,24,0.35)" stroke-width="3" stroke-linecap="round"/>
  <path d="M70 110 C70 140 170 120 170 150 V180" fill="none" stroke="url(#glyph-line)" stroke-width="3" stroke-linecap="round"/>
  <circle cx="70" cy="60" r="9" fill="#17c8bf" stroke="#fff" stroke-width="3"/>
  <circle cx="70" cy="110" r="9" fill="#4969ff" stroke="#fff" stroke-width="3"/>
  <circle cx="170" cy="150" r="9" fill="#ff5f9f" stroke="#fff" stroke-width="3"/>
  <circle cx="70" cy="180" r="9" fill="#071018" stroke="#fff" stroke-width="3"/>
</svg>
```

렌더 스크립트는 viewBox, 키워드 수·길이·문자, 금지 요소, `id` 접두사를 검사하고 어긋나면 이유를 알려 주며 멈춘다.
