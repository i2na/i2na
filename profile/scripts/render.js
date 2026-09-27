import { h } from "./dom.js";
import { icon } from "./icons.js";
import { codes, t } from "./i18n.js";
import { profile, timeline } from "./content.js";

const SVG_NS = "http://www.w3.org/2000/svg";
const ZIGZAG = [0, 22, 6, 18, 10];

function svgElement(tag, attributes = {}, ...children) {
  const element = document.createElementNS(SVG_NS, tag);
  for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
  element.append(...children);
  return element;
}

function langSwitch(locale, onLocale) {
  return h(
    "nav",
    { class: "lang-switch", "aria-label": t(locale, "ui.language") },
    h(
      "ul",
      {},
      codes.map((code) =>
        h(
          "li",
          {},
          h(
            "button",
            { class: "lang-code", type: "button", lang: code, "aria-pressed": String(code === locale), onclick: () => onLocale(code) },
            code
          )
        )
      )
    )
  );
}

function linkChip(channel, locale) {
  return h(
    "a",
    {
      class: channel.text ? "chip" : "chip chip--icon",
      href: channel.localized ? `${channel.href}/${locale}` : channel.href,
      target: "_blank",
      rel: "noopener noreferrer",
      "aria-label": channel.label,
      title: channel.label,
    },
    icon(channel.icon),
    channel.text && h("span", {}, channel.text)
  );
}

function copyChip(locale, email, onCopy) {
  return h(
    "button",
    { class: "chip", type: "button", "aria-label": t(locale, "ui.copyEmail"), title: t(locale, "ui.copyEmail"), onclick: () => onCopy(email) },
    icon("mail"),
    h("span", {}, email)
  );
}

function identity(locale, onLocale, onCopy) {
  const main = h(
    "div",
    { class: "identity-main" },
    h("p", { class: "eyebrow", style: { "--i": 0 } }, "Identity node"),
    h("h1", { id: "profile-title", style: { "--i": 1 } }, profile.name),
    h("p", { class: "role", style: { "--i": 2 } }, t(locale, "role")),
    h("p", { class: "tagline", style: { "--i": 3 } }, t(locale, "tagline"))
  );

  const intro = h("p", { class: "intro", style: { "--i": 4 } }, t(locale, "intro"));

  const links = h(
    "div",
    { class: "identity-links" },
    h("div", { class: "channels" }, profile.channels.map((channel) => linkChip(channel, locale)), copyChip(locale, profile.email, onCopy)),
    h("p", { class: "location" }, icon("pin"), t(locale, "location"))
  );

  return h("header", { class: "identity" }, langSwitch(locale, onLocale), main, intro, links);
}

function node(item, index, locale) {
  const now = !item.to;
  const dates = item.to && item.to !== item.from ? `${item.from} – ${item.to}` : now ? `${item.from} –` : item.from;

  return h(
    "article",
    {
      class: `node node--${item.color} ${index % 2 ? "node--down" : "node--up"}${now ? " node--now" : ""}`,
      style: {
        "--i": index,
        "--col": index * 2 + 1,
        "--zig": `${ZIGZAG[index % ZIGZAG.length]}px`,
        "--float-dur": `${6.4 + index * 0.9}s`,
        "--float-delay": `${-index * 1.7}s`,
      },
    },
    h("span", { class: "node-marker", "aria-hidden": "true" }),
    h(
      "div",
      { class: "node-body" },
      h("p", { class: "node-index" }, h("span", {}, `${item.kind} / ${dates}`), now && h("span", { class: "pill" }, "now")),
      h("h2", {}, item.title),
      item.lines.map((key) => h("p", { class: "node-line" }, t(locale, key))),
      item.channels && h("div", { class: "node-channels" }, item.channels.map((channel) => linkChip(channel, locale)))
    )
  );
}

function routeSvg() {
  const gradient = svgElement(
    "linearGradient",
    { id: "route-gradient", x1: "0", y1: "0", x2: "1", y2: "0" },
    svgElement("stop", { offset: "0", "stop-color": "#17c8bf" }),
    svgElement("stop", { offset: "0.5", "stop-color": "#4969ff" }),
    svgElement("stop", { offset: "1", "stop-color": "#ff5f9f" })
  );
  const nowCap = svgElement(
    "g",
    { class: "now-cap" },
    svgElement("circle", { class: "now-ring", r: "9" }),
    svgElement("circle", { class: "now-core", r: "5" }),
    svgElement("text", { x: "0", y: "-18", "text-anchor": "middle" }, "NOW")
  );
  return svgElement(
    "svg",
    { class: "route-svg", "aria-hidden": "true" },
    svgElement("defs", {}, gradient),
    svgElement("path", { class: "route-shadow" }),
    svgElement("path", { class: "route" }),
    svgElement("circle", { class: "packet packet--one", r: "4.5" }),
    svgElement("circle", { class: "packet packet--two", r: "3.6" }),
    nowCap
  );
}

function timelineSection(locale) {
  return h(
    "section",
    { class: "timeline", "aria-label": t(locale, "ui.timeline") },
    h("div", { class: "timeline-head" }, h("p", { class: "eyebrow", style: { "--accent": "var(--blue)", "--accent-glow": "var(--blue-glow)" } }, "Timeline / 2020 → now")),
    h(
      "div",
      { class: "timeline-band" },
      routeSvg(),
      h("div", { class: "timeline-nodes", style: { "--cols": timeline.length * 2 + 1 } }, timeline.map((item, index) => node(item, index, locale)))
    )
  );
}

export function renderApp(root, { locale, onLocale, onCopy }) {
  root.replaceChildren(identity(locale, onLocale, onCopy), timelineSection(locale));
}
