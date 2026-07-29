# Kakeya Homepage Entry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 Simon Synapse 首頁既有 4 個核心作品之後，新增「掛谷猜想 3D 實驗室」第 5 張作品卡片，並完成 PR 合併與正式站驗證。

**Architecture:** 沿用首頁既有 `CORE_PROJECT_IDS`、`selectEntriesInOrder`、`ProjectCard` 與 `card-grid`。不新增元件或 Schema，只用固定 Slug 將現有 `kakeya-3d-lab` 內容加入首頁，並由 Playwright 驗證卡片數量、順序及兩個連結。

**Tech Stack:** Astro 7、TypeScript 6、Playwright 1.61、Vitest 4、GitHub Actions、Cloudflare Pages。

## Global Constraints

- 保留原 4 個核心作品及其順序，掛谷專案固定排第 5。
- 沿用既有 `ProjectCard` 與響應式 `card-grid`，不修改卡片外觀。
- 「閱讀案例」連到 `/projects/kakeya-3d-lab`；「開啟作品」連到 `https://simonsynapse.net/kakeya/interactive`。
- 不修改 3 個掛谷頁面的互動、數學內容或路由。
- 先驗證測試因缺少第 5 張卡片而失敗，再修改正式程式碼。

---

### Task 1: 以 TDD 新增首頁掛谷卡片

**Files:**
- Modify: `tests/e2e/content-routes.spec.ts:27-71`
- Modify: `src/pages/index.astro:15-21`

**Interfaces:**
- Consumes: `selectEntriesInOrder(projects, CORE_PROJECT_IDS)` 與 `src/content/projects/kakeya-3d-lab.md`。
- Produces: 首頁「作品實證」固定 5 張卡片，掛谷專案為第 5 張。

- [ ] **Step 1: 修改首頁端對端測試**

將測試名稱改為 `home displays the five approved core projects in order`，將卡片數量改為 `5`，並在標題陣列末端加入：

```ts
"掛谷猜想 3D 實驗室：互動、沉浸與數學教學",
```

再加入以下兩個連結驗證：

```ts
await expect(
  section.getByRole("link", {
    name: "閱讀案例：掛谷猜想 3D 實驗室：互動、沉浸與數學教學",
    exact: true,
  }),
).toHaveAttribute("href", "/projects/kakeya-3d-lab");
await expect(
  section.getByRole("link", {
    name: "開啟作品：掛谷猜想 3D 實驗室：互動、沉浸與數學教學 （另開新視窗）",
    exact: true,
  }),
).toHaveAttribute("href", "https://simonsynapse.net/kakeya/interactive");
```

- [ ] **Step 2: 執行測試並確認 RED**

Run:

```powershell
npx.cmd playwright test tests/e2e/content-routes.spec.ts --project=chromium --grep "home displays the five approved core projects in order"
```

Expected: FAIL，訊息顯示 `.content-card` 預期 `5`，實際為 `4`。

- [ ] **Step 3: 寫入最小正式修改**

在 `CORE_PROJECT_IDS` 的 `ssa-compressor` 後加入：

```ts
"kakeya-3d-lab",
```

- [ ] **Step 4: 執行同一測試並確認 GREEN**

Run:

```powershell
npx.cmd playwright test tests/e2e/content-routes.spec.ts --project=chromium --grep "home displays the five approved core projects in order"
```

Expected: 1 passed，0 failed。

- [ ] **Step 5: 提交首頁入口變更**

```powershell
git add -- tests/e2e/content-routes.spec.ts src/pages/index.astro
git commit -m "feat: add Kakeya project to homepage"
```

### Task 2: 完整驗證並整合至正式站

**Files:**
- Verify: `package.json`
- Verify: `scripts/verify-build.mjs`
- Verify: `.github/workflows/ci.yml`

**Interfaces:**
- Consumes: Task 1 的首頁入口提交與 PR #1。
- Produces: 合併至 `main` 的 PR，以及可由正式網域存取的首頁入口、案例頁與 3 個掛谷頁面。

- [ ] **Step 1: 執行完整程式檢查**

```powershell
npm.cmd run check
```

Expected: Astro 0 errors、0 warnings，Vitest 0 failed。

- [ ] **Step 2: 執行正式環境建置**

```powershell
$env:PUBLIC_SHOW_DRAFTS='false'
$env:PUBLIC_ADS_ENABLED='false'
$env:EXPECTED_INSIGHTS='0'
$env:EXPECTED_PROJECTS='5'
npm.cmd run build
```

Expected: Astro 建置成功，`verify-build` 檢查所有 HTML 並以 exit code 0 結束。

- [ ] **Step 3: 執行 Chromium 端對端測試**

```powershell
npm.cmd run test:e2e -- --project=chromium
```

Expected: 0 failed；廣告停用情境可維持既有預期略過。

- [ ] **Step 4: 檢查差異並推送分支**

```powershell
git status --short --branch
git diff origin/main...HEAD --check
git push origin codex/kakeya-3d-pages
```

Expected: 工作樹乾淨，推送成功。

- [ ] **Step 5: 更新並合併 PR #1**

確認 PR head 為最新提交且 GitHub Actions、Cloudflare Pages 皆為 `success`；將 PR 解除 Draft，使用 squash 或儲存庫預設方法合併至 `main`。若 GitHub CLI 憑證無效，使用已登入的 GitHub 瀏覽器工作階段完成相同操作。

- [ ] **Step 6: 驗證正式部署**

逐一檢查：

```text
https://simonsynapse.net/
https://simonsynapse.net/projects
https://simonsynapse.net/projects/kakeya-3d-lab
https://simonsynapse.net/kakeya/interactive
https://simonsynapse.net/kakeya/immersive
https://simonsynapse.net/kakeya/learn
```

Expected: 首頁顯示 5 張作品卡片，掛谷排第 5；其餘 5 個網址不再顯示 `404`，且首頁兩個掛谷連結目的地正確。
