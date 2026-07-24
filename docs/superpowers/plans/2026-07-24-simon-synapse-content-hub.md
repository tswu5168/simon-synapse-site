# Simon Synapse Content Hub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an accessible, content-first Simon Synapse personal brand hub at `simonsynapse.net`, backed by GitHub and automatically deployed through Cloudflare Pages, then prepare it for a conservative AdSense re-review.

**Architecture:** Use Astro 7 static generation with typed Markdown content collections. Keep public content in Git, render the primary experience without a client framework, and add JavaScript only for the large-text preference and Google consent control. Separate preview, production cutover, and AdSense re-review so development cannot disrupt the current lottery site.

**Tech Stack:** Node.js 24 LTS, npm, Astro 7, TypeScript strict mode, Astro Content Collections, Vitest, Playwright, axe-core, GitHub Actions, Cloudflare Pages.

## Global Constraints

- Brand name is exactly `Simon Synapse`.
- Chinese tagline is exactly `用 AI 實現財富自由`.
- Author byline is exactly `賽腦耶`.
- Supporting disclaimer is exactly `透過實用工具、資料研究與持續創作，建立可累積的數位資產。本站內容不構成投資、投注或收益保證。`
- Reader-facing Chinese copy uses Taiwan Traditional Chinese.
- Mobile body text is at least `18 px`; desktop body text is at least `20 px`; line height is `1.8`.
- Interactive targets are at least `48 × 48 CSS px`.
- Browser zoom at 200% must reflow without unintended horizontal scrolling.
- No database, CMS, membership, comments, news scraping, external font CDN, WebGL, background video, or frontend UI framework in v1.
- Homepage, index pages, policy pages, contact page, and 404 page never render AdSense code or units.
- Existing subdomains never receive AdSense code in v1.
- Eligible article and project pages render at most two responsive ad units, only when `PUBLIC_ADS_ENABLED=true` and real slot IDs exist.
- Production uses `PUBLIC_SHOW_DRAFTS=false`; Cloudflare Preview uses `PUBLIC_SHOW_DRAFTS=true`.
- No personal experience, outcome, source, or opinion may be invented. Unverified content remains `draft: true`.
- DNS, production custom domains, and AdSense review state remain unchanged until the preview gate passes.
- Use Node.js `24.18.0` locally and in CI. Commit `package-lock.json`.

---

## Planned File Map

```text
.github/workflows/ci.yml
.gitignore
.nvmrc
README.md
astro.config.mjs
package.json
package-lock.json
playwright.config.ts
tsconfig.json
vitest.config.ts
data/legacy-routes.json
docs/operations/cloudflare-preview-checklist.md
docs/operations/production-cutover-checklist.md
docs/operations/adsense-review-checklist.md
public/_headers
public/_redirects
public/ads.txt
public/favicon.svg
public/images/og/simon-synapse-default.png
public/robots.txt
scripts/audit-legacy-routes.mjs
scripts/build-redirects.mjs
scripts/generate-og-image.mjs
scripts/verify-build.mjs
src/config/site.ts
src/content.config.ts
src/content/insights/*.md
src/content/projects/*.md
src/lib/content.ts
src/lib/seo.ts
src/styles/global.css
src/layouts/BaseLayout.astro
src/layouts/ArticleLayout.astro
src/components/AdSlot.astro
src/components/ArticleMeta.astro
src/components/ConsentManager.astro
src/components/ExternalLink.astro
src/components/FontSizeControl.astro
src/components/HeroSignal.astro
src/components/InsightCard.astro
src/components/ProjectCard.astro
src/components/SiteFooter.astro
src/components/SiteHeader.astro
src/components/SiteHead.astro
src/components/SourceList.astro
src/pages/index.astro
src/pages/insights/index.astro
src/pages/insights/[slug].astro
src/pages/projects/index.astro
src/pages/projects/[slug].astro
src/pages/about.astro
src/pages/contact.astro
src/pages/privacy.astro
src/pages/terms.astro
src/pages/editorial-policy.astro
src/pages/disclaimer.astro
src/pages/404.astro
src/pages/rss.xml.ts
tests/unit/content.test.ts
tests/unit/redirects.test.ts
tests/unit/seo.test.ts
tests/unit/site-config.test.ts
tests/e2e/accessibility.spec.ts
tests/e2e/ads.spec.ts
tests/e2e/content-routes.spec.ts
tests/e2e/font-size.spec.ts
tests/e2e/seo.spec.ts
```

## Phase A：建立可驗收的 Cloudflare Preview

### Task 1：建立 Astro 專案、鎖定工具鏈及品牌設定

**Files:**
- Create: `.nvmrc`
- Create: `.gitignore`
- Create: `package.json`
- Create: `package-lock.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Create: `src/config/site.ts`
- Test: `tests/unit/site-config.test.ts`

**Interfaces:**
- Produces: `SITE`, `ADS`, `ROUTES_WITHOUT_ADS`, `isAdEligible(pathname, enabled)`.
- Produces: all npm commands consumed by later tasks.
- Consumes: none.

- [ ] **Step 1：鎖定 Node.js 並安裝相依套件**

Create `.nvmrc`:

```text
24.18.0
```

Run:

```powershell
npm.cmd init -y
npm.cmd install --save-exact astro@7.1.0 @astrojs/check@latest @astrojs/rss@latest @astrojs/sitemap@latest sharp@latest typescript@latest zod@latest
npm.cmd install --save-dev --save-exact @axe-core/playwright@latest @playwright/test@latest linkedom@latest vitest@latest
```

Expected: `package-lock.json` exists and `npm.cmd ls --depth=0` exits `0`.

- [ ] **Step 2：定義專案指令**

Set `package.json` scripts to:

```json
{
  "scripts": {
    "dev": "astro dev",
    "check": "astro check && vitest run",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "test:a11y": "playwright test tests/e2e/accessibility.spec.ts",
    "generate:redirects": "node scripts/build-redirects.mjs",
    "generate:og": "node scripts/generate-og-image.mjs",
    "audit:legacy": "node scripts/audit-legacy-routes.mjs",
    "build": "npm run generate:redirects && astro check && astro build && node scripts/verify-build.mjs",
    "preview": "astro preview"
  },
  "engines": {
    "node": "24.x"
  }
}
```

Create `.gitignore`:

```gitignore
node_modules/
dist/
.astro/
.wrangler/
playwright-report/
test-results/
.env
.env.*
!.env.example
```

- [ ] **Step 3：先寫品牌與廣告路由測試**

Create `tests/unit/site-config.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { ADS, SITE, isAdEligible } from "../../src/config/site";

describe("site configuration", () => {
  it("locks approved brand copy", () => {
    expect(SITE.name).toBe("Simon Synapse");
    expect(SITE.tagline).toBe("用 AI 實現財富自由");
    expect(SITE.author).toBe("賽腦耶");
  });

  it("uses the approved publisher account", () => {
    expect(ADS.publisherId).toBe("pub-7384783799477371");
    expect(ADS.clientId).toBe("ca-pub-7384783799477371");
  });

  it("allows ads only on detail pages when enabled", () => {
    expect(isAdEligible("/insights/example", true)).toBe(true);
    expect(isAdEligible("/projects/example/", true)).toBe(true);
    expect(isAdEligible("/", true)).toBe(false);
    expect(isAdEligible("/privacy", true)).toBe(false);
    expect(isAdEligible("/insights/example", false)).toBe(false);
  });
});
```

- [ ] **Step 4：確認測試先失敗**

Run:

```powershell
npm.cmd test -- tests/unit/site-config.test.ts
```

Expected: FAIL because `src/config/site.ts` does not exist.

- [ ] **Step 5：實作單一品牌設定來源**

Create `src/config/site.ts`:

```ts
export const SITE = {
  origin: "https://simonsynapse.net",
  name: "Simon Synapse",
  tagline: "用 AI 實現財富自由",
  author: "賽腦耶",
  description:
    "透過實用 AI 工具、資料研究與持續創作，建立可累積的數位資產。",
  disclaimer:
    "透過實用工具、資料研究與持續創作，建立可累積的數位資產。本站內容不構成投資、投注或收益保證。",
  githubUrl: "https://github.com/tswu5168",
  locale: "zh-Hant-TW",
  defaultSocialImage: "/images/og/simon-synapse-default.png",
} as const;

