import fs from "node:fs";
import type { ImageMetadata } from "astro";
import { getImage } from "astro:assets";
import { getCollection, type CollectionEntry } from "astro:content";
import { defaultLocale, isLocale, type Locale } from "./i18n";

type Entry = CollectionEntry<"posts">;

export type Post = {
  slug: string;
  date: Date;
  tags: string[];
  draft: boolean;
  entries: Partial<Record<Locale, Entry>>;
};

export type PostView = {
  slug: string;
  lang: Locale;
  contentLang: Locale;
  fallback: boolean;
  entry: Entry;
  title: string;
  description: string;
  date: Date;
  tags: string[];
  thumbnail?: ImageMetadata;
};

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const thumbnails = import.meta.glob<ImageMetadata>("/posts/*/img/thumbnail*.{png,jpg,jpeg,webp}", { eager: true, import: "default" });

function fail(file: string, message: string): never {
  throw new Error(`[posts] ${file}: ${message}`);
}

function writtenDate(file: string) {
  const frontmatter = fs.readFileSync(file, "utf8").split(/^---\s*$/m)[1] ?? "";
  return /^date:\s*["']?([^"'\n]*?)["']?\s*$/m.exec(frontmatter)?.[1] ?? "";
}

function thumbnailOf(slug: string, lang: Locale) {
  const find = (suffix: string) =>
    Object.entries(thumbnails).find(([file]) => file.replace(/\.(png|jpe?g|webp)$/, "") === `/posts/${slug}/img/thumbnail${suffix}`)?.[1];
  return (lang !== defaultLocale && find(`.${lang}`)) || find("");
}

export function hasThumbnail(slug: string) {
  return Boolean(thumbnailOf(slug, defaultLocale));
}

export function tagSlug(tag: string) {
  return tag.toLowerCase().replace(/\+/g, "p").replace(/#/g, "sharp").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function getPosts(): Promise<Post[]> {
  const grouped = new Map<string, Partial<Record<Locale, Entry>>>();
  for (const entry of await getCollection("posts")) {
    const [slug, file] = entry.id.split("/");
    const lang = file.split(".")[1] ?? defaultLocale;
    if (!SLUG.test(slug)) fail(entry.filePath ?? slug, "folder names use lowercase letters, digits and hyphens");
    if (!isLocale(lang)) fail(entry.filePath ?? slug, `unknown language "${lang}"`);
    if (!entry.rendered) fail(entry.filePath ?? slug, "could not be rendered, see the error above");
    grouped.set(slug, { ...grouped.get(slug), [lang]: entry });
  }

  const spellings = new Map<string, string>();
  const posts = [...grouped].map(([slug, entries]): Post => {
    const main = entries[defaultLocale];
    if (!main) fail(`posts/${slug}`, "index.md (Korean) is required");
    for (const entry of Object.values(entries)) {
      const { date, tags, draft } = entry.data;
      if (entry !== main && (date || tags || draft !== undefined)) fail(entry.filePath ?? slug, "date, tags and draft belong in index.md");
    }
    const file = main.filePath ?? `posts/${slug}/index.md`;
    const { date, tags, draft = false } = main.data;
    if (!date) fail(file, "date is required");
    const written = writtenDate(file);
    if (Number.isNaN(date.getTime()) || !written.startsWith(formatDate(date).replaceAll(".", "-"))) fail(file, `date "${written}" does not exist`);
    if (!tags) fail(file, "tags are required (1–3)");
    for (const tag of tags) {
      const known = spellings.get(tagSlug(tag));
      if (known && known !== tag) fail(file, `tag "${tag}" conflicts with "${known}"`);
      spellings.set(tagSlug(tag), tag);
    }
    return { slug, date, tags, draft, entries };
  });

  return posts.filter((post) => import.meta.env.DEV || !post.draft).sort((a, b) => b.date.getTime() - a.date.getTime());
}

export function viewOf(post: Post, lang: Locale): PostView {
  const contentLang = post.entries[lang] ? lang : defaultLocale;
  const entry = post.entries[contentLang]!;
  return {
    slug: post.slug,
    lang,
    contentLang,
    fallback: contentLang !== lang,
    entry,
    title: entry.data.title,
    description: entry.data.description,
    date: post.date,
    tags: post.tags,
    thumbnail: thumbnailOf(post.slug, contentLang),
  };
}

export function getTags(posts: Post[]) {
  const counts = new Map<string, number>();
  for (const tag of posts.flatMap((post) => post.tags)) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([tag]) => tag);
}

export function relatedOf(post: Post, posts: Post[], limit = 3) {
  return posts
    .filter((other) => other.slug !== post.slug)
    .map((other) => ({ other, shared: other.tags.filter((tag) => post.tags.includes(tag)).length }))
    .filter(({ shared }) => shared > 0)
    .sort((a, b) => b.shared - a.shared || b.other.date.getTime() - a.other.date.getTime())
    .slice(0, limit)
    .map(({ other }) => other);
}

export function neighborsOf(post: Post, posts: Post[]) {
  const index = posts.findIndex((other) => other.slug === post.slug);
  return { newer: posts[index - 1], older: posts[index + 1] };
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" })
    .format(date)
    .replaceAll("-", ".");
}

export async function ogImageOf(view: PostView) {
  if (!view.thumbnail) return `/og/${view.slug}.png`;
  const image = await getImage({ src: view.thumbnail, width: 1200, height: 630, fit: "cover", format: "png" });
  return image.src;
}
