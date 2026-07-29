import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "serial" });

const modes = [
  { path: "/kakeya/interactive", label: "互動科普" },
  { path: "/kakeya/immersive", label: "沉浸藝術" },
  { path: "/kakeya/learn", label: "數學教學" },
] as const;

test("每個掛谷猜想頁面都有三個可直接前往的模式連結", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
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

test("互動科普頁能調整有限取樣並清楚標示模型限制", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/kakeya/interactive");

  await expect(
    page.getByRole("heading", { level: 1, name: "用手轉動每一個方向" }),
  ).toBeVisible();

  const directionCount = page.locator("#direction-count");
  await expect(directionCount).toHaveAccessibleName("方向數");
  await expect(directionCount).toHaveAttribute("min", "32");
  await expect(directionCount).toHaveAttribute("max", "512");
  await directionCount.focus();
  for (let index = 0; index < 4; index += 1) {
    await directionCount.press("ArrowRight");
  }
  await expect(page.getByTestId("direction-count-output")).toHaveText("320 根");

  const tubeRadius = page.locator("#tube-radius");
  await expect(tubeRadius).toHaveAccessibleName("線段粗細");
  await tubeRadius.focus();
  for (let index = 0; index < 6; index += 1) {
    await tubeRadius.press("ArrowRight");
  }
  await expect(page.getByTestId("tube-radius-output")).toHaveText("0.015");

  const dispersion = page.locator("#dispersion");
  await expect(dispersion).toHaveAccessibleName("中心分散程度");
  await dispersion.focus();
  for (let index = 0; index < 16; index += 1) {
    await dispersion.press("ArrowRight");
  }
  await expect(page.getByTestId("dispersion-output")).toHaveText("40%");

  await expect(page.getByTestId("finite-sample-note")).toContainText(
    "有限方向取樣不是數學證明",
  );
  await expect(page.locator('[data-kakeya-host]')).toHaveAttribute(
    "data-state",
    /ready|error/,
  );
});

test("沉浸藝術頁尊重減少動態設定並可隨時暫停", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/kakeya/immersive");

  await expect(
    page.getByRole("heading", { level: 1, name: "把無數方向收進一道光" }),
  ).toBeVisible();
  await expect(page.locator("[data-motion-state]")).toHaveAttribute(
    "data-motion-state",
    "靜態模式",
  );
  await expect(page.locator("#immersive-toggle")).toHaveAttribute(
    "aria-pressed",
    "false",
  );

  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.reload();
  await expect(page.locator("[data-motion-state]")).toHaveAttribute(
    "data-motion-state",
    "自動流動",
  );
  await page.locator(".kakeya-immersive-stage").dispatchEvent("pointerdown");
  await expect(page.locator("[data-motion-state]")).toHaveAttribute(
    "data-motion-state",
    "已暫停",
  );
});

test("數學教學頁以六步驟說明三維掛谷定理", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/kakeya/learn");

  await expect(
    page.getByRole("heading", { level: 1, name: "從一根針，到完整三維" }),
  ).toBeVisible();
  await expect(page.locator("[data-learn-step]")).toHaveCount(6);
  await expect(page.locator("#learn-progress")).toHaveText("步驟 1／6");

  await page.getByRole("button", { name: "下一步" }).click();
  await expect(page.locator("#learn-progress")).toHaveText("步驟 2／6");
  await expect(page.locator('[data-learn-step="2"]')).toBeVisible();
  await expect(page.locator('[data-learn-step="1"]')).toBeHidden();

  for (let index = 0; index < 4; index += 1) {
    await page.getByRole("button", { name: "下一步" }).click();
  }
  await expect(page.locator("#learn-progress")).toHaveText("步驟 6／6");
  await expect(page.getByTestId("dimension-result")).toContainText(
    "每一個三維掛谷集合的 Minkowski 維度與 Hausdorff 維度都是 3",
  );
  await expect(
    page.getByRole("link", { name: "Wang–Zahl 原始論文" }),
  ).toHaveAttribute("href", "https://arxiv.org/abs/2502.17655");
  await expect(page.getByTestId("learn-model-note")).toContainText(
    "有限取樣只用來輔助理解",
  );
});

test("三個掛谷頁面都有獨立 SEO 資訊且不載入廣告", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const mode of modes) {
    await page.goto(mode.path);
    await expect(page).toHaveTitle(/掛谷猜想 3D/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /三維|3D/,
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://simonsynapse.net${mode.path}`,
    );
    await expect(page.locator("main h1")).toHaveCount(1);
    await expect(page.locator(".adsbygoogle")).toHaveCount(0);
    await expect(
      page.locator('script[src*="pagead2.googlesyndication.com"]'),
    ).toHaveCount(0);
  }
});

test("WebGL 環境中斷時顯示結構化備援資訊", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/kakeya/interactive");

  const host = page.locator('[data-kakeya-host][data-mode="interactive"]');
  if ((await host.getAttribute("data-state")) !== "error") {
    await host.locator("canvas").dispatchEvent("webglcontextlost", {
      cancelable: true,
    });
  }

  await expect(host).toHaveAttribute("data-state", "error");
  await expect(host.locator("canvas")).toBeHidden();
  const fallback = host.locator("[data-kakeya-error]");
  await expect(fallback).toBeVisible();
  await expect(fallback).toContainText("Status：");
  await expect(fallback).toContainText("Root Cause：");
  await expect(fallback).toContainText("Suggested Fix：");
});
