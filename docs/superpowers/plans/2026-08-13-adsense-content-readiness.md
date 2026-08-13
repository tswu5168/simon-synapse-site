# AdSense Content Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 將 Simon Synapse 從「已驗證網域、但 production 沒有公開原創洞見」調整為可供 AdSense 人工複查的內容就緒網站：正式發布 4 篇具作者觀點、可驗證來源、明確限制與站內脈絡的文章，保留 2 篇未達發布標準的草稿，並以 CI 和部署後檢查避免未來重新回到空內容狀態。

**Architecture:** 維持既有 Astro Content Collections、`selectVisibleEntries()` 的草稿可見性規則與 Cloudflare Pages Git 部署。發布資格只由文章 frontmatter 的 `draft` / `featured`、內容本身與 `PUBLIC_SHOW_DRAFTS` 決定。CI 在 production build 明確斷言公開文章數量；Preview 仍可呈現全部 6 篇文章以支援編輯審查。AdSense 仍僅保留現有文章與作品詳情頁廣告資格邊界，不在本次預先啟用廣告或提交複查。

**Tech Stack:** Astro 5、TypeScript、Astro Content Collections、Vitest、Playwright、GitHub Actions、Cloudflare Pages。

## Global Constraints

- 僅發布以下 4 篇經內容校正的洞見文章：`privacy-first-local-video-compression`、`honest-prediction-models`、`idea-to-real-product`、`why-simon-synapse`。
- `ai-tools-as-digital-assets` 與 `designing-an-actionable-exam-roadmap` 必須保持 `draft: true`；本次不可為了提高數量而公開。
- 每篇公開文章都必須保留作者、實際首次公開日期、更新日期、至少 3 個一手或權威來源、AI 協作揭露，並具備實質站內連結。
- 不可宣稱 AdSense 一定會通過；本次交付只讓網站符合「可被有意義審查」的內容與技術前提。
- 不可改變既有專案案例的順序、網站的路由架構、廣告允許路徑，或在首頁／索引頁載入 AdSense script。
- 樂透相關內容只能描述統計方法、評估與限制，不得暗示保證獲利、提高中獎機率或鼓勵投注。
- 使用 UTF-8 與台灣繁體中文；保留現有品牌、版面與中繼資料 schema。

## File Structure Map

```text
src/content/insights/
  privacy-first-local-video-compression.md       # 修訂並公開，成為焦點文章
  honest-prediction-models.md                    # 修訂並公開，成為焦點文章
  idea-to-real-product.md                        # 修訂並公開
  why-simon-synapse.md                           # 修訂並公開
  ai-tools-as-digital-assets.md                  # 保持草稿
  designing-an-actionable-exam-roadmap.md        # 保持草稿
tests/e2e/content-routes.spec.ts                 # production / Preview 可見文章集合測試
.github/workflows/ci.yml                         # production build 的 4 篇文章閘門
README.md                                        # production 與 Preview 驗收命令
docs/operations/adsense-review-checklist.md      # 部署、索引與人工複查前檢查表
docs/superpowers/plans/2026-08-13-adsense-content-readiness.md
```

## Task 1: 先建立 production 公開內容閘門與雙環境路由測試

**Files:**
- Modify: `.github/workflows/ci.yml`
- Modify: `tests/e2e/content-routes.spec.ts`
- Modify: `README.md`

- [ ] **Step 1: 撰寫會先失敗的 production 可見性測試。**
  - 在 `tests/e2e/content-routes.spec.ts` 定義兩個明確 slug 集合：
    ```ts
    const publishedInsightSlugs = [
      "privacy-first-local-video-compression",
      "honest-prediction-models",
      "idea-to-real-product",
      "why-simon-synapse",
    ];
    const previewOnlyInsightSlugs = [
      "ai-tools-as-digital-assets",
      "designing-an-actionable-exam-roadmap",
    ];
    const showDrafts = process.env.PUBLIC_SHOW_DRAFTS === "true";
    ```
  - 在洞見索引與路由測試中，當 `showDrafts` 為 `false` 時斷言：四個公開 slug 都可被連結與載入、兩個草稿 slug 不會出現在索引；當 `true` 時，所有六個 slug 均可檢視。
  - 使用 URL／`href`／卡片數量等 ASCII 選擇器，避免測試依賴中文顯示文案。

