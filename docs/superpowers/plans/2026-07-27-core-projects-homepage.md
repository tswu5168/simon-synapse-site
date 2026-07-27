# Fixed Core Homepage Projects Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Simon Synapse homepage publish and display exactly four approved core projects in a stable, explicit order.

**Architecture:** Add a small ordered-entry selector to the existing content utility, define the approved project Slugs beside the homepage query, and publish the four corresponding project entries. Preserve the existing `ProjectCard`, responsive grid, project index, and draft visibility gate.

**Tech Stack:** Astro 7, TypeScript 6, Vitest 4, Playwright 1.61, Cloudflare Pages, GitHub Actions.

## Global Constraints

- Homepage order is `xiaosai-ai-lottery`, `matt-pocock-skills-guide`, `fifa-ai-prediction`, `ssa-compressor`.
- The four approved project entries must be public in production.
- Missing approved Slugs must fail instead of silently reducing the homepage list.
- Keep the existing `ProjectCard`, `card-grid`, large-text accessibility behavior, and `/projects` index behavior.
- Do not embed external sites or change unrelated navigation, insights, advertising, or project content.

---

### Task 1: Lock the core project order with tests

**Files:**
- Modify: `tests/unit/content.test.ts`
- Modify: `tests/e2e/content-routes.spec.ts`
- Modify: `src/lib/content.ts`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: visible `CollectionEntry<"projects">[]` returned by the existing content gate.
- Produces: `selectEntriesInOrder<T extends { id: string }>(entries: T[], orderedIds: readonly string[]): T[]`.

- [ ] **Step 1: Add failing unit tests for ordered selection and missing Slugs**

Add the import and tests:

```ts
import {
  selectEntriesInOrder,
  selectVisibleEntries,
  sortNewestFirst,
} from "../../src/lib/content";

describe("ordered content selection", () => {
  it("returns entries in the explicitly approved order", () => {
    expect(
      selectEntriesInOrder(entries, ["newer", "older"]).map((entry) => entry.id),
    ).toEqual(["newer", "older"]);
  });

  it("throws when an approved entry is missing", () => {
    expect(() => selectEntriesInOrder(entries, ["missing"])).toThrow(
      "Missing content entry: missing",
    );
  });
});
```

- [ ] **Step 2: Run the unit test and verify RED**

Run: `npm.cmd test -- tests/unit/content.test.ts`

Expected: FAIL because `selectEntriesInOrder` is not exported.

- [ ] **Step 3: Add a failing homepage order test**

Add to `tests/e2e/content-routes.spec.ts`:

```ts
test("home displays the four approved core projects in order", async ({ page }) => {
  await page.goto("/");
  const section = page.locator('section[aria-labelledby="projects-heading"]');
  await expect(section.locator(".content-card")).toHaveCount(4);
  await expect(section.locator("h3")).toHaveText([
    "小賽 AI 樂透預測：把預測變成可驗證研究",
    "Matt Pocock Skills 繁體中文互動速查手冊",
    "2026 世界盃 AI 預測：模型、賠率與結果追蹤",
    "小賽影片壓縮器：瀏覽器本機轉碼的實作與限制",
  ]);
});
```

- [ ] **Step 4: Run the homepage test and verify RED**

Run in PowerShell:

```powershell
$env:PUBLIC_SHOW_DRAFTS='true'
npm.cmd run test:e2e -- --project=chromium --grep "four approved core projects"
```

Expected: FAIL because the current homepage selects only the first three date-sorted projects.

- [ ] **Step 5: Implement the ordered selector**

Add to `src/lib/content.ts`:

```ts
export function selectEntriesInOrder<T extends { id: string }>(
  entries: T[],
  orderedIds: readonly string[],
): T[] {
  const entriesById = new Map(
    entries.map((entry) => [entry.id.replace(/\.(md|mdx)$/, ""), entry]),
  );

  return orderedIds.map((id) => {
    const entry = entriesById.get(id);
    if (!entry) throw new Error(`Missing content entry: ${id}`);
    return entry;
  });
}
```

- [ ] **Step 6: Use the approved Slug order on the homepage**

Import `selectEntriesInOrder`, define:

