import { z } from "astro/zod";
import { SITE } from "../config/site";

export const sourceSchema = z.object({
  title: z.string().min(3),
  url: z.url(),
});

export const baseContentSchema = z.object({
  title: z.string().min(8),
  description: z.string().min(40).max(180),
  publishedAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  category: z.enum(["AI 工具", "資料研究", "實作教學", "數位資產", "作品紀錄"]),
  tags: z.array(z.string().min(1)).min(1).max(8),
  author: z.literal(SITE.author),
  sources: z.array(sourceSchema).min(1),
  aiAssisted: z.boolean(),
  draft: z.boolean(),
  featured: z.boolean(),
  seoTitle: z.string().min(8).max(60),
  seoDescription: z.string().min(40).max(160),
  socialImage: z.string().startsWith("/images/"),
});

export const insightContentSchema = baseContentSchema.extend({
  sources: z.array(sourceSchema).min(3),
});
