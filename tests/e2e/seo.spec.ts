import { expect, test } from "@playwright/test";

test("home exposes canonical and ownership metadata", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://simonsynapse.net/",
  );
  await expect(page.locator('meta[name="google-adsense-account"]')).toHaveAttribute(
    "content",
    "ca-pub-7384783799477371",
  );
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);
});
