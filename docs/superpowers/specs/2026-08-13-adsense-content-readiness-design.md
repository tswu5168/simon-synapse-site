# Simon Synapse AdSense 內容價值修復設計

- 狀態：待使用者審閱
- 日期：2026-08-13
- 網站：`https://simonsynapse.net/`
- 相關議題：AdSense 網站審查顯示「缺乏價值的內容」

## 1. 目標

將 `simonsynapse.net` 從「作品集加上尚未發布的文章架構」完成為一個主題明確、可查證、可索引的 AI 實作與資料研究內容站，改善 AdSense 審查所見的原創內容價值。

本設計的成功條件不是保證 AdSense 核准。Google 決定是否核准，且審查時間與結果不由本站控制。本設計只建立可驗證的發布與複查前置條件。

## 2. 已確認事實

2026-08-13 的公開檢查結果：

1. AdSense 後台已顯示網站擁有權驗證成功，但指出「缺乏價值的內容」。
2. `https://simonsynapse.net/insights/` 顯示「共 0 篇已發布內容」，首頁也顯示焦點與最新文章仍在人工審查。
3. `src/content/insights/` 已有 6 篇 Markdown 草稿，但每篇 frontmatter 都是 `draft: true`。
4. `src/lib/content.ts` 的 `selectVisibleEntries()` 會排除草稿，因此這些內容不會出現在首頁、文章索引、RSS 或 Sitemap。
5. 現行 `sitemap-index.xml`、`sitemap-0.xml`、`robots.txt` 與 `ads.txt` 均可讀取；Sitemap 有 17 個網址，沒有任何 `/insights/{slug}` 文章網址。沒有發現 `noindex`。
6. 公開搜尋交叉查詢沒有返回 `simonsynapse.net` 結果。這不是 Search Console 的索引診斷，但與缺少公開文章頁的狀況一致。

Google 的官方說明要求網站提供足夠的原創、豐富且有價值內容，且網站必須是完整上線狀態。Google 也建議內容以讀者為主，提供第一手經驗、實質分析、清楚作者與來源，而不是為取得搜尋流量大量產生內容。

## 3. 範圍與非目標

### 3.1 本次範圍

1. 審閱並修訂既有的文章草稿。
2. 只發布符合證據門檻的原創文章。
3. 讓已發布文章出現在首頁、`/insights`、RSS 與 Sitemap。
4. 驗證 SEO、結構化資料、可讀性與 AdSense 放送邊界。
5. 部署後以 Search Console 提交 Sitemap 與要求索引，待抓取狀態正常後才要求 AdSense 複查。

### 3.2 非目標

1. 不以新增大量泛用 AI 文章、改寫他人內容、買新網域或 Blogspot 轉址來取得審查通過。
2. 不保證審查結果、流量、排名或廣告收益。
3. 不變更 `lotto.simonsynapse.net` 的樂透預測邏輯、資料庫或發布流程。
4. 不在 AdSense 尚未核准前強制載入廣告或建立空白廣告版位。
5. 不把未驗證的草稿改成公開內容。

## 4. 內容策略

### 4.1 主題定位

本站的主要定位固定為：

> 以 AI 協助的實作、資料驗證與可重現研究。

所有首頁焦點文章、文章分類與內部連結都應支持此定位。不同作品可以涵蓋瀏覽器工具、資料研究、數學視覺化或開發流程，但每篇文章都必須回到實際問題、採用方法、驗證證據與已知限制。

### 4.2 發布門檻

每篇準備發布的文章都必須通過下列門檻：

1. 有明確讀者問題與結論，不能只有標題、清單或宣傳文字。
2. 有本站第一手證據：實際專案頁、公開程式碼、測試結果、版本紀錄、畫面截圖或可重現操作其中至少一種。
3. 每個時效性、技術性或統計性主張有第一手或官方來源；來源清單的網址必須可讀取。
4. 清楚區分事實、作者經驗、推測與限制，且保留 AI 協作揭露。
5. 文章 metadata 完整：作者、發布日、更新日、摘要、分類、標籤、來源與社群圖片。
6. 有至少 2 個有意義的內部連結，連到相關作品、方法文章或作者／編輯政策頁面。
7. 沒有「保證收益」、「提高中獎率」或其他無法證實的效果宣稱。

文章字數不是門檻。現有草稿約 1,300 至 1,600 個中文字元可以作為起點，但必須以實質證據與完整回答取代填充文字。

### 4.3 發布順序

先審閱全部 6 篇草稿，再依證據強度發布。優先候選如下：

1. `privacy-first-local-video-compression.md`：可對應實際 WebAssembly／影片壓縮作品與網路請求驗證。
2. `honest-prediction-models.md`：可對應模型基準、回測與限制；必須保留彩券隨機性與非投注建議說明。
3. `idea-to-real-product.md`：改為使用本站至少 3 個實作案例，避免成為泛用流程文章。
4. `why-simon-synapse.md`：作為作者與網站方法論文章，連結到 About、編輯政策與具體案例。
5. `ai-tools-as-digital-assets.md`：僅在移除籠統變現承諾、補入真實維護與發布案例後發布。
6. `designing-an-actionable-exam-roadmap.md`：暫緩，直到確認它能清楚連到本站主題定位並完成來源與日期查核。

不以「一定發布 4 篇或 6 篇」為目標。若任何文章無法通過上述門檻，必須維持 `draft: true`。

### 4.4 樂透內容邊界

`lotto.simonsynapse.net` 是獨立工具與研究網站。本次只可以在根網域以「可驗證研究案例」說明其方法與限制，不以預測號碼、購買連結或投注誘導作為 AdSense 內容主體。

