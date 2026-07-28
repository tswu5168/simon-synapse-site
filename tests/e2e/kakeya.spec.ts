import { expect, test } from "@playwright/test";

const modes = [
  { path: "/kakeya/interactive", label: "互動科普" },
  { path: "/kakeya/immersive", label: "沉浸藝術" },
  { path: "/kakeya/learn", label: "數學教學" },
] as const;

test("每個掛谷猜想頁面都有三個可直接前往的模式連結", async ({ page }) => {
  for (const mode of modes) {
    await page.goto(mode.path);

    const navigation = page.getByRole("navigation", {
      name: "掛谷猜想體驗模式",
    });
    await expect(navigation.getByRole("link")).toHaveCount(3);

    for (const target of modes) {
      await expect(
        navigation.getByRole("link", { name: target.label }),
      ).toHaveAttribute("href", target.path);
    }

    await expect(navigation.locator('[aria-current="page"]')).toHaveCount(1);
    await expect(
      navigation.getByRole("link", { name: mode.label }),
    ).toHaveAttribute("aria-current", "page");
  }
});
