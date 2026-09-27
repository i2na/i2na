export const locales = ["ko", "en", "ja", "zh"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ko";

export const langTag: Record<Locale, string> = { ko: "ko", en: "en", ja: "ja", zh: "zh-CN" };
export const ogLocale: Record<Locale, string> = { ko: "ko_KR", en: "en_US", ja: "ja_JP", zh: "zh_CN" };

export function isLocale(value: unknown): value is Locale {
  return locales.includes(value as Locale);
}

export function localePath(lang: Locale, ...segments: string[]) {
  return ["", lang, ...segments].join("/");
}

export function localePaths(...segments: string[]) {
  return Object.fromEntries(locales.map((code) => [code, localePath(code, ...segments)])) as Record<Locale, string>;
}

const ui = {
  ko: {
    description: "YENA의 기술 블로그. 디지털 트윈과 프론트엔드를 공부하며 정리한 기록입니다.",
    role: "디지털 트윈 소프트웨어 개발자",
    profile: "프로필",
    all: "전체",
    emptyTitle: "글을 준비하고 있어요.",
    emptyLead: "조금만 기다려 주세요.",
    tags: "태그",
    language: "언어",
    skip: "본문 바로가기",
    back: "글 목록",
    share: "공유",
    linkCopied: "링크를 클립보드에 복사했어요.",
    linkFailed: "복사에 실패했어요. 주소창의 링크를 이용해 주세요.",
    copyEmail: "이메일 복사",
    emailCopied: "이메일을 클립보드에 복사했어요.",
    emailFailed: "복사에 실패했어요. 이메일: {email}",
    contents: "목차",
    related: "같은 태그의 글",
    prev: "이전 글",
    next: "다음 글",
    pager: "이전 글과 다음 글",
    koreanOnly: "이 글은 아직 한국어로만 쓰여 있어요.",
    notFound: "페이지를 찾을 수 없어요",
    notFoundLead: "주소가 바뀌었거나 없는 글이에요.",
    home: "블로그 홈으로",
  },
  en: {
    description: "YENA's tech blog. Notes from studying digital twins and front-end development.",
    role: "Digital Twin Software Developer",
    profile: "Profile",
    all: "All",
    emptyTitle: "New posts are on the way.",
    emptyLead: "Please check back soon.",
    tags: "Tags",
    language: "Language",
    skip: "Skip to content",
    back: "All posts",
    share: "Share",
    linkCopied: "Link copied to clipboard.",
    linkFailed: "Copy failed. Please use the link in the address bar.",
    copyEmail: "Copy email",
    emailCopied: "Email copied to clipboard.",
    emailFailed: "Copy failed. Email: {email}",
    contents: "Contents",
    related: "Related posts",
    prev: "Previous",
    next: "Next",
    pager: "Previous and next posts",
    koreanOnly: "This post is only available in Korean for now.",
    notFound: "Page not found",
    notFoundLead: "The link may have changed, or the post doesn't exist.",
    home: "Back to the blog",
  },
  ja: {
    description: "YENAの技術ブログ。デジタルツインとフロントエンドを学びながら整理した記録です。",
    role: "デジタルツイン ソフトウェア開発者",
    profile: "プロフィール",
    all: "すべて",
    emptyTitle: "記事を準備しています。",
    emptyLead: "もう少しお待ちください。",
    tags: "タグ",
    language: "言語",
    skip: "本文へスキップ",
    back: "記事一覧",
    share: "共有",
    linkCopied: "リンクをコピーしました。",
    linkFailed: "コピーできませんでした。アドレスバーのリンクをご利用ください。",
    copyEmail: "メールアドレスをコピー",
    emailCopied: "メールアドレスをコピーしました。",
    emailFailed: "コピーできませんでした。メールアドレス：{email}",
    contents: "目次",
    related: "同じタグの記事",
    prev: "前の記事",
    next: "次の記事",
    pager: "前後の記事",
    koreanOnly: "この記事は現在、韓国語でのみ公開しています。",
    notFound: "ページが見つかりません",
    notFoundLead: "アドレスが変わったか、存在しない記事です。",
    home: "ブログのトップへ",
  },
  zh: {
    description: "YENA 的技术博客，整理学习数字孪生与前端开发的笔记。",
    role: "数字孪生软件开发工程师",
    profile: "个人主页",
    all: "全部",
    emptyTitle: "文章正在准备中。",
    emptyLead: "请稍作等待。",
    tags: "标签",
    language: "语言",
    skip: "跳到正文",
    back: "文章列表",
    share: "分享",
    linkCopied: "链接已复制到剪贴板",
    linkFailed: "复制失败，请使用地址栏中的链接",
    copyEmail: "复制邮箱",
    emailCopied: "邮箱已复制到剪贴板",
    emailFailed: "复制失败，邮箱：{email}",
    contents: "目录",
    related: "相同标签的文章",
    prev: "上一篇",
    next: "下一篇",
    pager: "上一篇和下一篇",
    koreanOnly: "本文目前只有韩语版本。",
    notFound: "找不到页面",
    notFoundLead: "链接可能已更改，或文章不存在。",
    home: "返回博客首页",
  },
} satisfies Record<Locale, Record<string, string>>;

export type UiKey = keyof (typeof ui)["ko"];

export function t(lang: Locale, key: UiKey, params: Record<string, string> = {}) {
  return ui[lang][key].replace(/\{(\w+)\}/g, (_, name) => params[name] ?? "");
}

export const markdownLabels: Record<Locale, { footnotes: string; backref: string; callouts: Record<string, string> }> = {
  ko: { footnotes: "각주", backref: "본문으로 돌아가기", callouts: { note: "참고", tip: "팁", important: "중요", warning: "주의", caution: "경고" } },
  en: { footnotes: "Footnotes", backref: "Back to content", callouts: { note: "Note", tip: "Tip", important: "Important", warning: "Warning", caution: "Caution" } },
  ja: { footnotes: "脚注", backref: "本文に戻る", callouts: { note: "メモ", tip: "ヒント", important: "重要", warning: "注意", caution: "警告" } },
  zh: { footnotes: "脚注", backref: "返回正文", callouts: { note: "说明", tip: "提示", important: "重要", warning: "注意", caution: "警告" } },
};
