import type { APIRoute, GetStaticPaths } from "astro";
import { composeCover, defaultGlyph, renderPng } from "../../lib/cover";
import { getPosts, hasThumbnail } from "../../lib/posts";

export const getStaticPaths = (async () =>
  (await getPosts())
    .filter((post) => !hasThumbnail(post.slug))
    .map((post) => ({ params: { slug: post.slug }, props: { tags: post.tags } }))) satisfies GetStaticPaths;

export const GET: APIRoute<{ tags: string[] }> = ({ params, props }) =>
  new Response(renderPng(composeCover({ keywords: props.tags, glyph: defaultGlyph(params.slug!) })), {
    headers: { "Content-Type": "image/png" },
  });
