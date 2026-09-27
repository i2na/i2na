import type { APIRoute } from "astro";
import { composeCover, defaultGlyph, renderPng } from "../lib/cover";

export const GET: APIRoute = () =>
  new Response(renderPng(composeCover({ keywords: ["Digital Twin", "& Front-end", "Notes"], glyph: defaultGlyph("yena-blog") })), {
    headers: { "Content-Type": "image/png" },
  });
