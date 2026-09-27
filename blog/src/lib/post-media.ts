import fs from "node:fs";
import path from "node:path";
import type { AstroIntegration } from "astro";

const POSTS = path.resolve("posts");
const TYPES: Record<string, string> = { ".mp4": "video/mp4", ".webm": "video/webm" };

function isDraft(slug: string) {
  const source = fs.readFileSync(path.join(POSTS, slug, "index.md"), "utf8");
  return /^draft:\s*true\s*$/m.test(source.split(/^---\s*$/m)[1] ?? "");
}

function mediaFiles() {
  return fs.readdirSync(POSTS).flatMap((slug) => {
    const dir = path.join(POSTS, slug, "img");
    if (!fs.existsSync(dir) || isDraft(slug)) return [];
    return fs.readdirSync(dir).filter((name) => path.extname(name).toLowerCase() in TYPES).map((name) => path.join(slug, "img", name));
  });
}

export function postMedia(): AstroIntegration {
  return {
    name: "post-media",
    hooks: {
      "astro:server:setup": ({ server }) => {
        server.middlewares.use("/posts", (req, res, next) => {
          const file = path.join(POSTS, decodeURIComponent(req.url?.split("?")[0] ?? ""));
          const type = TYPES[path.extname(file).toLowerCase()];
          if (!type || !file.startsWith(POSTS) || !fs.existsSync(file)) return next();
          res.setHeader("Content-Type", type);
          fs.createReadStream(file).pipe(res);
        });
      },
      "astro:build:done": ({ dir }) => {
        for (const file of mediaFiles()) {
          const target = path.join(new URL(dir).pathname, "posts", file);
          fs.mkdirSync(path.dirname(target), { recursive: true });
          fs.copyFileSync(path.join(POSTS, file), target);
        }
      },
    },
  };
}
