import rss from "@astrojs/rss";
import type { APIRoute, GetStaticPaths } from "astro";
import { langTag, localePath, locales, t, type Locale } from "../../lib/i18n";
import { getPosts, viewOf } from "../../lib/posts";
import { site } from "../../lib/site";

export const getStaticPaths = (() => locales.map((lang) => ({ params: { lang } }))) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ params }) => {
  const lang = params.lang as Locale;
  const posts = (await getPosts()).map((post) => viewOf(post, lang));
  return rss({
    title: site.name,
    description: t(lang, "description"),
    site: new URL(localePath(lang), site.url).href,
    trailingSlash: false,
    customData: `<language>${langTag[lang]}</language>`,
    items: posts.map((view) => ({
      title: view.title,
      description: view.description,
      pubDate: view.date,
      link: localePath(lang, view.slug),
      categories: view.tags,
    })),
  });
};