export const ADS = {
  publisherId: "pub-7384783799477371",
  clientId: "ca-pub-7384783799477371",
  enabled: import.meta.env.PUBLIC_ADS_ENABLED === "true",
} as const;

export const ROUTES_WITHOUT_ADS = new Set([
  "/",
  "/insights",
  "/projects",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/editorial-policy",
  "/disclaimer",
  "/404",
]);

export function isAdEligible(pathname: string, enabled = ADS.enabled): boolean {
  if (!enabled) return false;
  const normalized = pathname !== "/" ? pathname.replace(/\/$/, "") : pathname;
  if (ROUTES_WITHOUT_ADS.has(normalized)) return false;
  return /^\/(insights|projects)\/[^/]+$/.test(normalized);
}
```

- [ ] **Step 6：加入 Astro、Vitest 與 Playwright 設定**

Create `astro.config.mjs`:

```js
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://simonsynapse.net",
  output: "static",
  integrations: [sitemap()],
  trailingSlash: "never",
});
```

Create `tsconfig.json`:

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
  },
});
```

Create `playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:4321",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev -- --host 127.0.0.1",
    url: "http://127.0.0.1:4321",
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
});
```

- [ ] **Step 7：驗證並提交**

Run:

```powershell
npm.cmd test -- tests/unit/site-config.test.ts
npm.cmd exec -- astro check
```

Expected: tests PASS and Astro check exits `0`.

Commit:

```powershell
git add .nvmrc .gitignore package.json package-lock.json astro.config.mjs tsconfig.json vitest.config.ts playwright.config.ts src/config/site.ts tests/unit/site-config.test.ts
git commit -m "build: bootstrap Astro content hub"
```

### Task 2：建立型別化內容集合與發布過濾

**Files:**
- Create: `src/content.config.ts`
- Create: `src/lib/content.ts`
- Create: `src/content/insights/.gitkeep`
- Create: `src/content/projects/.gitkeep`
- Create: `data/legacy-routes.json`
- Test: `tests/unit/content.test.ts`

**Interfaces:**
- Produces: collections `insights` and `projects`.
- Produces: `selectVisibleEntries(entries, options)` and `sortNewestFirst(entries)`.
- Consumes: `SITE.author`.

- [ ] **Step 1：先寫內容可見性測試**

Create `tests/unit/content.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { selectVisibleEntries, sortNewestFirst } from "../../src/lib/content";

const entries = [
  { id: "older", data: { draft: false, publishedAt: new Date("2026-07-20") } },
  { id: "draft", data: { draft: true, publishedAt: new Date("2026-07-24") } },
  { id: "future", data: { draft: false, publishedAt: new Date("2026-08-01") } },
  { id: "newer", data: { draft: false, publishedAt: new Date("2026-07-23") } },
];

describe("content visibility", () => {
  it("excludes drafts and future entries in production", () => {
    const visible = selectVisibleEntries(entries, {
      showDrafts: false,
      now: new Date("2026-07-24T23:59:59+08:00"),
    });
    expect(visible.map((entry) => entry.id)).toEqual(["older", "newer"]);
  });

  it("shows drafts in preview but excludes future entries", () => {
    const visible = selectVisibleEntries(entries, {
      showDrafts: true,
      now: new Date("2026-07-24T23:59:59+08:00"),
    });
    expect(visible.map((entry) => entry.id)).toEqual(["older", "draft", "newer"]);
  });

  it("sorts newest first without mutating input", () => {
    expect(sortNewestFirst(entries).map((entry) => entry.id)).toEqual([
      "future",
      "draft",
      "newer",
      "older",
    ]);
    expect(entries[0].id).toBe("older");
  });
});
```

- [ ] **Step 2：確認測試先失敗**

Run:

```powershell
npm.cmd test -- tests/unit/content.test.ts
```

Expected: FAIL because `src/lib/content.ts` does not exist.

- [ ] **Step 3：實作純函式內容篩選**

Create `src/lib/content.ts`:

```ts
export type PublishableEntry = {
  id: string;
  data: {
    draft: boolean;
    publishedAt: Date;
  };
};

export function selectVisibleEntries<T extends PublishableEntry>(
  entries: T[],
  options: { showDrafts: boolean; now?: Date },
): T[] {
  const now = options.now ?? new Date();
  return entries.filter(
    (entry) =>
      entry.data.publishedAt.getTime() <= now.getTime() &&
      (options.showDrafts || !entry.data.draft),
  );
}

export function sortNewestFirst<T extends PublishableEntry>(entries: T[]): T[] {
  return [...entries].sort(
    (a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime(),
  );
}
```

- [ ] **Step 4：定義共用 frontmatter schema**

Create `src/content.config.ts`:

```ts
import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { SITE } from "./config/site";

const sourceSchema = z.object({
  title: z.string().min(3),
  url: z.string().url(),
});

const baseSchema = z.object({
  title: z.string().min(8),
  description: z.string().min(40).max(180),
  publishedAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  category: z.enum(["AI 工具", "資料研究", "實作教學", "數位資產", "作品紀錄"]),
  tags: z.array(z.string().min(1)).min(1).max(8),
  author: z.literal(SITE.author),
  sources: z.array(sourceSchema).min(1),
  aiAssisted: z.boolean(),
  draft: z.boolean(),
  featured: z.boolean(),
  seoTitle: z.string().min(8).max(60),
  seoDescription: z.string().min(40).max(160),
  socialImage: z.string().startsWith("/images/"),
});

export const collections = {
  insights: defineCollection({
    loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/insights" }),
    schema: baseSchema,
  }),
  projects: defineCollection({
    loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/projects" }),
    schema: baseSchema.extend({
      projectUrl: z.string().url(),
      status: z.enum(["運作中", "持續改進", "封存"]),
    }),
  }),
};
```

Create empty `.gitkeep` files in both collection directories.

Create `data/legacy-routes.json`:

```json
{
  "capturedAt": "2026-07-24",
  "source": "https://simonsynapse.net/",
  "routes": []
}
```

- [ ] **Step 5：驗證 schema 並提交**

Run:

```powershell
npm.cmd test -- tests/unit/content.test.ts
npm.cmd exec -- astro check
```

Expected: tests PASS and Astro check exits `0`.

Commit:

```powershell
git add src/content.config.ts src/lib/content.ts src/content/insights/.gitkeep src/content/projects/.gitkeep data/legacy-routes.json tests/unit/content.test.ts
git commit -m "feat: add typed content collections"
```

### Task 3：建立大字、高對比 Neural Aurora 網站外殼

**Files:**
- Create: `src/styles/global.css`
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/components/SiteHead.astro`
- Create: `src/components/SiteHeader.astro`
- Create: `src/components/SiteFooter.astro`
- Create: `src/components/FontSizeControl.astro`
- Create: `src/components/ExternalLink.astro`
- Create: `src/pages/index.astro`
- Create: `public/favicon.svg`
- Create: `public/_headers`
- Test: `tests/e2e/font-size.spec.ts`
- Test: `tests/e2e/accessibility.spec.ts`

**Interfaces:**
- Produces: `BaseLayout` props `{ title, description, canonicalPath, image?, jsonLd?, loadAds? }`.
- Produces: local preference key `simon-font-scale` with values `standard` or `large`.
- Consumes: `SITE`.

- [ ] **Step 1：先寫外殼與字級測試**

Create `tests/e2e/font-size.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("large text preference persists on this device", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "切換為大字" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-font-scale", "large");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-font-scale", "large");
});
```

Create the first test in `tests/e2e/accessibility.spec.ts`:

```ts
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
  expect(widths.scroll).toBeLessThanOrEqual(widths.client);
});
```

- [ ] **Step 2：確認測試先失敗**

Run:

```powershell
npm.cmd exec -- playwright install chromium
npm.cmd run test:e2e -- tests/e2e/font-size.spec.ts tests/e2e/accessibility.spec.ts --project=chromium
```

Expected: FAIL because the page shell does not exist.

- [ ] **Step 3：實作設計 token 與最低可讀性**

Create `src/styles/global.css` with these non-negotiable declarations:

```css
:root {
  color-scheme: dark;
  --bg: #050816;
  --surface: #0b1020;
  --surface-raised: #111936;
  --text: #f4f7ff;
  --text-muted: #c4cee7;
  --cyan: #58e6ff;
  --violet: #9b7bff;
  --magenta: #ff5fd2;
  --focus: #ffe66d;
  --font-scale: 1;
  --content-width: 76rem;
  --reading-width: 47.5rem;
  font-family: system-ui, "Segoe UI", "Microsoft JhengHei", sans-serif;
  background: var(--bg);
  color: var(--text);
}

