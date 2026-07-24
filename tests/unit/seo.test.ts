import { describe, expect, it } from "vitest";
import { absoluteUrl, articleJsonLd, profileJsonLd } from "../../src/lib/seo";

describe("SEO helpers", () => {
  it("builds production URLs", () => {
    expect(absoluteUrl("/about")).toBe("https://simonsynapse.net/about");
  });

  it("describes the approved author profile", () => {
    expect(profileJsonLd()).toMatchObject({
      "@type": "ProfilePage",
      mainEntity: { "@type": "Person", name: "賽腦耶" },
    });
  });

  it("builds article data with the approved author", () => {
    expect(
      articleJsonLd({
        title: "測試文章標題",
        description: "這是一段只用於驗證結構化資料輸出的完整說明文字。",
        pathname: "/insights/test",
        publishedAt: new Date("2026-07-24T00:00:00+08:00"),
        updatedAt: new Date("2026-07-24T00:00:00+08:00"),
        image: "/images/og/simon-synapse-default.png",
      }),
    ).toMatchObject({
      "@type": "BlogPosting",
      url: "https://simonsynapse.net/insights/test",
      author: { name: "賽腦耶" },
    });
  });
});