- [ ] **Step 2: 將 production 建置轉成 4 篇公開文章的明確 CI 閘門。**
  - 在 `.github/workflows/ci.yml` 的 production build 環境變數加入：
    ```yaml
    EXPECTED_INSIGHTS: "4"
    EXPECTED_PROJECTS: "5"
    ```
  - 不修改 Preview E2E 的 `PUBLIC_SHOW_DRAFTS: "true"`；其目的仍是檢查所有候選內容路由。

- [ ] **Step 3: 更新 README 的兩種驗收命令。**
  - 保留 Preview 範例的 `EXPECTED_INSIGHTS="6"`。
  - 新增 production 驗收段落，固定使用：
    ```powershell
    $env:PUBLIC_SHOW_DRAFTS="false"
    $env:PUBLIC_ADS_ENABLED="false"
    $env:EXPECTED_INSIGHTS="4"
    $env:EXPECTED_PROJECTS="5"
    npm.cmd run build
    ```
  - 說明數字是「已核准公開內容」的發布閘門，而非為 AdSense 填充頁數。

- [ ] **Step 4: 驗證紅燈。**
  - 在尚未公開任何文章時執行：
    ```powershell
    $env:PUBLIC_SHOW_DRAFTS="false"
    $env:PUBLIC_ADS_ENABLED="false"
    $env:EXPECTED_INSIGHTS="4"
    $env:EXPECTED_PROJECTS="5"
    npm.cmd run build
    ```
  - 預期失敗訊息包含 `EXPECTED_INSIGHTS expected 4, received 0` 或等效的內容計數失敗。

- [ ] **Step 5: Commit。**
  - `git add .github/workflows/ci.yml tests/e2e/content-routes.spec.ts README.md`
  - `git commit -m "test: gate approved production insights"`

## Task 2: 修訂並公開「隱私優先的本機影片壓縮」

**Files:**
- Modify: `src/content/insights/privacy-first-local-video-compression.md`

- [ ] **Step 1: 將文章改為可核查的第一手技術案例。**
  - 保留文章的問題意識，但把泛稱的隱私主張拆為可驗證的實作邊界：瀏覽器檔案選取、`File`／`Blob` 處理、Web Worker、WASM 編碼、產物下載與網路請求。
  - 新增「如何自行驗證」段落，列出使用者可在瀏覽器 Network 面板檢查的步驟；不要只要求讀者相信本站敘述。
  - 新增「仍然不能保證的事」段落，明確說明瀏覽器擴充功能、第三方字型／分析碼、裝置端殘留與尚未實作的實際轉檔能力等限制。不得以模擬完成狀態宣稱完成實際壓縮。
  - 以 Simon Synapse 的 `ssa-compressor` 專案例作為文章內部證據，並連結至實際專案頁。

- [ ] **Step 2: 校正 frontmatter 與來源。**
  - `draft: false`、`featured: true`。
  - 將 `publishedAt` 設為實際首次公開日 `2026-08-13`，並同步設定 `updatedAt: 2026-08-13`。
  - 保留或補強 3 個以上一手來源，例如 W3C File API、MDN Web Workers、ffmpeg.wasm 官方文件；移除不能直接支持文章主張的來源。
  - 確認 `seoTitle` 少於 60 字元、`seoDescription` 介於 40 至 160 字元，並避免「完全私密」或其他不可驗證的絕對化用語。

- [ ] **Step 3: 建置單篇文章驗收。**
  - 執行 `npm.cmd run check`。
  - 執行 production build，確認 `/insights/privacy-first-local-video-compression/index.html`、canonical、`BlogPosting` JSON-LD、來源清單及沒有預先載入 AdSense script。

- [ ] **Step 4: Commit。**
  - `git add src/content/insights/privacy-first-local-video-compression.md`
  - `git commit -m "content: publish privacy compression case study"`

## Task 3: 修訂並公開「誠實的預測模型」

**Files:**
- Modify: `src/content/insights/honest-prediction-models.md`

- [ ] **Step 1: 將方法論改為可重現的評估敘述。**
  - 明確區分「描述歷史資料」與「可被驗證的預測能力」。
  - 以無資訊基準、留出期／走動回測、命中數分布、校準與資料洩漏風險說明為主；僅保留已能從系統或公開統計資料驗證的指標。
  - 以本站樂透專案為案例時，敘述為實驗與評估工具，明確說明隨機開獎下沒有可靠方法可保證提高中獎機率，且不構成投注建議。
  - 將「下一輪如何改進」寫成版本比較、預先登錄規則、shadow 實驗與失敗樣本檢討，不宣稱模型會自行超越機率極限。

