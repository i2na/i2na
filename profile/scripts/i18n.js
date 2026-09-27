export const locales = {
  ko: {
    role: "디지털 트윈 소프트웨어 개발자",
    tagline: "물리 공간 → 공간 데이터 → 실시간 3D 인터페이스",
    intro:
      "건축, 건물 자동제어, HVAC처럼 서로 다른 말을 쓰는 분야를 AI와 함께 하나의 스마트 빌딩 디지털 트윈으로 엮습니다. 낯선 도메인도 빠르게 익혀 구조를 세우고, 그 위에서 더 큰 책임을 맡고 싶습니다. AI가 분야의 경계를 지우는 시대에, 한 분야만으로는 닿을 수 없던 가치를 만드는 리더가 되겠습니다.",
    location: "서울 광화문",
    "education.degree": "전자전기컴퓨터공학부 학사",
    "quipu.role": "서울시립대 컴퓨터 중앙 동아리 회장",
    "seoulution.what": "서울시립대 창업 해커톤",
    "seoulution.role": "주최 · 기획 · 운영",
    "asbg.what": "서울시립대 AWS Student Builder Group",
    "asbg.role": "코어팀 기술 리더",
    "ui.language": "언어",
    "ui.timeline": "타임라인",
    "ui.copyEmail": "이메일 복사",
    "ui.copied": "이메일을 클립보드에 복사했어요.",
    "ui.copyFailed": "복사에 실패했어요. 이메일: {email}",
  },
  en: {
    role: "Digital Twin Software Developer",
    tagline: "physical space → spatial data → real-time 3D interface",
    intro:
      "With AI, I weave fields that speak different languages, like architecture, building automation and HVAC, into one smart-building digital twin. I pick up unfamiliar domains fast and give them structure, and I want the bigger responsibility that comes with it. As AI erases the lines between fields, I intend to be a leader who creates the value no single field could reach alone.",
    location: "Gwanghwamun, Seoul",
    "education.degree": "Electrical & Computer Engineering, B.S.",
    "quipu.role": "President of the University of Seoul's central computer club",
    "seoulution.what": "University of Seoul startup hackathon",
    "seoulution.role": "Host and organizer",
    "asbg.what": "AWS Student Builder Group at UOS",
    "asbg.role": "Tech lead on the core team",
    "ui.language": "Language",
    "ui.timeline": "Timeline",
    "ui.copyEmail": "Copy email",
    "ui.copied": "Email copied to clipboard.",
    "ui.copyFailed": "Copy failed. Email: {email}",
  },
  ja: {
    role: "デジタルツイン ソフトウェア開発者",
    tagline: "物理空間 → 空間データ → リアルタイム3Dインターフェース",
    intro:
      "建築、ビルオートメーション、空調(HVAC)のように異なる言葉を話す分野を、AIとともに一つのスマートビルのデジタルツインへ織り込んでいます。なじみのない領域もすばやく学んで構造を与え、その先にあるより大きな責任を担いたいと思っています。AIが分野の境界を消していく時代に、どの一分野だけでは届かない価値を生み出すリーダーになります。",
    location: "ソウル・光化門",
    "education.degree": "電気電子・コンピュータ工学 学士",
    "quipu.role": "ソウル市立大学の全学コンピュータサークル会長",
    "seoulution.what": "ソウル市立大学 スタートアップ・ハッカソン",
    "seoulution.role": "主催・企画・運営",
    "asbg.what": "ソウル市立大学 AWS Student Builder Group",
    "asbg.role": "コアチーム 技術リーダー",
    "ui.language": "言語",
    "ui.timeline": "タイムライン",
    "ui.copyEmail": "メールアドレスをコピー",
    "ui.copied": "メールアドレスをコピーしました。",
    "ui.copyFailed": "コピーできませんでした。メールアドレス：{email}",
  },
  zh: {
    role: "数字孪生软件开发工程师",
    tagline: "物理空间 → 空间数据 → 实时 3D 界面",
    intro:
      "我借助 AI，把建筑、楼宇自控、暖通空调（HVAC）这些说着不同语言的领域，编织进同一个智慧楼宇数字孪生。陌生的领域我学得快、理得清，也想借此承担更大的责任。在 AI 抹去领域边界的时代，我要成为一名领导者，创造出任何单一领域都无法独自触及的价值。",
    location: "首尔光化门",
    "education.degree": "电气与计算机工程，理学学士",
    "quipu.role": "首尔市立大学校级计算机社团社长",
    "seoulution.what": "首尔市立大学创业黑客松",
    "seoulution.role": "主办 · 策划 · 运营",
    "asbg.what": "首尔市立大学 AWS Student Builder Group",
    "asbg.role": "核心团队技术负责人",
    "ui.language": "语言",
    "ui.timeline": "时间线",
    "ui.copyEmail": "复制邮箱",
    "ui.copied": "邮箱已复制到剪贴板",
    "ui.copyFailed": "复制失败，邮箱：{email}",
  },
};

export const codes = Object.keys(locales);
const fallback = "ko";

export function resolveLocale(...candidates) {
  return candidates.find((code) => codes.includes(code)) ?? fallback;
}

export function t(locale, key, params = {}) {
  const text = locales[locale]?.[key] ?? locales[fallback][key] ?? key;
  return text.replace(/\{(\w+)\}/g, (_, name) => params[name] ?? "");
}
