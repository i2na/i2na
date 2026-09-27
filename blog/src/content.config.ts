import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const DATE = /^(\d{4}-\d{2}-\d{2})(?: (\d{2}:\d{2}))?$/;

const date = z.union([z.date(), z.string().regex(DATE, "use YYYY-MM-DD or YYYY-MM-DD HH:mm")]).transform((value) => {
  if (value instanceof Date) return new Date(`${value.toISOString().slice(0, 10)}T00:00:00+09:00`);
  const [, day, time = "00:00"] = DATE.exec(value)!;
  return new Date(`${day}T${time}:00+09:00`);
});

const tag = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9.+#-]*$/, "tags are English words without spaces, e.g. DigitalTwin");

const posts = defineCollection({
  loader: glob({ pattern: "*/index*.md", base: "./posts", generateId: ({ entry }) => entry.replace(/\.md$/, "") }),
  schema: z
    .object({
      title: z.string().min(1),
      description: z.string().min(1),
      date: date.optional(),
      tags: z.array(tag).min(1).max(3).optional(),
      draft: z.boolean().optional(),
    })
    .strict(),
});

export const collections = { posts };