- [ ] **Step 2: 校正 frontmatter、來源與站內脈絡。**
  - `draft: false`、`featured: true`、首次公開與更新日期皆為 `2026-08-13`。
  - 來源至少涵蓋可查核的統計／預測評估標準，以及台灣彩券官方開獎資料來源；來源網址必須能直接支持對應段落。
  - 連結至 `xiaosai-ai-lottery` 專案頁、`/disclaimer/` 與相關站內文章，讓讀者可追查系統範圍與責任界線。

- [ ] **Step 3: 建置單篇文章驗收。**
  - 執行 `npm.cmd run check`。
  - 使用本機 production server／Playwright 驗證文章具來源區塊、免責資訊、內部連結及可讀取正文。

- [ ] **Step 4: Commit。**
  - `git add src/content/insights/honest-prediction-models.md`
  - `git commit -m "content: publish honest prediction methodology"`

## Task 4: 修訂並公開「從想法到真實產品」

**Files:**
- Modify: `src/content/insights/idea-to-real-product.md`

- [ ] **Step 1: 將六階段流程落實為可檢查的實作案例。**
  - 針對問題定義、資料與風險、原型、驗證、發布、維護各階段，提供至少一個來自本站已公開作品的具體輸入、產出或驗收訊號。
  - 至少連結 `ssa-compressor`、`kakeya-3d-lab`、`xiaosai-ai-lottery` 三個專案頁，並說明各自的技術邊界與未完成部分。
  - 移除空泛的成功敘事，新增「不適用情況」與「何時應停止或縮小範圍」段落。

- [ ] **Step 2: 校正 frontmatter 與來源。**
  - `draft: false`、`featured: false`、首次公開與更新日期皆為 `2026-08-13`。
  - 使用可支撐工程流程的官方文件或一手專案來源，確保 3 個以上來源均有實際用途。
  - 改寫摘要與 SEO 文案，使其描述讀者將得到的實際檢查方法，而非廣泛的創業承諾。

- [ ] **Step 3: 建置單篇文章驗收。**
  - 執行 `npm.cmd run check`。
  - 確認文章詳情頁所有站內專案連結存在且可由 `scripts/verify-build.mjs` 通過。

- [ ] **Step 4: Commit。**
  - `git add src/content/insights/idea-to-real-product.md`
  - `git commit -m "content: publish product delivery case study"`

## Task 5: 修訂並公開「為什麼建立 Simon Synapse」

**Files:**
- Modify: `src/content/insights/why-simon-synapse.md`

- [ ] **Step 1: 將品牌介紹改成可審閱的編輯說明。**
  - 交代作者為何記錄作品、實驗、來源與限制，以及文章、專案、隱私權、免責聲明、編輯政策之間的關係。
  - 使用本站公開專案和文章作為具體例子，不以品牌口號取代內容。
  - 新增「本站不做什麼」段落，例如不販售保證結果、不發布未經核對的專業建議、不將草稿包裝為成品。
  - 連結 `/about/`、`/editorial-policy/`、`/privacy/`、`/terms/`、`/disclaimer/` 與至少兩個實作頁面。

- [ ] **Step 2: 校正 frontmatter 與來源。**
  - `draft: false`、`featured: false`、首次公開與更新日期皆為 `2026-08-13`。
  - 來源可使用官方文件或可公開檢查的站內政策／專案，不得虛構外部背書。
  - 確保描述、SEO 欄位與正文的服務範圍一致。

- [ ] **Step 3: 建置單篇文章驗收。**
  - 執行 `npm.cmd run check`。
  - 檢查文章頁上的作者、日期、來源、政策連結與 schema 的 `datePublished`／`dateModified`。

- [ ] **Step 4: Commit。**
  - `git add src/content/insights/why-simon-synapse.md`
  - `git commit -m "content: publish Simon Synapse editorial context"`

## Task 6: 新增部署後與 AdSense 人工複查前的操作檢查表

**Files:**
- Create: `docs/operations/adsense-review-checklist.md`