```ts
const CORE_PROJECT_IDS = [
  "xiaosai-ai-lottery",
  "matt-pocock-skills-guide",
  "fifa-ai-prediction",
  "ssa-compressor",
] as const;
```

Replace `projects.slice(0, 3)` with:

```ts
const coreProjects = selectEntriesInOrder(projects, CORE_PROJECT_IDS);
```

Render `coreProjects` in the existing `ProjectCard` grid.

- [ ] **Step 7: Run focused tests and verify GREEN**

Run:

```powershell
npm.cmd test -- tests/unit/content.test.ts
$env:PUBLIC_SHOW_DRAFTS='true'
npm.cmd run test:e2e -- --project=chromium --grep "four approved core projects"
```

Expected: all focused tests PASS.

- [ ] **Step 8: Commit the behavior change**

```powershell
git add tests/unit/content.test.ts tests/e2e/content-routes.spec.ts src/lib/content.ts src/pages/index.astro
git commit -m "feat: fix homepage core project order"
```

### Task 2: Publish the four approved project cases

**Files:**
- Modify: `src/content/projects/xiaosai-ai-lottery.md`
- Modify: `src/content/projects/matt-pocock-skills-guide.md`
- Modify: `src/content/projects/fifa-ai-prediction.md`
- Modify: `src/content/projects/ssa-compressor.md`

**Interfaces:**
- Consumes: the existing `draft` content visibility gate.
- Produces: four production-visible project detail routes and four homepage cards.

- [ ] **Step 1: Verify the production build is missing the approved projects**

Run in PowerShell:

```powershell
$env:PUBLIC_SHOW_DRAFTS='false'
$env:PUBLIC_ADS_ENABLED='false'
npm.cmd run build
```

Expected before publication: the fixed selector fails with `Missing content entry` because the approved entries remain drafts.

- [ ] **Step 2: Publish exactly the four approved entries**

Change only these four frontmatter values:

```yaml
draft: false
```

Leave `exam-roadmap.md` and every insight draft unchanged.

- [ ] **Step 3: Run the complete validation suite**

Run:

```powershell
npm.cmd run check
$env:PUBLIC_SHOW_DRAFTS='false'
$env:PUBLIC_ADS_ENABLED='false'
npm.cmd run build
$env:PUBLIC_SHOW_DRAFTS='true'
npm.cmd run test:e2e -- --project=chromium
```

Expected: all checks and tests PASS; the production build contains the four approved project routes.

- [ ] **Step 4: Commit publication**

```powershell
git add src/content/projects/xiaosai-ai-lottery.md src/content/projects/matt-pocock-skills-guide.md src/content/projects/fifa-ai-prediction.md src/content/projects/ssa-compressor.md
git commit -m "content: publish four core project cases"
```

### Task 3: Push and verify Cloudflare production

**Files:**
- No source changes expected.

**Interfaces:**
- Consumes: committed branch state and existing GitHub-to-Cloudflare deployment integration.
- Produces: public homepage cards and public project detail routes at `https://simonsynapse.net`.

- [ ] **Step 1: Review the final diff and commit graph**

Run:

```powershell
git status --short --branch
git log -4 --oneline
git diff origin/main...HEAD --check
```

Expected: clean worktree and only the approved specification, tests, selector, homepage, and four frontmatter changes.

- [ ] **Step 2: Push the feature branch and main**

Push the tested commit to `origin/feature/simon-synapse-hub` and `origin/main` without force.

- [ ] **Step 3: Wait for GitHub Actions and Cloudflare Pages**

Confirm the pushed commit receives a successful GitHub Actions run and Cloudflare Pages production deployment.

- [ ] **Step 4: Verify the public homepage and routes**

Verify:

```text
https://simonsynapse.net/
https://simonsynapse.net/projects/xiaosai-ai-lottery/
https://simonsynapse.net/projects/matt-pocock-skills-guide/
https://simonsynapse.net/projects/fifa-ai-prediction/
https://simonsynapse.net/projects/ssa-compressor/
```

The homepage must return HTTP 200, contain exactly four core project cards in the approved order, and each detail route must return HTTP 200 with the correct external work link.
