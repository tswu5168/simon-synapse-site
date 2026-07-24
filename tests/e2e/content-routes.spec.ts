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
  await expect(page.getByRole("heading", { name: "觀點與教學" })).toBeVisible();
  await page.goto("/projects");
  await expect(page.getByRole("heading", { name: "作品案例" })).toBeVisible();
});
