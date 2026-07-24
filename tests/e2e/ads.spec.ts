import { expect, test } from "@playwright/test";

const adsEnabled = process.env.PUBLIC_ADS_ENABLED === "true";
const testedRoutes = [
  "/",
  "/insights/why-simon-synapse",
  "/projects/xiaosai-ai-lottery",
  "/about",
  "/privacy",
  "/404",
];

test("eligible detail survives a blocked ad script with at most two governed slots", async ({
  page,
}) => {
  test.skip(!adsEnabled, "Requires the explicit AdSense test environment.");
  await page.route("https://pagead2.googlesyndication.com/**", (route) =>
    route.fulfill({ status: 204, body: "" }),
  );
  const response = await page.goto("/insights/why-simon-synapse");

  expect(response?.status()).toBe(200);
  await expect(page.locator(".adsbygoogle")).toHaveCount(2);
  await expect(
    page.locator('script[src*="pagead2.googlesyndication.com"]'),
  ).toHaveCount(1);
  await expect(page.locator("main h1")).toBeVisible();
  await expect(page.getByText(/點擊廣告|支持本站|贊助本站/)).toHaveCount(0);
  const widths = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }));
  const overflowingElements = await page.locator("body *").evaluateAll((elements) =>
    elements
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          element: element.tagName.toLowerCase(),
          className: element.getAttribute("class"),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
        };
      })
      .filter(
        ({ left, right }) =>
          left < 0 || right > document.documentElement.clientWidth,
      ),
  );
  expect(
    widths.scroll,
    `溢出元素：${JSON.stringify(overflowingElements)}`,
  ).toBeLessThanOrEqual(widths.client);
});

test("excluded pages render neither units nor script", async ({ page }) => {
  test.skip(!adsEnabled, "Requires the explicit AdSense test environment.");
  for (const path of ["/", "/privacy", "/terms", "/contact", "/404"]) {
    await page.goto(path);
    await expect(page.locator(".adsbygoogle")).toHaveCount(0);
    await expect(
      page.locator('script[src*="pagead2.googlesyndication.com"]'),
    ).toHaveCount(0);
  }
});

test("ads disabled renders no unit or script on every tested route", async ({
  page,
}) => {
  test.skip(adsEnabled, "Runs only when AdSense is disabled.");

  for (const route of testedRoutes) {
    await page.goto(route);
    await expect(page.locator(".adsbygoogle")).toHaveCount(0);
    await expect(
      page.locator('script[src*="pagead2.googlesyndication.com"]'),
    ).toHaveCount(0);
  }
});