:root[data-font-scale="large"] {
  --font-scale: 1.25;
}

* {
  box-sizing: border-box;
}

html {
  background: var(--bg);
}

body {
  min-width: 320px;
  margin: 0;
  overflow-wrap: anywhere;
  font-size: calc(1.125rem * var(--font-scale));
  line-height: 1.8;
  background:
    radial-gradient(circle at 10% 0%, rgb(88 230 255 / 14%), transparent 34rem),
    radial-gradient(circle at 90% 10%, rgb(155 123 255 / 16%), transparent 38rem),
    var(--bg);
}

@media (min-width: 64rem) {
  body {
    font-size: calc(1.25rem * var(--font-scale));
  }
}

a {
  color: var(--cyan);
  text-decoration-thickness: 0.12em;
  text-underline-offset: 0.2em;
}

a:focus-visible,
button:focus-visible,
summary:focus-visible {
  outline: 0.2rem solid var(--focus);
  outline-offset: 0.2rem;
}

button,
summary,
.button {
  min-width: 3rem;
  min-height: 3rem;
  font: inherit;
}

.container {
  width: min(calc(100% - 2rem), var(--content-width));
  margin-inline: auto;
}

.reading-column {
  width: min(100%, var(--reading-width));
  margin-inline: auto;
}

.skip-link {
  position: fixed;
  inset: 0.5rem auto auto 0.5rem;
  z-index: 100;
  transform: translateY(-200%);
}

