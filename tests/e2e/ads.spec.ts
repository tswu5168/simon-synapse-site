import { expect, test } from "@playwright/test";

test("eligible detail renders exactly two governed slots", async ({ page }) => {
  await page.route("https://pagead2.googlesyndication.com/**", (route) =>
    route.fulfill({ status: 204, body: "" }),
  );
  const response = await page.goto("/insights/why-simon-synapse");

  expect(response?.status()).toBe(200);
  await expect(page.locator(".adsbygoogle")).toHaveCount(2);
  await expect(
    page.locator('script[src*="pagead2.googlesyndication.com"]'),
  ).toHaveCount(1);
});

test("excluded pages render neither units nor script", async ({ page }) => {
  for (const path of ["/", "/privacy", "/terms", "/contact", "/404"]) {
    await page.goto(path);
    await expect(page.locator(".adsbygoogle")).toHaveCount(0);
    await expect(
      page.locator('script[src*="pagead2.googlesyndication.com"]'),
    ).toHaveCount(0);
  }
});
