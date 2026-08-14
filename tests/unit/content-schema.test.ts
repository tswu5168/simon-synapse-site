import { describe, expect, it } from "vitest";
import { insightContentSchema } from "../../src/lib/content-schemas";

const insightSchema = insightContentSchema;

const insightFrontmatter = {
  aiAssisted: true,
  author: "賽腦耶",
  category: "實作教學",
  description: "這是一段足夠長的文章摘要，用來驗證公開 Insight 的來源欄位需求與正式發布要求。",
  draft: false,
  featured: false,
  publishedAt: "2026-08-14",
  seoDescription: "這是一段足夠長的 SEO 摘要，用來驗證公開 Insight 的來源欄位需求與建置閘門。",
  seoTitle: "公開 Insight 來源數量驗證",
  socialImage: "/images/og/simon-synapse-default.png",
  tags: ["驗證"],
  title: "公開 Insight 的可驗證來源數量",
  updatedAt: "2026-08-14",
};

describe("Insight content schema", () => {
  it("requires at least three sources for every Insight", () => {
    expect(
      insightSchema.safeParse({
        ...insightFrontmatter,
        sources: [
          { title: "來源一", url: "https://example.com/one" },
          { title: "來源二", url: "https://example.com/two" },
        ],
      }).success,
    ).toBe(false);

    expect(
      insightSchema.safeParse({
        ...insightFrontmatter,
        sources: [
          { title: "來源一", url: "https://example.com/one" },
          { title: "來源二", url: "https://example.com/two" },
          { title: "來源三", url: "https://example.com/three" },
        ],
      }).success,
    ).toBe(true);
  });
});
