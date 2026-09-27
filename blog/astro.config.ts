import { satteri } from "@astrojs/markdown-satteri";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { markdownPlugins } from "./src/lib/markdown";
import { postMedia } from "./src/lib/post-media";
import { paperTheme } from "./src/lib/shiki";
import { site } from "./src/lib/site";

export default defineConfig({
  site: site.url,
  trailingSlash: "never",
  markdown: {
    processor: satteri({ ...markdownPlugins, features: { smartPunctuation: false } }),
    shikiConfig: { theme: paperTheme },
  },
  image: { layout: "constrained", responsiveStyles: true },
  integrations: [postMedia()],
  devToolbar: { enabled: false },
  vite: { plugins: [tailwindcss()] },
});
