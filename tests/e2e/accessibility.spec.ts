import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const auditedRoutes = [
  "/",
  "/insights/why-simon-synapse",
  "/projects/xiaosai-ai-lottery",
  "/kakeya/interactive",
  "/kakeya/immersive",
  "/kakeya/learn",
  "/about",
  "/privacy",
  "/404",
];

async function expectNoHorizontalOverflow(
  page: import("@playwright/test").Page,
) {
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
}

test("home has a skip link, one main landmark, and no horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/");
  await expect(page.getByRole("link", { name: "跳至主要內容" })).toBeAttached();
  await expect(page.locator("main")).toHaveCount(1);
  await expectNoHorizontalOverflow(page);
});

test("footer omits removed contact, RSS, and GitHub items", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.locator(
      'footer a[href="/contact"], footer a[href="/rss.xml"], footer a[href*="github.com"]',
    ),
  ).toHaveCount(0);
});

for (const route of auditedRoutes) {
  test(`${route} has no serious or critical axe violations`, async ({
    page,
  }) => {
    if (route.startsWith("/kakeya/")) {
      await page.emulateMedia({ reducedMotion: "reduce" });
    }
    await page.goto(route);
    const results = await new AxeBuilder({ page }).analyze();
    const blockingViolations = results.violations.filter(
      (item) => item.impact === "critical" || item.impact === "serious",
    );
    expect(blockingViolations, `${route}：${JSON.stringify(blockingViolations)}`).toEqual(
      [],
    );
  });

  test(`${route} reflows at three viewport widths and 200 percent zoom`, async ({
    page,
  }) => {
    if (route.startsWith("/kakeya/")) {
      await page.emulateMedia({ reducedMotion: "reduce" });
    }
    for (const width of [360, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(route);
      await expectNoHorizontalOverflow(page);
    }

    // W3C permits proportionally reducing the viewport when automated browser
    // zoom is unavailable: 1280 CSS px at 200% is equivalent to 640 CSS px.
    await page.setViewportSize({ width: 640, height: 900 });
    await page.goto(route);
    await expectNoHorizontalOverflow(page);
  });
}

test("keyboard skip link is first, visibly focused, and reaches main", async ({
  page,
}) => {
  await page.goto("/");
  await page.keyboard.press("Tab");

  const skipLink = page.getByRole("link", { name: "跳至主要內容" });
  await expect(skipLink).toBeFocused();
  const focusStyle = await skipLink.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      outlineStyle: style.outlineStyle,
      outlineWidth: Number.parseFloat(style.outlineWidth),
    };
  });
  expect(focusStyle.outlineStyle).not.toBe("none");
  expect(focusStyle.outlineWidth).toBeGreaterThan(0);

  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
});

test("mobile details navigation works without client JavaScript", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 360, height: 800 },
  });
  const page = await context.newPage();

  await page.goto(`${baseURL}/`);
  await page.getByRole("group").getByText("選單", { exact: true }).click();
  await expect(page.locator("details.nav-menu")).toHaveAttribute("open", "");
  await expect(page.getByRole("link", { name: "文章", exact: true })).toBeVisible();

  await context.close();
});

test("reduced motion caps decorative animation and transitions", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const longDurations = await page.locator("body *").evaluateAll((elements) => {
    const durationToMilliseconds = (value: string) =>
      value.split(",").reduce((maximum, duration) => {
        const trimmed = duration.trim();
        const milliseconds = trimmed.endsWith("ms")
          ? Number.parseFloat(trimmed)
          : Number.parseFloat(trimmed) * 1000;
        return Math.max(maximum, milliseconds);
      }, 0);

    return elements
      .map((element) => {
        const style = getComputedStyle(element);
        return {
          element: element.tagName.toLowerCase(),
          className: element.getAttribute("class"),
          animationDuration: style.animationDuration,
          transitionDuration: style.transitionDuration,
          maximum: Math.max(
            durationToMilliseconds(style.animationDuration),
            durationToMilliseconds(style.transitionDuration),
          ),
        };
      })
      .filter(({ maximum }) => maximum > 0.01);
  });

  expect(longDurations).toEqual([]);
});
