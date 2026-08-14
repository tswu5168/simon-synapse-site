# Simon Synapse AdSense 複查操作檢查表

本文件是 `https://simonsynapse.net` 的人工操作記錄，不是完成宣告。所有時間以台灣時間（`Asia/Taipei`）記錄，並以資料實際公開的狀態為準。Cloudflare、Google Search Console 與 Google AdSense 的回應均須由網站擁有者在外部服務介面人工驗證及記錄。

## 1. 部署前

在合併至 `main` 或發佈 Cloudflare production 前，逐項執行並保留命令輸出或 CI 連結。未執行者不得勾選。

- [ ] 確認下列 4 篇指定 insights 的 frontmatter 為 `draft: false`，並會在 production 顯示：
  - `privacy-first-local-video-compression`
  - `honest-prediction-models`
  - `idea-to-real-product`
  - `why-simon-synapse`
- [ ] 確認下列 2 篇維持 `draft: true`，不以增加文章數量為由公開：
  - `ai-tools-as-digital-assets`
  - `designing-an-actionable-exam-roadmap`
- [ ] 執行 production build：

  ```powershell
  $env:PUBLIC_SHOW_DRAFTS="false"
  $env:PUBLIC_ADS_ENABLED="false"
  $env:EXPECTED_INSIGHTS="4"
  $env:EXPECTED_PROJECTS="5"
  npm.cmd run build
  ```

- [ ] 記錄 production build 結果：Astro 檢查、`scripts/verify-build.mjs` 與內容數量均須成功。
- [ ] 以 production 環境執行 Chromium E2E：

  ```powershell
  $env:PUBLIC_SHOW_DRAFTS="false"
  $env:PUBLIC_ADS_ENABLED="false"
  npm.cmd run test:e2e -- --project=chromium tests/e2e/content-routes.spec.ts tests/e2e/seo.spec.ts tests/e2e/ads.spec.ts
  ```

- [ ] 記錄 Chromium E2E 結果；失敗、略過與其原因都必須列入備註。
- [ ] 核對 production 的 `PUBLIC_ADS_ENABLED=false`；未通過 AdSense 審查前，不可啟用頁面廣告程式或廣告單元。

## 2. Cloudflare Production 後

待 Cloudflare production deployment 顯示完成後，使用實際 production URL 逐一開啟下列網址。不要預填「通過」；在外部 HTTP 回應與頁面內容均已人工確認後才填入結果欄位。

| 網址 | 應驗證內容 | HTTP 狀態／結果 | 驗證日期（台灣時間） | 備註／阻礙 |
|---|---|---|---|---|
| `https://simonsynapse.net/` | 首頁可公開讀取；焦點或最新文章不顯示「0 篇已發布內容」或施工中訊息；首頁不載入 AdSense 廣告。 |  |  |  |
| `https://simonsynapse.net/insights/` | 顯示 4 篇公開 insights；不顯示 2 篇草稿；沒有空內容或施工中頁面。 |  |  |  |
| `https://simonsynapse.net/insights/privacy-first-local-video-compression/` | 文章正文、日期、作者、來源與站內連結可讀取；非空內容；不主動引導博弈。 |  |  |  |
| `https://simonsynapse.net/insights/honest-prediction-models/` | 文章正文、日期、作者、來源與站內連結可讀取；明示方法限制；不暗示獲利、提高中獎機率或鼓勵投注。 |  |  |  |
| `https://simonsynapse.net/insights/idea-to-real-product/` | 文章正文、日期、作者、來源與站內連結可讀取；非空內容；不主動引導博弈。 |  |  |  |
| `https://simonsynapse.net/insights/why-simon-synapse/` | 文章正文、日期、作者、來源與站內連結可讀取；非空內容；不主動引導博弈。 |  |  |  |
| `https://simonsynapse.net/robots.txt` | 可讀取，且 Sitemap 指向 `https://simonsynapse.net/sitemap-index.xml`。 |  |  |  |
| `https://simonsynapse.net/sitemap-index.xml` | 可讀取，並可追溯至包含首頁與 4 篇公開 insights 的 sitemap URL。 |  |  |  |
| `https://simonsynapse.net/ads.txt` | 可讀取，且內容保留既有 Google AdSense 發布商紀錄；此檔存在不代表頁面廣告已啟用。 |  |  |  |

## 3. Google Search Console

以下工作必須由已驗證資源的網站擁有者在 Google Search Console 人工操作。**不可由程式或文件宣稱完成。**

- [ ] 在 Sitemap 報表人工提交或重新讀取 `https://simonsynapse.net/sitemap-index.xml`。
- [ ] 使用 URL Inspection 檢查 `https://simonsynapse.net/`。
- [ ] 使用 URL Inspection 檢查一篇實際公開的 article，例如 `https://simonsynapse.net/insights/privacy-first-local-video-compression/`。
- [ ] 記錄每次操作日期、Search Console 顯示狀態與任何索引阻礙，例如擷取失敗、未找到、`noindex`、canonical 衝突或等待處理。

| 操作 | 網址 | 日期（台灣時間） | Search Console 狀態／結果 | 阻礙與後續處理 |
|---|---|---|---|---|
| 提交／重新讀取 Sitemap | `https://simonsynapse.net/sitemap-index.xml` |  |  |  |
| URL Inspection | `https://simonsynapse.net/` |  |  |  |
| URL Inspection | `https://simonsynapse.net/insights/privacy-first-local-video-compression/` |  |  |  |

## 4. AdSense 複查前人工閘門

- [ ] 已由人工瀏覽確認沒有施工中頁面、空內容頁面或僅有佔位文字的公開頁面。
- [ ] 已由人工瀏覽確認公開文章沒有主動引導博弈、投注、保證獲利或提高中獎機率的內容。
- [ ] 未過審前 `PUBLIC_ADS_ENABLED=false` 仍保持關閉；`ads.txt` 可存在，但不可據此宣稱廣告已啟用或審查已通過。
- [ ] 已保留第 1 至第 3 節所有可驗證證據，包括 production URL、HTTP 結果、Cloudflare deployment 狀態與 Search Console 記錄。
- [ ] 只有在上述證據已可驗證後，才由網站擁有者在 AdSense 介面勾選「已修正問題」並送出「要求複查」。
- [ ] 記錄 AdSense 的實際送出狀態；送出複查不代表審核一定通過，也不可宣稱結果。

## 5. 結果記錄

| 欄位 | 填寫內容 |
|---|---|
| 日期（台灣時間） |  |
| Production commit SHA |  |
| Cloudflare deployment URL |  |
| Cloudflare production status |  |
| Search Console 結果 |  |
| AdSense review | `submitted` ／ `not submitted` |
| 備註／阻礙 |  |

## 6. 完成判定

本檢查表僅在所有核取項目已有可驗證證據時，才可記錄為「已完成操作」。Cloudflare deployment、Search Console 索引與 AdSense 審查均為外部服務的人工驗證結果；任何未填寫、失敗或等待中的欄位，都應保留為未完成或阻礙，不可自行推定為通過。
