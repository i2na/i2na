import type { ShikiConfig } from "astro";

export const paperTheme: ShikiConfig["theme"] = {
  name: "paper",
  type: "light",
  colors: { "editor.background": "#f4f7fa", "editor.foreground": "#1b2733" },
  tokenColors: [
    { scope: ["comment", "punctuation.definition.comment"], settings: { foreground: "#647180", fontStyle: "italic" } },
    {
      scope: ["keyword", "storage", "storage.type", "storage.modifier", "keyword.control", "variable.language", "entity.name.tag", "support.type.property-name", "meta.object-literal.key"],
      settings: { foreground: "#2f4de0" },
    },
    { scope: ["string", "string.template", "punctuation.definition.string", "markup.inline.raw"], settings: { foreground: "#c3286a" } },
    {
      scope: ["constant.numeric", "constant.language", "constant.character", "constant.other", "support.constant", "entity.name.type", "entity.name.class", "support.type", "support.class"],
      settings: { foreground: "#9a5b00" },
    },
    { scope: ["entity.name.function", "support.function", "entity.other.attribute-name", "entity.name.selector"], settings: { foreground: "#0a7a73" } },
    { scope: ["punctuation", "meta.brace", "keyword.operator"], settings: { foreground: "#56636f" } },
    { scope: ["markup.heading", "markup.bold"], settings: { fontStyle: "bold" } },
    { scope: ["markup.deleted"], settings: { foreground: "#c3286a" } },
    { scope: ["markup.inserted"], settings: { foreground: "#0a7a73" } },
  ],
};
