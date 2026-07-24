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
