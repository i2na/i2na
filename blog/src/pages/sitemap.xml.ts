import type { APIRoute } from "astro";
import { defaultLocale, langTag, localePath, locales, type Locale } from "../lib/i18n";
import { getPosts, getTags, tagSlug } from "../lib/posts";
import { site } from "../lib/site";

function urls(segments: string[], langs: readonly Locale[], lastmod?: Date) {
  const href = (lang: Locale) => new URL(localePath(lang, ...segments), site.url).href;
  const links = [
    ...langs.map((lang) => `<xhtml:link rel="alternate" hreflang="${langTag[lang]}" href="${href(lang)}"/>`),
    `<xhtml:link rel="alternate" hreflang="x-default" href="${href(defaultLocale)}"/>`,
  ].join("");
  return langs.map((lang) => `<url><loc>${href(lang)}</loc>${lastmod ? `<lastmod>${lastmod.toISOString()}</lastmod>` : ""}${links}</url>`);
}

export const GET: APIRoute = async () => {
  const posts = await getPosts();
  const entries = [
    ...urls([], locales),
    ...getTags(posts).flatMap((tag) => urls(["tags", tagSlug(tag)], locales)),
    ...posts.flatMap((post) => urls([post.slug], locales.filter((lang) => post.entries[lang]), post.date)),
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join("\n")}
</urlset>
`;
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
