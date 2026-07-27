# New Tagline and Header Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the approved tagline `創意遇見 AI，未來由此展開` and remove the header font-size switch without reducing the site's readable default typography.

**Architecture:** Keep `SITE.tagline` as the single source of truth for the hero, footer, and About page. Remove the isolated `FontSizeControl` component and its device-local state while preserving the existing `--font-scale: 1` typography calculations. Update the editorial explanation so no public page retains the former financial-freedom slogan.

**Tech Stack:** Astro 7, TypeScript 6, Vitest 4, Playwright 1.61, Cloudflare Pages, GitHub Actions.

## Global Constraints

- Approved tagline: `創意遇見 AI，未來由此展開`.
- Keep the eyebrow `Simon Synapse · Human ideas × AI systems` unchanged.
- Keep mobile body text at `1.125rem` and desktop body text at `1.25rem`.
- Preserve browser zoom, keyboard focus, responsive reflow, navigation, visuals, and the four core projects.
- Do not enable AdSense or change Cloudflare domains and subdomains.

---

### Task 1: Lock the new public behavior with failing tests

**Files:**
- Modify: `tests/unit/site-config.test.ts`
- Modify: `tests/e2e/content-routes.spec.ts`

**Interfaces:**
- Consumes: `SITE.tagline` and the rendered home page.
- Produces: regression coverage for the approved tagline and removed header control.

- [ ] **Step 1: Update the configuration expectation**

Replace the tagline assertion with:

```ts
expect(SITE.tagline).toBe("創意遇見 AI，未來由此展開");
```

- [ ] **Step 2: Update the home-page expectation**

Make the first expected heading `創意遇見 AI，未來由此展開`, then add a focused test:

```ts
test("header omits the removed font-size switch", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: /切換為(?:大字|標準字)/ }),
  ).toHaveCount(0);
});
```

- [ ] **Step 3: Run the focused tests and verify RED**

Run:

```powershell
npm.cmd test -- tests/unit/site-config.test.ts
$env:PUBLIC_SHOW_DRAFTS='true'
$env:PUBLIC_ADS_ENABLED='false'
npm.cmd run test:e2e -- tests/e2e/content-routes.spec.ts --project=chromium
```

Expected: the unit test reports the old tagline, and the browser test reports that the existing font-size button count is `1` instead of `0`.

### Task 2: Apply the approved copy and remove the obsolete control

**Files:**
- Modify: `src/config/site.ts`
- Modify: `src/components/SiteHeader.astro`
- Delete: `src/components/FontSizeControl.astro`
- Modify: `src/styles/global.css`
- Modify: `src/pages/about.astro`
- Modify: `src/content/insights/why-simon-synapse.md`
- Delete: `tests/e2e/font-size.spec.ts`
- Test: `tests/unit/site-config.test.ts`
- Test: `tests/e2e/content-routes.spec.ts`

**Interfaces:**
- Consumes: the approved `SITE.tagline` string.
- Produces: hero, footer, About page, and editorial copy with no legacy slogan or font-size switch.

- [ ] **Step 1: Change the shared tagline**

Set:

```ts
tagline: "創意遇見 AI，未來由此展開",
```

- [ ] **Step 2: Remove the header control**

Delete the `FontSizeControl` import and `<FontSizeControl />` from `SiteHeader.astro`. Delete `FontSizeControl.astro` and `tests/e2e/font-size.spec.ts` because the feature and its dedicated persistence behavior no longer exist.

- [ ] **Step 3: Remove only the unused large-font override**

Delete this block from `src/styles/global.css`:

```css
:root[data-font-scale="large"] {
  --font-scale: 1.25;
}
```

Keep `--font-scale: 1`, the body sizes, all `calc(... * var(--font-scale))` declarations, and browser zoom support unchanged.

- [ ] **Step 4: Rewrite the two legacy brand explanations**

In `src/pages/about.astro`, replace the old slogan sentence with:

```astro
本站以「{SITE.tagline}」為長期方向，強調從創意出發，透過 AI 實作、驗證與持續改進。
```

In `src/content/insights/why-simon-synapse.md`, replace the frontmatter description with:

```yaml
description: 說明 Simon Synapse 的品牌定位、內容原則與長期累積方向，以及如何讓創意透過 AI 實作與驗證。
```

Replace the paragraph containing the former slogan with:

```markdown
Simon Synapse 的價值不是把所有題目硬湊成同一類，而是建立一條共同原則：用 AI 協助解決真實問題，保留可檢查的過程，並讓成果能長期維護。「創意遇見 AI，未來由此展開」代表從人的發想出發，透過 AI 實作、驗證與持續改進；真正可控制的是作品數量、內容品質、發行管道與維護紀律。
```

- [ ] **Step 5: Run focused tests and verify GREEN**

Run the same two focused commands from Task 1.

Expected: the configuration and content-route suites pass.

- [ ] **Step 6: Confirm the removed copy and code are absent**

Run:

```powershell
rg -n "用 AI 實現財富自由|切換為大字|切換為標準字|simon-font-scale|data-font-scale" src tests
```

Expected: no matches.

- [ ] **Step 7: Commit the implementation**

```powershell
git add src tests
git commit -m "feat: refresh tagline and simplify header"
```

### Task 3: Validate and publish the exact source

**Files:**
- No source changes expected.

**Interfaces:**
- Consumes: the committed implementation from Task 2.
- Produces: a verified GitHub `main` commit and updated Cloudflare production site.

- [ ] **Step 1: Run static and unit checks**

```powershell
npm.cmd run check
```

Expected: zero Astro diagnostics and all Vitest tests pass.

- [ ] **Step 2: Build the production configuration**

```powershell
$env:PUBLIC_SHOW_DRAFTS='false'
$env:PUBLIC_ADS_ENABLED='false'
npm.cmd run build
```

Expected: build verification passes and the output contains the four published project pages.

- [ ] **Step 3: Run Chromium preview verification**

```powershell
$env:PUBLIC_SHOW_DRAFTS='true'
$env:PUBLIC_ADS_ENABLED='false'
npm.cmd run test:e2e -- --project=chromium
```

Expected: all applicable tests pass; ad-enabled tests remain skipped while ads are disabled.

- [ ] **Step 4: Push the fast-forward update**

Fetch first and confirm `origin/main...HEAD` reports no remote-only commits, then push the current commit to `feature/simon-synapse-hub` and `main` without force.

- [ ] **Step 5: Verify GitHub and Cloudflare production**

Confirm GitHub Actions succeeds for the pushed commit. Verify `https://simonsynapse.net/` returns HTTP 200, renders `創意遇見 AI，未來由此展開`, contains no `切換為大字`, retains four core project cards in their approved order, and contains no AdSense script.

