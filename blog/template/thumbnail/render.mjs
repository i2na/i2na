import fs from "node:fs";
import path from "node:path";
import { COVER, composeCover, renderPng } from "../../src/lib/cover.ts";

const SOURCE = /^thumbnail(\.(en|ja|zh))?\.svg$/;
const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };

function fail(message) {
  console.error(`[thumbnail] ${message}`);
  process.exit(1);
}

function parse(svg, name) {
  const root = /^\s*<svg\b([^>]*)>([\s\S]*)<\/svg>\s*$/.exec(svg);
  if (!root) fail(`${name}: the file must be a single <svg> element`);
  const [, attributes, glyph] = root;
  const viewBox = /\bviewBox="([^"]+)"/.exec(attributes)?.[1].trim().split(/[\s,]+/).map(Number).join(" ");
  if (viewBox !== `0 0 ${COVER.glyph} ${COVER.glyph}`) fail(`${name}: viewBox must be "0 0 ${COVER.glyph} ${COVER.glyph}"`);

  const keywords = (/\bdata-keywords="([^"]*)"/.exec(attributes)?.[1] ?? "")
    .replace(/&(amp|lt|gt|quot|apos);/g, (_, name) => ENTITIES[name])
    .split("|")
    .map((word) => word.trim())
    .filter(Boolean);
  if (keywords.length < 1 || keywords.length > 3) fail(`${name}: data-keywords needs 1–3 keywords separated by "|"`);
  const invalid = keywords.find((word) => word.length > COVER.maxKeyword || /[^\x20-\x7e]/.test(word));
  if (invalid) fail(`${name}: "${invalid}" must be English (ASCII) and at most ${COVER.maxKeyword} characters`);

  if (/<(text|tspan|image|script|style|foreignObject|use)\b/i.test(glyph)) fail(`${name}: draw with shapes only (no text, image, script, style, foreignObject or use)`);
  if (/\bhref=/i.test(glyph)) fail(`${name}: links and external references are not allowed`);
  const foreignId = [...glyph.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]).find((id) => !id.startsWith("g-"));
  if (foreignId) fail(`${name}: id "${foreignId}" must start with "g-"`);
  return { keywords, glyph };
}

const slug = process.argv[2];
if (!slug) fail("usage: npm run thumbnail -- <slug>");
const dir = path.resolve("posts", slug, "img");
const sources = fs.existsSync(dir) ? fs.readdirSync(dir).filter((name) => SOURCE.test(name)) : [];
if (!sources.length) fail(`posts/${slug}/img/thumbnail.svg not found`);

for (const name of sources) {
  const target = path.join(dir, name.replace(/\.svg$/, ".png"));
  fs.writeFileSync(target, renderPng(composeCover(parse(fs.readFileSync(path.join(dir, name), "utf8"), name))));
  console.log(`[thumbnail] ${path.relative(process.cwd(), target)}`);
}
