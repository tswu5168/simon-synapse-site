import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { baseContentSchema, insightContentSchema } from "./lib/content-schemas";

export const collections = {
  insights: defineCollection({
    loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/insights" }),
    schema: insightContentSchema,
  }),
  projects: defineCollection({
    loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/projects" }),
    schema: baseContentSchema.extend({
      projectUrl: z.url(),
      status: z.enum(["運作中", "持續改進", "封存"]),
    }),
  }),
};
