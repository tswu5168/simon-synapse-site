import { expect, test } from "@playwright/test";

test("home uses the approved reading order", async ({ page }) => {
  await page.goto("/");
  const headings = await page.locator("main h1, main h2").allTextContents();
  expect(headings).toEqual([
    "創意遇見 AI，未來由此展開",
    "焦點觀點",
    "最新訊號",
    "作品實證",
    "關於賽腦耶",
    "探索主題",
  ]);
});

test("header omits the removed font-size switch", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: /切換為(?:大字|標準字)/ }),
  ).toHaveCount(0);
  await expect(page.locator("html")).not.toHaveAttribute(
    "data-font-scale",
    /.+/,
  );
});

test("home displays the four approved core projects in order", async ({
  page,
}) => {
  await page.goto("/");
  const section = page.locator('section[aria-labelledby="projects-heading"]');
  await expect(section.locator(".content-card")).toHaveCount(4);
  await expect(section.locator("h3")).toHaveText([
    "小賽 AI 樂透預測：把預測變成可驗證研究",
    "Matt Pocock Skills 繁體中文互動速查手冊",
    "2026 世界盃 AI 預測：模型、賠率與結果追蹤",
    "小賽影片壓縮器：瀏覽器本機轉碼的實作與限制",
  ]);

  await expect(
    section.getByRole("link", {
      name: "開啟作品：小賽 AI 樂透預測：把預測變成可驗證研究 （另開新視窗）",
      exact: true,
    }),
  ).toHaveAttribute("href", "https://lotto.simonsynapse.net/");
  await expect(
    section.getByRole("link", {
      name: "開啟作品：Matt Pocock Skills 繁體中文互動速查手冊 （另開新視窗）",
      exact: true,
    }),
  ).toHaveAttribute("href", "https://mps.simonsynapse.net/");
  await expect(
    section.getByRole("link", {
      name: "開啟作品：2026 世界盃 AI 預測：模型、賠率與結果追蹤 （另開新視窗）",
      exact: true,
    }),
  ).toHaveAttribute("href", "https://sfiimfoan.simonsynapse.net/");
  await expect(
    section.getByRole("link", {
      name: "開啟作品：小賽影片壓縮器：瀏覽器本機轉碼的實作與限制 （另開新視窗）",
      exact: true,
    }),
  ).toHaveAttribute("href", "https://ssacompressor.simonsynapse.net/");
});

test("content index routes are available", async ({ page }) => {
  await page.goto("/insights");
  await expect(
    page.getByRole("heading", { name: "觀點與教學", exact: true }),
  ).toBeVisible();
  await page.goto("/projects");
  await expect(
    page.getByRole("heading", { name: "作品案例", exact: true }),
  ).toBeVisible();
});

test("detail page exposes author, dates, sources, and AI disclosure", async ({
  page,
}) => {
  await page.goto("/insights/why-simon-synapse");
  await expect(page.getByText("作者：賽腦耶", { exact: true })).toBeVisible();
  await expect(page.getByText("AI 協作揭露", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "參考來源", exact: true }),
  ).toBeVisible();
});

test("project detail exposes status and the separately labeled live work", async ({
  page,
}) => {
  await page.goto("/projects/xiaosai-ai-lottery");
  await expect(page.getByText("狀態：持續改進", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "開啟實際作品 （另開新視窗）", exact: true }),
  ).toHaveAttribute("href", "https://lotto.simonsynapse.net/");
});

test("preview exposes all six verified project drafts", async ({ page }) => {
  const projectSlugs = [
    "xiaosai-ai-lottery",
    "fifa-ai-prediction",
    "ssa-compressor",
    "exam-roadmap",
    "matt-pocock-skills-guide",
    "kakeya-3d-lab",
  ];

  await page.goto("/projects");
  await expect(page.locator(".content-card")).toHaveCount(6);

  for (const slug of projectSlugs) {
    await page.goto(`/projects/${slug}`);
    await expect(page.locator("main h1")).toHaveCount(1);
    await expect(page.getByText("AI 協作揭露", { exact: true })).toBeVisible();
  }
});

test("preview exposes all six original insight drafts", async ({ page }) => {
  const insightSlugs = [
    "why-simon-synapse",
    "idea-to-real-product",
    "ai-tools-as-digital-assets",
    "privacy-first-local-video-compression",
    "honest-prediction-models",
    "designing-an-actionable-exam-roadmap",
  ];

  await page.goto("/insights");
  await expect(page.locator(".content-card")).toHaveCount(6);

  for (const slug of insightSlugs) {
    await page.goto(`/insights/${slug}`);
    await expect(page.locator("main h1")).toHaveCount(1);
    await expect(page.getByText("AI 協作揭露", { exact: true })).toBeVisible();
  }
});

for (const [route, heading] of [
  ["/about", "關於 Simon Synapse"],
  ["/contact", "聯絡 Simon Synapse"],
  ["/privacy", "隱私權政策"],
  ["/terms", "網站使用條款"],
  ["/editorial-policy", "編輯政策"],
  ["/disclaimer", "免責聲明"],
  ["/404", "找不到這個頁面"],
] as const) {
  test(`${route} is a readable, ad-free trust page`, async ({ page }) => {
    const response = await page.goto(route);
    await expect(
      page.getByRole("heading", { name: heading, exact: true }),
    ).toBeVisible();
    await expect(page.locator("main h1")).toHaveCount(1);
    await expect(page.locator(".adsbygoogle")).toHaveCount(0);
    if (route === "/404") {
      expect(response?.status()).toBe(404);
    }
  });
}