- [ ] **Step 1: 寫入可執行、不可自我宣告的檢查表。**
  - 部署前：確認 4 篇指定文章為公開、2 篇維持草稿、production build 與 Chromium E2E 均通過。
  - Cloudflare production 後：逐一檢查首頁、`/insights/`、4 篇文章、`/robots.txt`、`/sitemap-index.xml`、`/ads.txt` 的 HTTP 狀態與內容。
  - Search Console：提交／重新讀取 sitemap index，使用 URL Inspection 檢查首頁及一篇已公開文章，記錄日期、檢查結果與任何索引阻礙。這是人工操作，不可由程式假裝完成。
  - AdSense：確認不含「施工中」或空內容頁、文章不主動引導賭博、未過審前 `PUBLIC_ADS_ENABLED=false`；只有在上述證據存在後，由網站擁有者勾選「已修正問題」並按「要求複查」。
  - 加入明確結果記錄模板：日期、production commit SHA、Cloudflare deployment URL、Search Console 結果、AdSense review submitted／not submitted。

- [ ] **Step 2: Commit。**
  - `git add docs/operations/adsense-review-checklist.md`
  - `git commit -m "docs: add AdSense review readiness checklist"`

## Task 7: 完整驗收、可視化檢查與交付

**Files:**
- Verify: `.github/workflows/ci.yml`
- Verify: `README.md`
- Verify: `src/content/insights/*.md`
- Verify: `tests/e2e/content-routes.spec.ts`
- Verify: `docs/operations/adsense-review-checklist.md`

- [ ] **Step 1: 靜態與 production build 驗收。**
  ```powershell
  npm.cmd run check
  $env:PUBLIC_SHOW_DRAFTS="false"
  $env:PUBLIC_ADS_ENABLED="false"
  $env:EXPECTED_INSIGHTS="4"
  $env:EXPECTED_PROJECTS="5"
  npm.cmd run build
  ```
  - 預期：Astro type check 無錯誤、Vitest 全數通過、`scripts/verify-build.mjs` 顯示 4 篇洞見與 5 個專案，且沒有首頁／索引／信任頁廣告違規。

- [ ] **Step 2: production 與 Preview 路由驗收。**
  ```powershell
  $env:PUBLIC_SHOW_DRAFTS="false"
  $env:PUBLIC_ADS_ENABLED="false"
  npm.cmd run test:e2e -- --project=chromium tests/e2e/content-routes.spec.ts tests/e2e/seo.spec.ts tests/e2e/ads.spec.ts

  $env:PUBLIC_SHOW_DRAFTS="true"
  $env:PUBLIC_ADS_ENABLED="false"
  npm.cmd run test:e2e -- --project=chromium tests/e2e/content-routes.spec.ts
  ```
  - 預期：production 僅能看見 4 篇文章，Preview 可看見 6 篇文章；兩種環境的 canonical、結構化資料、內部連結與廣告停用界線皆正確。

- [ ] **Step 3: 視覺驗收。**
  - 啟動 local production preview，使用 Playwright 擷取桌面與手機寬度的首頁、洞見索引與每篇公開文章。
  - 檢查標題、摘要、來源、日期、內部連結和免責資訊無溢位或互相遮擋；確認首頁不再出現「0 篇已發布內容」或「文章正在進行人工審查」。

- [ ] **Step 4: 檢查 diff 與提交。**
  ```powershell
  git diff --check origin/main...HEAD
  git status --short
  git log --oneline origin/main..HEAD
  ```
  - 確認沒有無關檔案、二進位檔或環境變數被加入版本控制。
  - 若 Task 1 至 Task 6 已各自提交，建立最終驗證紀錄 commit：
    ```powershell
    git commit --allow-empty -m "chore: verify AdSense content readiness"
    ```
    僅在需要保留可追溯驗收點時建立；若沒有必要，不建立空 commit。

## Post-Implementation Manual Gate

完成程式與 Cloudflare 部署後，仍需由網站擁有者依 `docs/operations/adsense-review-checklist.md` 完成 Search Console 及 AdSense 網站狀態的人工核對。只有所有必要網址可公開存取、sitemap 能被讀取、4 篇文章確實在線上且未啟用違規廣告時，才可發出 AdSense 複查申請。Google 的審核結果不在本專案可保證的範圍內。
