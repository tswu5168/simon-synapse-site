import { expect, test } from "@playwright/test";

test("home has a skip link, one main landmark, and no horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/");
  await expect(page.getByRole("link", { name: "跳至主要內容" })).toBeAttached();
  await expect(page.locator("main")).toHaveCount(1);
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
      .filter(({ left, right }) => left < 0 || right > document.documentElement.clientWidth),
  );
  expect(
    widths.scroll,
    `溢出元素：${JSON.stringify(overflowingElements)}`,
  ).toBeLessThanOrEqual(widths.client);
});
