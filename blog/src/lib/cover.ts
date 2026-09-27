import path from "node:path";
import { Resvg } from "@resvg/resvg-js";

export const COVER = { width: 1200, height: 630, glyph: 240, maxKeyword: 22 };

const FONTS = ["Geist-Bold.ttf", "GeistMono-Medium.ttf"].map((file) => path.join(process.cwd(), "src/assets/fonts", file));

const SIZES: [number, number][] = [
  [8, 88],
  [11, 76],
  [14, 64],
  [18, 52],
  [COVER.maxKeyword, 44],
];

function escapeXml(value: string) {
  return value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

function keywordLines(keywords: string[]) {
  const longest = Math.max(...keywords.map((word) => word.length));
  const size = (SIZES.find(([limit]) => longest <= limit) ?? SIZES[SIZES.length - 1])[1];
  const step = size * 1.08;
  const first = 300 - ((keywords.length - 1) * step) / 2 + size * 0.36;
  return keywords
    .map(
      (word, index) =>
        `<text x="80" y="${(first + index * step).toFixed(1)}" font-family="Geist" font-weight="700" font-size="${size}" letter-spacing="-0.01em" fill="#071018">${escapeXml(word)}</text>`,
    )
    .join("");
}

export function defaultGlyph(seed: string) {
  const turn = [...seed].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) % 360, 7);
  return `<g transform="rotate(${turn} 120 120)">
<path d="M40 150 C70 90 110 170 150 104 S200 78 204 60" fill="none" stroke="url(#glyph-line)" stroke-width="3" stroke-linecap="round"/>
<path d="M58 70 L150 104 L118 196 Z" fill="rgba(73,105,255,0.07)" stroke="rgba(7,16,24,0.2)" stroke-width="1.5" stroke-dasharray="4 8"/>
<circle cx="40" cy="150" r="7" fill="#17c8bf" stroke="#fff" stroke-width="3"/>
<circle cx="150" cy="104" r="8" fill="#4969ff" stroke="#fff" stroke-width="3"/>
<circle cx="204" cy="60" r="7" fill="#ff5f9f" stroke="#fff" stroke-width="3"/>
<circle cx="118" cy="196" r="5" fill="#f3aa23" stroke="#fff" stroke-width="3"/>
</g>`;
}

export function composeCover({ keywords, glyph }: { keywords: string[]; glyph: string }) {
  const { width, height } = COVER;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<defs>
<linearGradient id="paper" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="0.48" stop-color="#f5f8fb"/><stop offset="1" stop-color="#ffffff"/></linearGradient>
<radialGradient id="glow-cyan" cx="870" cy="100" r="380" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#17c8bf" stop-opacity="0.18"/><stop offset="1" stop-color="#17c8bf" stop-opacity="0"/></radialGradient>
<radialGradient id="glow-pink" cx="1030" cy="500" r="320" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ff5f9f" stop-opacity="0.13"/><stop offset="1" stop-color="#ff5f9f" stop-opacity="0"/></radialGradient>
<radialGradient id="glow-blue" cx="200" cy="560" r="360" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#4969ff" stop-opacity="0.1"/><stop offset="1" stop-color="#4969ff" stop-opacity="0"/></radialGradient>
<pattern id="grid" width="42" height="42" patternUnits="userSpaceOnUse"><path d="M42 0H0V42" fill="none" stroke="rgba(7,16,24,0.055)" stroke-width="1"/></pattern>
<pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="14" cy="14" r="1" fill="rgba(7,16,24,0.09)"/></pattern>
<linearGradient id="route" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#17c8bf"/><stop offset="0.5" stop-color="#4969ff"/><stop offset="1" stop-color="#ff5f9f"/></linearGradient>
<linearGradient id="glyph-line" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#17c8bf"/><stop offset="0.5" stop-color="#4969ff"/><stop offset="1" stop-color="#ff5f9f"/></linearGradient></defs>
<rect width="${width}" height="${height}" fill="url(#paper)"/>
<rect width="${width}" height="${height}" fill="url(#glow-cyan)"/>
<rect width="${width}" height="${height}" fill="url(#glow-pink)"/>
<rect width="${width}" height="${height}" fill="url(#glow-blue)"/>
<rect width="${width}" height="${height}" fill="url(#grid)"/>
<rect width="${width}" height="${height}" fill="url(#dots)"/>
<path d="M-20 212 L1220 24 M-20 610 L760 -20 M430 650 L1220 330" stroke="rgba(73,105,255,0.09)" stroke-width="1"/>
<path d="M-40 560 C150 510 290 598 470 540 S700 400 745 372" fill="none" stroke="rgba(7,16,24,0.06)" stroke-width="14" stroke-linecap="round"/>
<path d="M-40 560 C150 510 290 598 470 540 S700 400 745 372" fill="none" stroke="url(#route)" stroke-width="3" stroke-linecap="round"/>
<circle cx="182" cy="545" r="6" fill="#17c8bf" stroke="#fff" stroke-width="3"/>
<circle cx="470" cy="540" r="6" fill="#4969ff" stroke="#fff" stroke-width="3"/>
<circle cx="745" cy="372" r="6" fill="#ff5f9f" stroke="#fff" stroke-width="3"/>
<circle cx="905" cy="300" r="190" fill="rgba(255,255,255,0.35)" stroke="rgba(7,16,24,0.09)" stroke-width="1.5"/>
<circle cx="905" cy="300" r="158" fill="none" stroke="rgba(23,200,191,0.38)" stroke-width="1.5" stroke-dasharray="4 10"/>
<path d="M1051 241 L1090 225" stroke="rgba(23,200,191,0.55)" stroke-width="1.5" stroke-linecap="round"/>
<circle cx="80" cy="96" r="5" fill="#071018" stroke="rgba(255,255,255,0.8)" stroke-width="4"/>
<text x="98" y="104" font-family="Geist Mono" font-weight="500" font-size="21" letter-spacing="3.4" fill="rgba(7,16,24,0.5)">YENA / BLOG</text>
${keywordLines(keywords)}
<text x="80" y="596" font-family="Geist Mono" font-weight="500" font-size="18" letter-spacing="2.2" fill="rgba(7,16,24,0.42)">blog.yena.io.kr</text>
<g transform="translate(761 156) scale(1.2)">${glyph}</g>
</svg>`;
}

export function renderPng(svg: string) {
  return new Uint8Array(new Resvg(svg, { font: { fontFiles: FONTS, loadSystemFonts: false, defaultFontFamily: "Geist" } }).render().asPng());
}
