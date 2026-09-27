import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Slugger from "github-slugger";
import { defineHastPlugin, defineMdastPlugin, type HastNode, type PluginFactoryContext } from "satteri";
import { defaultLocale, isLocale, markdownLabels } from "./i18n";
import { site } from "./site";

const CALLOUT = /^\[!(note|tip|important|warning|caution)\][ \t]*(?:\n|$)/i;
const VIDEO = /\.(mp4|webm)$/i;

function sourceOf(fileURL: URL | undefined) {
  if (!fileURL) return { file: "", slug: "", lang: defaultLocale };
  const file = fileURLToPath(fileURL);
  const lang = path.basename(file).split(".")[1];
  return { file, slug: path.basename(path.dirname(file)), lang: isLocale(lang) ? lang : defaultLocale };
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"]/g, (char) => `&#${char.charCodeAt(0)};`);
}

function element(tagName: string, properties: Record<string, unknown>, children: HastNode[] = []): HastNode {
  return { type: "element", tagName, properties, children } as HastNode;
}

const callouts = ({ fileURL }: PluginFactoryContext) => {
  const labels = markdownLabels[sourceOf(fileURL).lang].callouts;
  return defineMdastPlugin({
    name: "callouts",
    blockquote(node, ctx) {
      const first = node.children[0];
      const head = first?.type === "paragraph" ? first.children[0] : undefined;
      const match = head?.type === "text" ? CALLOUT.exec(head.value) : null;
      if (!first || head?.type !== "text" || !match) return;
      const kind = match[1].toLowerCase();
      const rest = head.value.slice(match[0].length);
      if (rest) ctx.setProperty(head, "value", rest);
      else if (first.type === "paragraph" && first.children.length > 1) ctx.removeNode(head);
      else ctx.removeNode(first);
      ctx.setProperty(node, "data", { hName: "aside", hProperties: { className: ["callout", `callout-${kind}`] } });
      ctx.prependChild(node, {
        type: "paragraph",
        data: { hProperties: { className: ["callout-title"] } },
        children: [{ type: "text", value: labels[kind] }],
      });
    },
  });
};

const videos = ({ fileURL }: PluginFactoryContext) => {
  const { file, slug } = sourceOf(fileURL);
  return defineMdastPlugin({
    name: "videos",
    paragraph(node, ctx) {
      const [media] = node.children;
      if (node.children.length !== 1 || media.type !== "image" || !VIDEO.test(media.url)) return;
      const relative = media.url.replace(/^\.\//, "");
      if (file && !fs.existsSync(path.join(path.dirname(file), relative))) {
        throw new Error(`[posts] ${path.relative(process.cwd(), file)}: video not found: ${media.url}`);
      }
      const src = `/posts/${slug}/${relative}`;
      const caption = media.title ? `<figcaption>${escapeHtml(media.title)}</figcaption>` : "";
      ctx.replaceNode(node, {
        type: "html",
        value: `<figure><video src="${escapeHtml(src)}" aria-label="${escapeHtml(media.alt ?? "")}" controls muted playsinline preload="metadata"></video>${caption}</figure>`,
      });
    },
  });
};

const breaks = defineMdastPlugin({
  name: "breaks",
  text(node, ctx) {
    if (!node.value.includes("\n")) return;
    ctx.replaceNode(
      node,
      node.value.split("\n").flatMap((value, index) => [
        ...(index ? [{ type: "break" as const }] : []),
        ...(value ? [{ type: "text" as const, value }] : []),
      ]),
    );
  },
});

const blocks = defineHastPlugin({
  name: "blocks",
  element: [
    {
      filter: ["p"],
      visit(node) {
        const items = node.children.filter(
          (child) => !(child.type === "text" && !child.value.trim()) && !(child.type === "element" && child.tagName === "br"),
        );
        if (!items.length || !items.every((child) => child.type === "element" && child.tagName === "img")) return;
        const images = items.map((child) => {
          const { title, ...properties } = (child as { properties: Record<string, unknown> }).properties;
          return { ...child, properties, caption: typeof title === "string" ? title : "" };
        });
        const caption = images.map((image) => image.caption).filter(Boolean).join(" · ");
        const media = images.map(({ caption: _, ...image }) => image as HastNode);
        return element("figure", {}, [
          ...(media.length > 1 ? [element("div", { className: ["figure-row"] }, media)] : media),
          ...(caption ? [element("figcaption", {}, [{ type: "text", value: caption } as HastNode])] : []),
        ]);
      },
    },
    {
      filter: ["table"],
      visit(node, ctx) {
        ctx.wrapNode(node, element("div", { className: ["table-wrap"] }) as never);
      },
    },
    {
      filter: ["pre"],
      visit(node, ctx) {
        ctx.wrapNode(node, element("div", { className: ["code-block"], dataLanguage: node.properties?.dataLanguage ?? "plaintext" }) as never);
      },
    },
  ],
});

const links = defineHastPlugin({
  name: "links",
  element: {
    filter: ["a"],
    visit(node, ctx) {
      const href = node.properties?.href;
      if (typeof href !== "string" || !/^https?:\/\//.test(href) || href.startsWith(site.url)) return;
      ctx.setProperty(node, "target", "_blank");
      ctx.setProperty(node, "rel", ["noopener", "noreferrer"]);
    },
  },
});

const anchors = () => {
  const slugger = new Slugger();
  return defineHastPlugin({
    name: "anchors",
    element: {
      filter: ["h1", "h2", "h3", "h4", "h5", "h6"],
      visit(node, ctx) {
        if (node.properties?.id) return;
        const id = slugger.slug(ctx.textContent(node));
        ctx.setProperty(node, "id", id);
        ctx.appendChild(node, element("a", { className: ["heading-anchor"], href: `#${id}`, ariaHidden: "true", tabIndex: -1 }));
      },
    },
  });
};

const footnotes = ({ fileURL }: PluginFactoryContext) => {
  const labels = markdownLabels[sourceOf(fileURL).lang];
  return defineHastPlugin({
    name: "footnotes",
    element: [
      {
        filter: ["h2"],
        visit(node) {
          if (node.properties?.id !== "footnote-label") return;
          return { ...node, children: [{ type: "text", value: labels.footnotes }] } as HastNode;
        },
      },
      {
        filter: ["a"],
        visit(node, ctx) {
          if (node.properties && "dataFootnoteBackref" in node.properties) ctx.setProperty(node, "ariaLabel", labels.backref);
        },
      },
    ],
  });
};

export const markdownPlugins = {
  mdastPlugins: [callouts, videos, breaks],
  hastPlugins: [blocks, links, anchors, footnotes],
};