.skip-link:focus {
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Component styles may extend these values but cannot reduce text size, target size, focus visibility, contrast, reflow, or reduced-motion behavior.

- [ ] **Step 4：實作字級切換**

Before the stylesheet paints, `SiteHead.astro` applies the saved local preference:

```astro
<script is:inline>
  try {
    document.documentElement.dataset.fontScale =
      localStorage.getItem("simon-font-scale") === "large" ? "large" : "standard";
  } catch {
    document.documentElement.dataset.fontScale = "standard";
  }
</script>
```

Create `src/components/FontSizeControl.astro`:

```astro
<button type="button" id="font-size-control" aria-pressed="false">
  切換為大字
</button>

<script>
  const key = "simon-font-scale";
  const root = document.documentElement;
  const button = document.querySelector<HTMLButtonElement>("#font-size-control");

  const apply = (value: "standard" | "large") => {
    root.dataset.fontScale = value;
    if (button) {
      const isLarge = value === "large";
      button.ariaPressed = String(isLarge);
      button.textContent = isLarge ? "切換為標準字" : "切換為大字";
    }
  };

  let saved: "standard" | "large" = "standard";
  try {
    saved = localStorage.getItem(key) === "large" ? "large" : "standard";
  } catch {
    saved = "standard";
  }
  apply(saved);

  button?.addEventListener("click", () => {
    const next = root.dataset.fontScale === "large" ? "standard" : "large";
    try {
      localStorage.setItem(key, next);
    } catch {
      // The readable default and current-page toggle still work without storage.
    }
    apply(next);
  });
</script>
```

- [ ] **Step 5：實作語意化網站外殼**

`SiteHeader.astro` uses a `<details>` mobile menu so navigation works without JavaScript. `BaseLayout.astro` renders:

```astro
<a class="skip-link button" href="#main-content">跳至主要內容</a>
<SiteHeader />
<main id="main-content">
  <slot />
</main>
<SiteFooter />
```

`SiteFooter.astro` includes `/about`, `/contact`, `/privacy`, `/terms`, `/editorial-policy`, `/disclaimer`, `/rss.xml`, and `SITE.githubUrl`.

Create `public/_headers`:

```text
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  X-Frame-Options: DENY
```

Create a minimal `src/pages/index.astro` with the approved brand, tagline, and disclaimer so the shell can be tested.

- [ ] **Step 6：驗證並提交**

Run:

```powershell
npm.cmd run test:e2e -- tests/e2e/font-size.spec.ts tests/e2e/accessibility.spec.ts --project=chromium
```

Expected: both tests PASS.

Commit:

```powershell
git add src/styles/global.css src/layouts/BaseLayout.astro src/components/SiteHead.astro src/components/SiteHeader.astro src/components/SiteFooter.astro src/components/FontSizeControl.astro src/components/ExternalLink.astro src/pages/index.astro public/favicon.svg public/_headers tests/e2e/font-size.spec.ts tests/e2e/accessibility.spec.ts
git commit -m "feat: add accessible Neural Aurora shell"
```

### Task 4：建立 canonical、結構化資料、RSS 與輸出檢查

**Files:**
- Create: `src/lib/seo.ts`
- Modify: `src/components/SiteHead.astro`
- Modify: `src/layouts/BaseLayout.astro`
- Create: `src/pages/rss.xml.ts`
- Create: `public/robots.txt`
- Create: `public/ads.txt`
- Create: `scripts/verify-build.mjs`
- Test: `tests/unit/seo.test.ts`
- Test: `tests/e2e/seo.spec.ts`

**Interfaces:**
- Produces: `absoluteUrl(path)`, `profileJsonLd()`, `articleJsonLd(input)`.
- Produces: canonical, Open Graph, AdSense ownership meta, RSS, sitemap, and JSON-LD.
- Consumes: `SITE`.

- [ ] **Step 1：先寫 SEO 純函式測試**

Create `tests/unit/seo.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { absoluteUrl, articleJsonLd, profileJsonLd } from "../../src/lib/seo";

describe("SEO helpers", () => {
  it("builds production URLs", () => {
    expect(absoluteUrl("/about")).toBe("https://simonsynapse.net/about");
  });

  it("describes the approved author profile", () => {
    expect(profileJsonLd()).toMatchObject({
      "@type": "ProfilePage",
      mainEntity: { "@type": "Person", name: "賽腦耶" },
    });
  });

  it("builds article data with the approved author", () => {
    expect(
      articleJsonLd({
        title: "測試文章標題",
        description: "這是一段只用於驗證結構化資料輸出的完整說明文字。",
        pathname: "/insights/test",
        publishedAt: new Date("2026-07-24T00:00:00+08:00"),
        updatedAt: new Date("2026-07-24T00:00:00+08:00"),
        image: "/images/og/simon-synapse-default.png",
      }),
    ).toMatchObject({
      "@type": "BlogPosting",
      url: "https://simonsynapse.net/insights/test",
      author: { name: "賽腦耶" },
    });
  });
});
```

- [ ] **Step 2：確認測試先失敗**

Run:

```powershell
npm.cmd test -- tests/unit/seo.test.ts
```

Expected: FAIL because `src/lib/seo.ts` does not exist.

- [ ] **Step 3：實作 SEO helper**

Create `src/lib/seo.ts`:

```ts
import { SITE } from "../config/site";

export const absoluteUrl = (path: string): string =>
  new URL(path, SITE.origin).toString();

export function profileJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: `關於 ${SITE.author}`,
    url: absoluteUrl("/about"),
    mainEntity: {
      "@type": "Person",
      name: SITE.author,
      alternateName: SITE.name,
      url: absoluteUrl("/about"),
      sameAs: [SITE.githubUrl],
    },
  };
}

export function articleJsonLd(input: {
  title: string;
  description: string;
  pathname: string;
  publishedAt: Date;
  updatedAt: Date;
  image: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: input.title,
    description: input.description,
    url: absoluteUrl(input.pathname),
    image: absoluteUrl(input.image),
    datePublished: input.publishedAt.toISOString(),
    dateModified: input.updatedAt.toISOString(),
    inLanguage: SITE.locale,
    author: {
      "@type": "Person",
      name: SITE.author,
      url: absoluteUrl("/about"),
    },
  };
}
```

- [ ] **Step 4：完成 head、robots、RSS 與 ads.txt**

`SiteHead.astro` emits:

```astro
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="google-adsense-account" content="ca-pub-7384783799477371" />
<link rel="canonical" href={canonicalUrl} />
<link rel="alternate" type="application/rss+xml" title="Simon Synapse RSS" href="/rss.xml" />
<meta property="og:site_name" content="Simon Synapse" />
<meta property="og:locale" content="zh_TW" />
```

It also emits title, description, Open Graph URL/image, Twitter card data, and optional JSON-LD. `BaseLayout` sets `<html lang="zh-Hant-TW">`.

Create `public/robots.txt`:

```text
User-agent: *
Allow: /

Sitemap: https://simonsynapse.net/sitemap-index.xml
```

Create `public/ads.txt`:

```text
google.com, pub-7384783799477371, DIRECT, f08c47fec0942fa0
```

Create `src/pages/rss.xml.ts` with `@astrojs/rss`, `getCollection("insights")`, `selectVisibleEntries`, and `sortNewestFirst`.

- [ ] **Step 5：建立輸出驗證器**

Create `scripts/verify-build.mjs`. It parses every `dist/**/*.html` with `linkedom` and exits `1` with the exact file and rule when any check fails. Checks:

1. Exactly one `<main>`.
2. Exactly one canonical URL.
3. Non-empty title and meta description.
4. No AdSense script or element on excluded routes.
5. Every internal link resolves to an output file or declared redirect.
6. `robots.txt`, `sitemap-index.xml`, `rss.xml`, and `ads.txt` exist.
7. Every informative image has non-empty `alt`; decorative images have `alt=""`.
8. Optional environment variables `EXPECTED_INSIGHTS` and `EXPECTED_PROJECTS` enforce exact content counts when set.

- [ ] **Step 6：加入瀏覽器 SEO 測試**

Create `tests/e2e/seo.spec.ts`:

```ts
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
```

- [ ] **Step 7：驗證並提交**

Run:

```powershell
npm.cmd test -- tests/unit/seo.test.ts
npm.cmd run test:e2e -- tests/e2e/seo.spec.ts --project=chromium
```

Expected: tests PASS.

Commit:

```powershell
git add src/lib/seo.ts src/components/SiteHead.astro src/layouts/BaseLayout.astro src/pages/rss.xml.ts public/robots.txt public/ads.txt scripts/verify-build.mjs tests/unit/seo.test.ts tests/e2e/seo.spec.ts
git commit -m "feat: add SEO and feed infrastructure"
```

### Task 5：建立首頁、內容索引與卡片

**Files:**
- Create: `src/components/HeroSignal.astro`
- Create: `src/components/InsightCard.astro`
- Create: `src/components/ProjectCard.astro`
- Modify: `src/pages/index.astro`
- Create: `src/pages/insights/index.astro`
- Create: `src/pages/projects/index.astro`
- Test: `tests/e2e/content-routes.spec.ts`

**Interfaces:**
- `InsightCard` consumes one `CollectionEntry<"insights">`.
- `ProjectCard` consumes one `CollectionEntry<"projects">`.
- Index routes consume `selectVisibleEntries` and `sortNewestFirst`.

- [ ] **Step 1：先寫首頁順序與索引測試**

Create `tests/e2e/content-routes.spec.ts`:

```ts
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
  await expect(page.getByRole("heading", { name: "觀點與教學" })).toBeVisible();
  await page.goto("/projects");
  await expect(page.getByRole("heading", { name: "作品案例" })).toBeVisible();
});
```

- [ ] **Step 2：確認測試先失敗**

Run:

```powershell
npm.cmd run test:e2e -- tests/e2e/content-routes.spec.ts --project=chromium
```

Expected: FAIL because final homepage sections and index routes do not exist.

- [ ] **Step 3：實作卡片介面**

`InsightCard.astro` shows title, description, published date, category, tags, and a link whose accessible name starts with `閱讀：`.

`ProjectCard.astro` shows title, description, status, tags, internal case link, and a separately labeled external project link.

Both use semantic `<article>` and remain usable at 200% zoom.

- [ ] **Step 4：實作核准的首頁順序**

Render in this order:

```astro
<HeroSignal />
<section aria-labelledby="featured-heading"><h2 id="featured-heading">焦點觀點</h2></section>
<section aria-labelledby="latest-heading"><h2 id="latest-heading">最新訊號</h2></section>
<section aria-labelledby="projects-heading"><h2 id="projects-heading">作品實證</h2></section>
<section aria-labelledby="author-heading"><h2 id="author-heading">關於賽腦耶</h2></section>
<section aria-labelledby="topics-heading"><h2 id="topics-heading">探索主題</h2></section>
```

Empty collections show a clear editorial-state message instead of an empty grid.

- [ ] **Step 5：實作索引頁**

Both index pages:

1. Sort newest first.
2. Exclude drafts unless `PUBLIC_SHOW_DRAFTS=true`.
3. Display visible entry count.
4. Render no ad component.

- [ ] **Step 6：驗證並提交**

Run:

```powershell
npm.cmd run test:e2e -- tests/e2e/content-routes.spec.ts --project=chromium
```

Expected: tests PASS.

Commit:

```powershell
git add src/components/HeroSignal.astro src/components/InsightCard.astro src/components/ProjectCard.astro src/pages/index.astro src/pages/insights/index.astro src/pages/projects/index.astro tests/e2e/content-routes.spec.ts
git commit -m "feat: add homepage and content indexes"
```

### Task 6：建立文章與作品案例詳細頁

**Files:**
- Create: `src/components/ArticleMeta.astro`
- Create: `src/components/SourceList.astro`
- Create: `src/layouts/ArticleLayout.astro`
- Create: `src/pages/insights/[slug].astro`
- Create: `src/pages/projects/[slug].astro`
- Create: `src/content/insights/fixture.md`
- Create: `src/content/projects/fixture.md`
- Modify: `tests/e2e/content-routes.spec.ts`

**Interfaces:**
- `ArticleLayout` consumes `{ entry, kind, pathname }`.
- `SourceList` consumes `{ sources: Array<{ title: string; url: string }> }`.
- Detail routes produce static paths from visible collection entries.

- [ ] **Step 1：建立完整測試資料**

Create `src/content/insights/fixture.md`:

```markdown
---
title: 內容詳細頁測試文章
description: 這是一篇專門用於驗證文章詳細頁作者、日期、來源、AI 協作揭露與版面呈現的完整測試內容。
publishedAt: 2026-07-24
updatedAt: 2026-07-24
category: 實作教學
tags: [測試]
author: 賽腦耶
sources:
  - title: Astro Documentation
    url: https://docs.astro.build/
aiAssisted: true
draft: true
featured: false
seoTitle: 內容詳細頁測試文章｜Simon Synapse
seoDescription: 驗證 Simon Synapse 文章詳細頁的作者、日期、來源與 AI 協作揭露。
socialImage: /images/og/simon-synapse-default.png
---

## 測試內容

這段內容只驗證版型，不會進入正式建置。
```

Create `src/content/projects/fixture.md`:

```markdown
---
title: 作品案例詳細頁測試內容
description: 這是一篇專門用於驗證作品案例作者、日期、來源、狀態與版面呈現的完整測試內容。
publishedAt: 2026-07-24
updatedAt: 2026-07-24
category: 作品紀錄
tags: [測試]
author: 賽腦耶
sources:
  - title: Astro Documentation
    url: https://docs.astro.build/
aiAssisted: true
draft: true
featured: false
seoTitle: 作品案例詳細頁測試｜Simon Synapse
seoDescription: 驗證 Simon Synapse 作品案例頁面的作者、日期、來源、狀態與 AI 協作揭露。
socialImage: /images/og/simon-synapse-default.png
projectUrl: https://example.com/
status: 持續改進
---

## 測試內容

這段內容只驗證作品版型，不會進入正式建置。
```

- [ ] **Step 2：加入失敗中的詳細頁測試**

Append:

```ts
test("detail page exposes author, dates, sources, and AI disclosure", async ({
  page,
}) => {
  await page.goto("/insights/fixture");
  await expect(page.getByText("作者：賽腦耶")).toBeVisible();
  await expect(page.getByText("AI 協作揭露")).toBeVisible();
  await expect(page.getByRole("heading", { name: "參考來源" })).toBeVisible();
});
```

Run with `PUBLIC_SHOW_DRAFTS=true`.

Expected: FAIL because detail templates do not exist.

- [ ] **Step 3：實作 ArticleLayout**

Render:

1. Breadcrumbs.
2. Category and tags.
3. One `<h1>`.
4. Description.
5. Author, published date, updated date, AI collaboration disclosure.
6. Markdown content inside `.reading-column`.
7. Source list.
8. Fixed site disclaimer.
9. Optional ad slots supplied only by an eligible detail route.

Insights use `BlogPosting` JSON-LD. Project cases use `CreativeWork` JSON-LD unless verified evidence supports a more specific type.

- [ ] **Step 4：實作靜態詳細頁**

Both detail routes use this visibility contract:

```ts
export async function getStaticPaths() {
  const entries = await getCollection("insights");
  const visible = selectVisibleEntries(entries, {
    showDrafts: import.meta.env.PUBLIC_SHOW_DRAFTS === "true",
  });
  return visible.map((entry) => ({
    params: { slug: entry.id.replace(/\.(md|mdx)$/, "") },
    props: { entry },
  }));
}
```

The project route changes only the collection name. Both render Markdown through `await render(entry)`.

- [ ] **Step 5：驗證並提交**

Run:

```powershell
$env:PUBLIC_SHOW_DRAFTS="true"
npm.cmd run test:e2e -- tests/e2e/content-routes.spec.ts --project=chromium
Remove-Item Env:PUBLIC_SHOW_DRAFTS
```

Expected: detail tests PASS.

Commit:

```powershell
git add src/components/ArticleMeta.astro src/components/SourceList.astro src/layouts/ArticleLayout.astro src/pages/insights/[slug].astro src/pages/projects/[slug].astro src/content/insights/fixture.md src/content/projects/fixture.md tests/e2e/content-routes.spec.ts
git commit -m "feat: add content detail templates"
```

### Task 7：建立信任與政策頁面

**Files:**
- Create: `src/pages/about.astro`
- Create: `src/pages/contact.astro`
- Create: `src/pages/privacy.astro`
- Create: `src/pages/terms.astro`
- Create: `src/pages/editorial-policy.astro`
- Create: `src/pages/disclaimer.astro`
- Create: `src/pages/404.astro`
- Modify: `tests/e2e/content-routes.spec.ts`

**Interfaces:**
- Produces: seven non-ad routes.
- Consumes: `BaseLayout`, `profileJsonLd`, `SITE.githubUrl`.

- [ ] **Step 1：加入政策路由測試**

Append:

```ts
for (const path of [
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/editorial-policy",
  "/disclaimer",
  "/404",
]) {
  test(`${path} has one h1 and no ad element`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator(".adsbygoogle")).toHaveCount(0);
  });
}
```

Run and expect failure on missing routes.

- [ ] **Step 2：撰寫完整政策內容**

Required sections:

- `/about`：品牌目的、作者「賽腦耶」、創作方法、作品、AI 協作揭露。
- `/contact`：`https://github.com/tswu5168`、適合聯絡的事項、不保證回覆、不虛構電子郵件。
- `/privacy`：Cloudflare、分析、AdSense、Google 資料用途、Cookie、本機字級偏好、同意撤回、外部連結、政策更新。
- `/terms`：教育用途、智慧財產權、可接受使用、服務可用性、外部網站、責任限制。
- `/editorial-policy`：第一手證據、來源、勘誤、AI 協作、人工核准、日期與修訂、禁止大量低價值內容。
- `/disclaimer`：不構成投資、投注或財務建議；不保證收益、中獎、準確率或財富自由；彩券長期期望值為負且限成年人。
- `/404`：錯誤說明、首頁、文章與作品入口。

Every page uses the reading column and renders no ad component.

- [ ] **Step 3：驗證並提交**

Run:

```powershell
npm.cmd run test:e2e -- tests/e2e/content-routes.spec.ts --project=chromium
```

Expected: policy route tests PASS.

Commit:

```powershell
git add src/pages/about.astro src/pages/contact.astro src/pages/privacy.astro src/pages/terms.astro src/pages/editorial-policy.astro src/pages/disclaimer.astro src/pages/404.astro tests/e2e/content-routes.spec.ts
git commit -m "feat: add trust and policy pages"
```

### Task 8：撰寫 5 篇可查證的作品案例草稿

**Files:**
- Create: `src/content/projects/xiaosai-ai-lottery.md`
- Create: `src/content/projects/fifa-ai-prediction.md`
- Create: `src/content/projects/ssa-compressor.md`
- Create: `src/content/projects/exam-roadmap.md`
- Create: `src/content/projects/matt-pocock-skills-guide.md`
- Delete: `src/content/projects/fixture.md`

**Interfaces:**
- Produces: five typed project entries.
- Consumes: live sites, available repositories, user-provided facts, and editorial policy.

- [ ] **Step 1：先取得唯讀證據**

For every project, record HTTP status, title, purpose, major features, privacy behavior, known limits, and available repository evidence:

```text
https://lotto.simonsynapse.net/
https://sfiimfoan.simonsynapse.net/
https://ssacompressor.simonsynapse.net/
https://tswu5168.github.io/exam-roadmap/
https://mps.simonsynapse.net/
```

If a site is unavailable, say so in the draft and use only verified repository or user evidence.

- [ ] **Step 2：建立 5 篇草稿**

Every file uses:

```yaml
author: 賽腦耶
aiAssisted: true
draft: true
featured: false
socialImage: /images/og/simon-synapse-default.png
category: 作品紀錄
status: 持續改進
```

Every body contains:

```markdown
## 問題與動機
## 我做了什麼
## 核心設計選擇
## 實際成果
## 限制與風險
## 目前狀態
## 後續方向
```

Each case targets 700–1,400 Traditional Chinese characters excluding frontmatter and source URLs. The threshold is an internal editorial check, not an AdSense rule; insufficient evidence keeps the case in draft instead of padding it with generic text.

Evidence rules:

- Lottery：說明已驗證的方法沒有顯著優於隨機選號；包含成年、理性娛樂與負期望值警語。
- FIFA：只描述可在網站或程式碼驗證的方法；沒有量測證據時不宣稱準確率。
- Compressor：先檢查程式碼與瀏覽器網路行為，才可聲稱本機處理。
- Exam Roadmap：區分校方確認日期與推估日期。
- MPS Guide：涵蓋 skills 蒐集、繁體中文翻譯、用途、觸發詞、分類、搜尋及可攜式 HTML。

- [ ] **Step 3：驗證、移除 fixture 並提交**

Run:

```powershell
$env:PUBLIC_SHOW_DRAFTS="true"
npm.cmd exec -- astro check
npm.cmd run test:e2e -- tests/e2e/content-routes.spec.ts --project=chromium
Remove-Item Env:PUBLIC_SHOW_DRAFTS
```

Expected: five project cards and routes render in Preview mode.

Commit:

```powershell
git add src/content/projects
git commit -m "content: add five project case drafts"
```

### Task 9：撰寫 6 篇原創觀點草稿

**Files:**
- Create: `src/content/insights/why-simon-synapse.md`
- Create: `src/content/insights/idea-to-real-product.md`
- Create: `src/content/insights/ai-tools-as-digital-assets.md`
- Create: `src/content/insights/privacy-first-local-video-compression.md`
- Create: `src/content/insights/honest-prediction-models.md`
- Create: `src/content/insights/designing-an-actionable-exam-roadmap.md`
- Delete: `src/content/insights/fixture.md`

**Interfaces:**
- Produces: six typed insight entries.
- Consumes: verified project evidence and primary technical sources.

- [ ] **Step 1：建立來源帳本**

Each article receives at least one authoritative source. Technical claims use primary documentation or research. First-person statements must trace to a user statement, repository action, or verified result.

- [ ] **Step 2：建立 6 篇草稿**

Every file uses `author: 賽腦耶`, `aiAssisted: true`, `draft: true`, and the default social image.

| File | Required claim boundary |
|---|---|
| `why-simon-synapse.md` | Explain the brand and digital-asset goal without promising income. |
| `idea-to-real-product.md` | Use a real lifecycle: problem, smallest useful version, verification, deployment, iteration. |
| `ai-tools-as-digital-assets.md` | Separate owned assets, distribution, maintenance, and uncertain revenue outcomes. |
| `privacy-first-local-video-compression.md` | Verify code and browser traffic before claiming on-device processing. |
| `honest-prediction-models.md` | Explain baseline, holdout, leakage, randomness, and evidence requirements. |
| `designing-an-actionable-exam-roadmap.md` | Explain phases, weekly plan, confirmed dates, tentative dates, review cadence, and change control. |

Every body contains:

```markdown
## 問題
## 我的判斷
## 實作方法
## 證據與限制
## 可以怎麼開始
## 結語
```

Each insight targets 1,000–1,800 Traditional Chinese characters excluding frontmatter and source URLs. The article remains concise when the evidence does not support additional claims; word count never justifies filler or invented experience.

- [ ] **Step 3：驗證、移除 fixture 並提交**

Run:

```powershell
$env:PUBLIC_SHOW_DRAFTS="true"
npm.cmd exec -- astro check
npm.cmd run test:e2e -- tests/e2e/content-routes.spec.ts --project=chromium
Remove-Item Env:PUBLIC_SHOW_DRAFTS
```

Expected: six insight cards and routes render in Preview mode.

Commit:

```powershell
git add src/content/insights
git commit -m "content: add six original insight drafts"
```

### Task 10：加入 OG 圖片、AdSense 雙重閘門與同意撤回

**Files:**
- Create: `scripts/generate-og-image.mjs`
- Create: `public/images/og/simon-synapse-default.png`
- Create: `src/components/AdSlot.astro`
- Create: `src/components/ConsentManager.astro`
- Modify: `src/components/SiteFooter.astro`
- Modify: `src/components/SiteHead.astro`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/layouts/ArticleLayout.astro`
- Verify: `public/ads.txt`
- Test: `tests/e2e/ads.spec.ts`

**Interfaces:**
- `AdSlot` consumes `{ slot: string, pathname: string }`.
- `BaseLayout` and `SiteHead` consume `loadAds?: boolean`.
- `ConsentManager` consumes `{ enabled: boolean }`.
- Consumes: `ADS` and `isAdEligible`.

- [ ] **Step 1：先寫廣告治理測試**

Create `tests/e2e/ads.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("eligible detail renders exactly two governed slots", async ({ page }) => {
  const response = await page.goto("/insights/why-simon-synapse");
  expect(response?.status()).toBe(200);
  await expect(page.locator(".adsbygoogle")).toHaveCount(2);
  await expect(page.locator('script[src*="pagead2.googlesyndication.com"]')).toHaveCount(1);
});

test("excluded pages render neither units nor script", async ({ page }) => {
  for (const path of ["/", "/privacy", "/terms", "/contact", "/404"]) {
    await page.goto(path);
    await expect(page.locator(".adsbygoogle")).toHaveCount(0);
    await expect(page.locator('script[src*="pagead2.googlesyndication.com"]')).toHaveCount(0);
  }
});
```

Run:

```powershell
$env:PUBLIC_SHOW_DRAFTS="true"
$env:PUBLIC_ADS_ENABLED="true"
$env:PUBLIC_AD_SLOT_INLINE="1111111111"
$env:PUBLIC_AD_SLOT_END="2222222222"
npm.cmd run test:e2e -- tests/e2e/ads.spec.ts --project=chromium
Remove-Item Env:PUBLIC_SHOW_DRAFTS
Remove-Item Env:PUBLIC_ADS_ENABLED
Remove-Item Env:PUBLIC_AD_SLOT_INLINE
Remove-Item Env:PUBLIC_AD_SLOT_END
```

Expected: FAIL because governed ad components do not exist.

- [ ] **Step 2：實作 AdSlot 與合格頁面 script**

`AdSlot.astro` returns no HTML unless:

```ts
const allowed = isAdEligible(pathname) && Boolean(slot);
```

When allowed:

```astro
<aside class="ad-region" aria-label="廣告">
  <ins
    class="adsbygoogle"
    style="display:block"
    data-ad-client={ADS.clientId}
    data-ad-slot={slot}
    data-ad-format="auto"
    data-full-width-responsive="true"></ins>
</aside>
<script is:inline>
  (window.adsbygoogle = window.adsbygoogle || []).push({});
</script>
```

Only `ArticleLayout` may render `AdSlot`, once after the opening content and once near the end. It calculates `adsEligible = isAdEligible(pathname)` and passes that value as `loadAds` through `BaseLayout` to `SiteHead`.

`SiteHead.astro` loads the AdSense script only when both conditions are true:

```astro
{loadAds && ADS.enabled && (
  <script
    async
    crossorigin="anonymous"
    src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADS.clientId}`}
  ></script>
)}
```

Production slot variables stay unset until real responsive units exist. An unset slot renders nothing.

- [ ] **Step 3：實作同意撤回控制**

`ConsentManager.astro` renders a hidden button only when ads are enabled. Use:

```js
window.googlefc = window.googlefc || {};
window.googlefc.callbackQueue = window.googlefc.callbackQueue || [];
window.googlefc.callbackQueue.push({
  CONSENT_API_READY: () => {
    const button = document.querySelector("#privacy-settings");
    if (button instanceof HTMLButtonElement) {
      button.hidden = false;
      button.addEventListener("click", () => window.googlefc.showRevocationMessage());
    }
  },
});
```

Visible label: `隱私權與 Cookie 設定`. Place it in `SiteFooter`. Do not use a `javascript:` URL.

- [ ] **Step 4：產生可重現的預設 OG 圖片**

`generate-og-image.mjs` uses `sharp` to create a `1200 × 630` PNG with:

- Background `#050816`.
- Cyan, violet, and magenta gradients.
- Text `SIMON SYNAPSE`.
- Text `AI × DATA × BUILD`.
- No external font or image request.

Run:

```powershell
npm.cmd run generate:og
```

Expected: the PNG exists and is exactly `1200 × 630`.

- [ ] **Step 5：確認 ads.txt 與廣告行為**

Verify `public/ads.txt` is exactly:

```text
google.com, pub-7384783799477371, DIRECT, f08c47fec0942fa0
```

Run the environment-enabled test from Step 1 again.

Expected: eligible article renders two units and one script; excluded pages render neither.

- [ ] **Step 6：提交**

```powershell
git add scripts/generate-og-image.mjs public/images/og/simon-synapse-default.png src/components/AdSlot.astro src/components/ConsentManager.astro src/components/SiteFooter.astro src/components/SiteHead.astro src/layouts/BaseLayout.astro src/layouts/ArticleLayout.astro public/ads.txt tests/e2e/ads.spec.ts
git commit -m "feat: add governed AdSense integration"
```

### Task 11：擷取舊樂透路由並產生明確轉址

**Files:**
- Create: `scripts/audit-legacy-routes.mjs`
- Create: `scripts/build-redirects.mjs`
- Modify: `data/legacy-routes.json`
- Create: `public/_redirects`
- Test: `tests/unit/redirects.test.ts`

**Interfaces:**
- `audit-legacy-routes.mjs` reads the current root sitemap before cutover.
- `buildRedirects(routes)` produces explicit Cloudflare Pages `301` lines.
- Reserved brand routes never redirect.

- [ ] **Step 1：先寫轉址規則測試**

Create `tests/unit/redirects.test.ts`:

```ts
import { describe, expect, it } from "vitest";
// @ts-expect-error The JavaScript module is exercised directly by Vitest.
import { buildRedirectLines } from "../../scripts/build-redirects.mjs";

describe("legacy redirects", () => {
  it("redirects lottery content and preserves brand routes", () => {
    const lines = buildRedirectLines([
      "/articles/randomness",
      "/about",
      "/contact",
      "/privacy",
      "/faq",
    ]);
    expect(lines).toContain(
      "/articles/randomness https://lotto.simonsynapse.net/articles/randomness 301",
    );
    expect(lines).toContain("/faq https://lotto.simonsynapse.net/faq 301");
    expect(lines.join("\n")).not.toContain("/about ");
    expect(lines.join("\n")).not.toContain("/contact ");
    expect(lines.join("\n")).not.toContain("/privacy ");
  });
});
```

Run and expect failure because the generator does not exist.

- [ ] **Step 2：實作明確轉址產生器**

Create `scripts/build-redirects.mjs` with:

```js
export const RESERVED = new Set([
  "/",
  "/insights",
  "/projects",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/editorial-policy",
  "/disclaimer",
  "/404",
  "/rss.xml",
]);

export function buildRedirectLines(routes) {
  return [...new Set(routes)]
    .filter((route) => route.startsWith("/") && !RESERVED.has(route))
    .sort()
    .map((route) => `${route} https://lotto.simonsynapse.net${route} 301`);
}
```

When executed directly, read `data/legacy-routes.json` and write one line per route to `public/_redirects`. Never add a wildcard catch-all.

- [ ] **Step 3：實作唯讀舊站盤點**

`audit-legacy-routes.mjs`:

1. Tries `https://simonsynapse.net/sitemap-index.xml`, then `https://simonsynapse.net/sitemap.xml`.
2. Follows child sitemaps when an index is found.
3. Extracts only `https://simonsynapse.net` pathnames.
4. Writes capture time, successful source URL, and sorted unique routes.
5. Refuses to overwrite the current JSON when zero routes are found.

- [ ] **Step 4：切換前擷取、驗證及提交**

Run:

```powershell
npm.cmd run audit:legacy
npm.cmd run generate:redirects
npm.cmd test -- tests/unit/redirects.test.ts
```

Perform read-only HTTP checks for every generated `https://lotto.simonsynapse.net{route}` target. No redirect may point back to the root domain.

Commit:

```powershell
git add scripts/audit-legacy-routes.mjs scripts/build-redirects.mjs data/legacy-routes.json public/_redirects tests/unit/redirects.test.ts
git commit -m "feat: preserve legacy lottery routes"
```

### Task 12：完成自動化品質閘門與 GitHub Actions

**Files:**
- Modify: `tests/e2e/accessibility.spec.ts`
- Modify: `tests/e2e/font-size.spec.ts`
- Modify: `tests/e2e/seo.spec.ts`
- Modify: `tests/e2e/ads.spec.ts`
- Modify: `scripts/verify-build.mjs`
- Create: `.github/workflows/ci.yml`
- Create: `README.md`
- Create: `docs/operations/cloudflare-preview-checklist.md`

**Interfaces:**
- Produces: local and CI release gates.
- Consumes: every public route and component from Tasks 1–11.

- [ ] **Step 1：加入 axe-core、200% 放大與鍵盤測試**

For `/`, one insight, one project, `/about`, `/privacy`, and `/404`:

```ts
const results = await new AxeBuilder({ page }).analyze();
expect(results.violations.filter((item) => item.impact === "critical")).toEqual([]);
expect(results.violations.filter((item) => item.impact === "serious")).toEqual([]);
```

Also verify:

1. `scrollWidth <= clientWidth` at 360 px, 768 px, and 1440 px.
2. The same reflow condition at browser zoom 200%.
3. First Tab reaches `跳至主要內容`.
4. Skip link reaches main content.
5. Focus is visibly indicated.
6. Mobile `<details>` navigation works without client JavaScript.
7. Reduced-motion removes decorative animation over `0.01ms`.

- [ ] **Step 2：加入廣告失敗模式**

With ads enabled and fake slot IDs, intercept the Google script and return an empty response. Assert:

- At most two slots on eligible detail pages.
- Zero slot and zero script on excluded pages.
- Blocking the script does not hide content or create horizontal overflow.
- No copy encourages clicks.

With ads disabled, assert zero slot and zero script on every tested page.

- [ ] **Step 3：完成輸出驗證器**

When these environment variables are set:

```text
EXPECTED_INSIGHTS=6
EXPECTED_PROJECTS=5
```

the verifier requires exactly six insight and five project detail pages. Without the variables, it checks structure but does not enforce counts. This permits draft-free production builds before editorial approval and exact-count Preview builds.

- [ ] **Step 4：建立 GitHub Actions**

Create `.github/workflows/ci.yml`:

```yaml
name: ci

on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24.18.0
          cache: npm
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run check
      - name: Verify draft-free production build
        run: npm run build
        env:
          PUBLIC_SHOW_DRAFTS: "false"
          PUBLIC_ADS_ENABLED: "false"
      - name: Verify preview routes
        run: npm run test:e2e -- --project=chromium
        env:
          PUBLIC_SHOW_DRAFTS: "true"
          PUBLIC_ADS_ENABLED: "false"
```

- [ ] **Step 5：撰寫 README 與 Preview 驗收表**

`README.md` states:

```text
Local preview: npm.cmd run dev
Full verification: npm.cmd run check; npm.cmd run build; npm.cmd run test:e2e
Production branch: main
Cloudflare build command: npm run build
Cloudflare output directory: dist
Node version: 24.18.0
```

It also explains content paths, required frontmatter, Preview review, production flags, and automatic deployment from `main`.

`cloudflare-preview-checklist.md` includes date, device, browser, viewport, large-text result, 200% result, keyboard result, reduced-motion result, deployment URL, deployment ID, and commit SHA.

- [ ] **Step 6：執行完整 Preview 閘門**

Run:

```powershell
npm.cmd run check
$env:PUBLIC_SHOW_DRAFTS="true"
$env:PUBLIC_ADS_ENABLED="false"
$env:EXPECTED_INSIGHTS="6"
$env:EXPECTED_PROJECTS="5"
npm.cmd run build
npm.cmd run test:e2e
Remove-Item Env:PUBLIC_SHOW_DRAFTS
Remove-Item Env:PUBLIC_ADS_ENABLED
Remove-Item Env:EXPECTED_INSIGHTS
Remove-Item Env:EXPECTED_PROJECTS
```

Expected: unit tests, Astro check, exact-count build, Chromium, Firefox, and mobile tests PASS.

- [ ] **Step 7：執行實體裝置驗收並提交**

Check one physical phone and one Windows desktop. Record browser version, date, standard text, large text, 200% zoom, keyboard, and reduced-motion evidence.

Commit:

```powershell
git add tests/e2e scripts/verify-build.mjs .github/workflows/ci.yml README.md docs/operations/cloudflare-preview-checklist.md
git commit -m "test: enforce release quality"
```

### Task 13：建立 GitHub 儲存庫與 Cloudflare Preview

**Files:**
- Modify: `docs/operations/cloudflare-preview-checklist.md`

**Interfaces:**
- Produces: GitHub status checks and Cloudflare Preview URL.
- Consumes: clean local repository and Task 12 release gate.

- [ ] **Step 1：建立並推送獨立 GitHub 儲存庫**

Create user-owned repository `simon-synapse-site`, add it as `origin`, and push `main`.

Verify:

```powershell
git remote -v
git status --short
git log -1 --oneline
```

Expected: intended remote, clean status, and matching latest commit.

- [ ] **Step 2：連接 Cloudflare Pages Git integration**

Use:

```text
Repository: simon-synapse-site
Production branch: main
Build command: npm run build
Build output directory: dist
Node version: 24.18.0
Production PUBLIC_SHOW_DRAFTS: false
Production PUBLIC_ADS_ENABLED: false
Preview PUBLIC_SHOW_DRAFTS: true
Preview PUBLIC_ADS_ENABLED: false
```

- [ ] **Step 3：驗證 Preview**

Verify the `*.pages.dev` Preview:

- Home and fixed routes return `200`.
- Six draft insights and five draft projects are available.
- No AdSense request occurs.
- `ads.txt`, robots, sitemap, and RSS are readable.
- Large-text preference persists.
- Mobile has no horizontal overflow.
- GitHub CI and Cloudflare deployment checks pass.

Record Preview URL, deployment ID, commit SHA, date, and results.

- [ ] **Step 4：提交 Preview 證據**

```powershell
git add docs/operations/cloudflare-preview-checklist.md
git commit -m "docs: record Cloudflare preview verification"
git push
```

## Phase B：人工核准、根網域切換與 AdSense 再審查

### Task 14：完成人工編輯審查並發布 11 篇內容

**Files:**
- Modify: all 11 Markdown files under `src/content/insights/` and `src/content/projects/`
- Modify: `docs/operations/cloudflare-preview-checklist.md`

**Interfaces:**
- Produces: exactly 6 public insights and 5 public projects.
- Consumes: user approval for claims, tone, authorship, sources, and disclosures.

- [ ] **Step 1：逐篇提供人工審查**

For every draft, present title, summary, first-person claims, sources, AI disclosure, limitation statements, and proposed publication date. Do not publish without user confirmation.

- [ ] **Step 2：套用核准修正**

Change only the content corrected by the user. Preserve sources and limitations. Set `updatedAt` to the correction date.

- [ ] **Step 3：發布核准項目**

Set all approved launch entries:

```yaml
draft: false
```

Set exactly one insight and no more than three projects to `featured: true`.

- [ ] **Step 4：執行 production 內容閘門**

Run:

```powershell
$env:PUBLIC_SHOW_DRAFTS="false"
$env:PUBLIC_ADS_ENABLED="false"
$env:EXPECTED_INSIGHTS="6"
$env:EXPECTED_PROJECTS="5"
npm.cmd run build
npm.cmd run test:e2e
Remove-Item Env:PUBLIC_SHOW_DRAFTS
Remove-Item Env:PUBLIC_ADS_ENABLED
Remove-Item Env:EXPECTED_INSIGHTS
Remove-Item Env:EXPECTED_PROJECTS
```

Expected: 6 insights, 5 projects, zero drafts, and zero AdSense script.

- [ ] **Step 5：提交**

```powershell
git add src/content docs/operations/cloudflare-preview-checklist.md
git commit -m "content: publish approved launch collection"
git push
```

### Task 15：以可回復方式切換根網域

**Files:**
- Create: `docs/operations/production-cutover-checklist.md`
- Modify: `README.md`

**Interfaces:**
- Produces: new hub at `simonsynapse.net`.
- Preserves: lottery subdomain and explicit legacy redirects.
- Consumes: approved Preview and explicit cutover authorization.

- [ ] **Step 1：記錄切換前狀態**

Record:

- Root HTTP status, title, canonical, sitemap, robots, and TLS.
- Lottery subdomain HTTP status and title.
- Current production deployment ID.
- Approved Preview deployment ID and commit SHA.
- DNS records relevant to root and `www`.

- [ ] **Step 2：重跑所有唯讀檢查**

Run the full production gate and check every legacy redirect target. Stop on any broken internal route, lottery target, sitemap, policy page, mobile view, or 200% zoom result.

- [ ] **Step 3：綁定根網域**

Attach `simonsynapse.net` through Cloudflare Pages Custom Domains. Keep the previous successful deployment available. Wait for TLS to become active.

Enable Cloudflare Web Analytics for the production site. Do not add GA4. Verify the analytics beacon loads without changing the approved privacy page wording or introducing a second analytics product.

- [ ] **Step 4：設定 `www` 單次永久轉址**

Redirect:

```text
https://www.simonsynapse.net/*
```

to the same path and query on:

```text
https://simonsynapse.net/
```

Use one `301` hop.

- [ ] **Step 5：從外部驗證正式環境**

Verify:

- Home, indexes, all policy routes, one insight, and one project return `200`.
- `www` uses one `301` hop.
- Legacy routes use one `301` hop to matching lottery paths.
- Canonical values use the root domain.
- `ads.txt`, sitemap, robots, and RSS are readable.
- No AdSense script loads while the flag is false.
- Cloudflare Web Analytics is enabled and the production dashboard receives a test page view.

- [ ] **Step 6：失敗時回復**

If root pages fail, redirect loops appear, or lottery content becomes unavailable:

1. Roll back to the recorded successful Cloudflare production deployment.
2. Verify the prior behavior returns.
3. Record HTTP evidence and both deployment IDs.
4. Correct Git source before another cutover.

- [ ] **Step 7：記錄並提交證據**

```powershell
git add docs/operations/production-cutover-checklist.md README.md
git commit -m "docs: record production cutover"
git push
```

### Task 16：完成 Search Console、CMP 與 AdSense 再審查

**Files:**
- Create: `docs/operations/adsense-review-checklist.md`
- Modify: `docs/operations/production-cutover-checklist.md`

**Interfaces:**
- Produces: verified AdSense re-review submission.
- Consumes: stable production site and current AdSense account state.

- [ ] **Step 1：驗證 Search Console**

In the `simonsynapse.net` domain property:

1. Submit `https://simonsynapse.net/sitemap-index.xml`.
2. Inspect `/`, one insight, one project, `/about`, and `/privacy`.
3. Record reachable and indexing-eligibility states.
4. Do not claim indexed status before Search Console reports it.

- [ ] **Step 2：驗證 ads.txt**

Confirm `https://simonsynapse.net/ads.txt` returns:

```text
google.com, pub-7384783799477371, DIRECT, f08c47fec0942fa0
```

Use AdSense `Check for updates`. Record the displayed status and time.

- [ ] **Step 3：設定 Google CMP**

In AdSense Privacy & Messaging:

1. Configure the Google-certified European regulations message.
2. Include consent, do-not-consent, and manage-options choices.
3. Configure applicable US state privacy messaging.
4. Verify `隱私權與 Cookie 設定` appears only when the API is ready.
5. Verify the control reopens the consent flow.

- [ ] **Step 4：建立兩個真實響應式廣告單元**

Create:

- `simon-insight-inline`
- `simon-content-end`

Store numeric IDs only in Cloudflare:

```text
PUBLIC_AD_SLOT_INLINE
PUBLIC_AD_SLOT_END
```

Do not store them in source control.

- [ ] **Step 5：啟用並驗證廣告**

Before enabling the root site, audit these existing sites by inspecting rendered HTML and network requests for `ca-pub-7384783799477371`, `adsbygoogle`, and `pagead2.googlesyndication.com`:

```text
https://lotto.simonsynapse.net/
https://sfiimfoan.simonsynapse.net/
https://ssacompressor.simonsynapse.net/
https://mps.simonsynapse.net/
```

If any subdomain still contains AdSense code, first identify its active GitHub and Cloudflare deployment source with read-only checks. Remove only the AdSense script and units from that source, run its existing tests, redeploy it, and verify the project itself still works. Do not guess a repository from its hostname.

Set `PUBLIC_ADS_ENABLED=true` only after subdomains are confirmed ad-free and CMP and placement checks pass. Verify:

- Eligible detail templates load the script.
- Excluded pages load neither script nor unit.
- Each eligible page has at most two units.
- Ad blocking and no-fill preserve the layout.
- No copy encourages clicks.
- Existing subdomains remain ad-free.

- [ ] **Step 6：提交 AdSense 再審查**

Record the issue label displayed before submission, submission time, site status, production commit SHA, content URLs, Search Console state, ads.txt state, CMP state, and placement evidence. Submit only after every item passes. Do not remove and re-add the site during review.

- [ ] **Step 7：提交非敏感證據**

Do not commit screenshots with private account details.

```powershell
git add docs/operations/adsense-review-checklist.md docs/operations/production-cutover-checklist.md
git commit -m "docs: record AdSense review readiness"
git push
```

## Final Verification

Run locally:

```powershell
npm.cmd ci
npm.cmd run check
$env:PUBLIC_SHOW_DRAFTS="false"
$env:PUBLIC_ADS_ENABLED="false"
$env:EXPECTED_INSIGHTS="6"
$env:EXPECTED_PROJECTS="5"
npm.cmd run build
npm.cmd run test:e2e
Remove-Item Env:PUBLIC_SHOW_DRAFTS
Remove-Item Env:PUBLIC_ADS_ENABLED
Remove-Item Env:EXPECTED_INSIGHTS
Remove-Item Env:EXPECTED_PROJECTS
git status --short
```

Expected:

- Unit tests PASS.
- Astro check PASS.
- Production build PASS.
- Exactly 6 insights and 5 projects.
- Chromium, Firefox, and mobile projects PASS.
- No draft output.
- No AdSense script while ads are disabled.
- Git status is clean.

Verify production:

```text
https://simonsynapse.net/
https://simonsynapse.net/insights
https://simonsynapse.net/projects
https://simonsynapse.net/about
https://simonsynapse.net/contact
https://simonsynapse.net/privacy
https://simonsynapse.net/terms
https://simonsynapse.net/editorial-policy
https://simonsynapse.net/disclaimer
https://simonsynapse.net/ads.txt
https://simonsynapse.net/robots.txt
https://simonsynapse.net/sitemap-index.xml
https://simonsynapse.net/rss.xml
```

## Primary References

- [Cloudflare Pages Astro deployment](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/)
- [Cloudflare Pages Git integration](https://developers.cloudflare.com/pages/configuration/git-integration/)
- [Cloudflare Pages redirects](https://developers.cloudflare.com/pages/configuration/redirects/)
- [Cloudflare Pages rollbacks](https://developers.cloudflare.com/pages/configuration/rollbacks/)
- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)
- [Playwright installation and supported Node.js versions](https://playwright.dev/docs/intro)
- [Node.js release schedule](https://nodejs.org/en/about/previous-releases)
- [Google CMP requirements](https://support.google.com/adsense/answer/13554116?hl=en)
- [Google consent revocation API](https://developers.google.com/funding-choices/fc-api-docs?hl=en)
- [Google AdSense site review](https://support.google.com/adsense/answer/7584263?hl=zh-Hant)
- [W3C WCAG 2.2 Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced)
