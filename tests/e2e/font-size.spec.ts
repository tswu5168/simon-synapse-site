import { expect, test } from "@playwright/test";

test("large text preference persists on this device", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "切換為大字" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-font-scale", "large");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-font-scale", "large");
});