若日後內容被判定為協助使用者參與線上真錢賭博，Google Publisher Restrictions 可能限制廣告需求。因此在 AdSense 核准與政策中心確認前，不擴大樂透預測頁面的 AdSense 放送。

## 5. 技術設計

### 5.1 內容發布流程

```text
草稿 Markdown
  -> 逐篇證據審閱
  -> 修訂內容與 frontmatter
  -> 將通過者設為 draft: false
  -> Astro Content Collection
  -> /insights、首頁、RSS、Sitemap
  -> Cloudflare Pages Preview
  -> main Production
```

現有 `selectVisibleEntries()` 的草稿保護保留不變。只有通過審閱的檔案會調整 `draft`；不新增可繞過內容門檻的環境變數或批次發布機制。

### 5.2 首頁與索引

1. 首頁應顯示已發布的焦點文章與最新文章，不再將「文章仍在審查」作為主要內容。
2. `/insights` 顯示每篇文章的摘要、日期、分類、作者與清楚連結。
3. 首頁與文章索引維持可讀取的空狀態，但 production 不應在準備 AdSense 複查時維持 0 篇文章。
4. 不改變既有作品卡的順序，僅為文章與案例補上有意義的交叉連結。

### 5.3 SEO 與結構化資料

1. 已發布文章使用既有 `BlogPosting` JSON-LD，並保留 canonical、作者、發布日、更新日與來源。
2. Astro 產生的 Sitemap Index 是有效做法；不把 `/sitemap.xml` 的 404 視為修復目標，因為 `robots.txt` 已正確指向 `/sitemap-index.xml`。
3. 發布後確認每篇文章出現在 `sitemap-0.xml` 與 `rss.xml`。
4. 在 Google Search Console 提交 `https://simonsynapse.net/sitemap-index.xml`，並對首頁與已發布文章使用 URL Inspection 要求索引。
5. Sitemap 是搜尋引擎提示，不保證收錄；是否已抓取與已建立索引須以 Search Console 實際結果判斷。

### 5.4 AdSense 邊界

1. `ads.txt` 與 `google-adsense-account` meta 保留。
2. 核准前，`PUBLIC_ADS_ENABLED` 維持未啟用，正式頁面不得出現強制廣告版位。
3. 核准後仍只允許在完整的深度內容頁放送；首頁、文章索引、作品索引、政策頁、空狀態與 404 頁不放送。
4. 送出複查前，確認 AdSense 後台仍顯示網站擁有權有效。

## 6. 錯誤處理與保護措施

1. 來源失效、專案無法重現、測試結果不完整或主張無法證實時，該篇文章維持草稿並記錄待補證據。
2. 若 Content Collection schema、建置或 E2E 測試失敗，不部署、不要求索引、不要求 AdSense 複查。
3. 若 Cloudflare Preview 與 production 內容不同，以 production 實際 HTTP 回應、Sitemap 與頁面 HTML 為準，停止複查程序直到原因釐清。
4. 若 AdSense 複查仍未通過，重新讀取 Policy Center 的具體原因並對照已發布網址，不以增加無關文章作為預設回應。

## 7. 驗收與測試

### 7.1 自動驗證

1. `npm.cmd run check`：Astro 0 errors、0 warnings；全部 Vitest 通過。
2. `npm.cmd run build`：建置、redirect 產生與 `verify-build` 通過。
3. 內容測試：已發布文章可由 `selectVisibleEntries()` 取得；未通過的草稿不可見。
4. E2E：首頁與 `/insights` 顯示正確文章數；每篇文章有 metadata、來源、canonical 與結構化資料。
5. 廣告測試：AdSense 未核准／環境變數未開啟時，頁面不載入廣告腳本與版位。

### 7.2 部署後驗證

1. 以 HTTPS 檢查首頁、`/insights`、每篇已發布文章、`/about`、`/privacy` 與 `/editorial-policy` 均為 200。
2. 檢查 `robots.txt`、`sitemap-index.xml`、`sitemap-0.xml`、`rss.xml` 與 `ads.txt`。
3. 確認 Sitemap 含每一篇已發布文章，但不含草稿網址。
4. 以手機與桌面寬度檢視文章頁，確認文章正文、來源、日期與內部連結不重疊或截斷。
5. 以 Google Rich Results Test 或 Schema Validator 確認一篇文章的結構化資料沒有語法錯誤。

### 7.3 AdSense 複查門檻

只有下列條件全數成立時才在 AdSense 後台勾選「我確定已修正問題」並要求複查：

1. 至少 4 篇通過證據門檻的原創文章已公開，且主題一致。
2. 首頁與 `/insights` 不再顯示 0 篇內容或以審查中訊息作為主要內容。
3. Sitemap、RSS、canonical 與結構化資料檢查通過。
4. Search Console 已成功接收 Sitemap，且至少首頁與 1 篇文章已完成 URL Inspection。
5. AdSense 代碼放送邊界與隱私權頁面均經過再檢查。

## 8. 發布與回復

1. 每個內容發布批次都經 GitHub Pull Request 與 Cloudflare Preview 驗證。
2. 合併到 `main` 後由 Cloudflare Pages 發布到 production。
3. 若內容、連結或頁面品質出現問題，將文章改回 `draft: true` 並部署回復；不可刪除使用者既有作品或政策頁。
4. 任何 AdSense 複查動作需由使用者在其已登入的 AdSense 後台確認送出，除非使用者另行明確授權瀏覽器操作。

## 9. 參考資料

1. [Google AdSense：Your AdSense account wasn't approved](https://support.google.com/adsense/answer/81904?hl=en)
2. [Google Search Central：Creating helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
3. [Google Search Central：Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap?hl=en)
4. [Google Publisher Restrictions：Online gambling](https://support.google.com/publisherpolicies/answer/10437963?hl=en)
