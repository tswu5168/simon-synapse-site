import { expect, test } from "@playwright/test";

test("home uses the approved reading order", async ({ page }) => {
  await page.goto("/");
  const headings = await page.locator("main h1, main h2").allTextContents();
  expect(headings).toEqual([
    "用 AI 實現財富自由",
    "焦點觀點",
    "最新訊號",
    "作品實證",
    "關於賽腦耶",
    "探索主題",
  ]);
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
  await page.goto("/insights/fixture");
  await expect(page.getByText("作者：賽腦耶", { exact: true })).toBeVisible();
  await expect(page.getByText("AI 協作揭露", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "參考來源", exact: true }),
  ).toBeVisible();
});

test("project detail exposes status and the separately labeled live work", async ({
  page,
}) => {
  await page.goto("/projects/fixture");
  await expect(page.getByText("狀態：持續改進", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "開啟實際作品 （另開新視窗）", exact: true }),
  ).toHaveAttribute("href", "https://example.com/");
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
