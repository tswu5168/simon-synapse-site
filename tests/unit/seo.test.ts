import { describe, expect, it } from "vitest";
import {
  absoluteUrl,
  articleJsonLd,
  creativeWorkJsonLd,
  profileJsonLd,
} from "../../src/lib/seo";

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

  it("builds project data as a CreativeWork", () => {
    expect(
      creativeWorkJsonLd({
        title: "作品案例詳細頁測試內容",
        description: "這是一段用於驗證作品結構化資料的完整說明文字。",
        pathname: "/projects/fixture",
        publishedAt: new Date("2026-07-24T00:00:00+08:00"),
        updatedAt: new Date("2026-07-24T00:00:00+08:00"),
        image: "/images/og/simon-synapse-default.png",
        projectUrl: "https://example.com/",
      }),
    ).toMatchObject({
      "@type": "CreativeWork",
      url: "https://simonsynapse.net/projects/fixture",
      author: { name: "賽腦耶" },
    });
  });
});
