# Simon Synapse 個人內容入口網站設計規格

- 狀態：已完成對話式設計核准，等待書面規格審閱
- 日期：2026-07-24
- 品牌：Simon Synapse
- 中文標語：「用 AI 實現財富自由」
- 作者署名：「賽腦耶」
- 正式網域：`https://simonsynapse.net/`
- 預定 GitHub 儲存庫：`simon-synapse-site`
- 實作狀態：尚未開始

## 1. 決策摘要

本專案將 `simonsynapse.net` 從目前的樂透內容入口，改造成獨立的 Simon Synapse 個人品牌與原創內容入口網站。網站以「個人觀點與實作文章為主、作品為證據」的 Signal Journal 架構呈現，聚焦 AI 工具、資料研究、實作教學及可累積的數位資產。

第一版採 Astro 靜態網站與 Markdown 內容庫，使用 GitHub 管理版本，並由 Cloudflare Pages 在內容合併至 `main` 後自動部署。網站不使用資料庫、會員系統、留言系統或即時 CMS。

視覺採 Neural Aurora 方向：深藍黑背景、青色、紫色與洋紅色光暈、清楚的玻璃面板與數位訊號感。科技感不得犧牲可讀性；預設大字、高對比、寬行距與大操作目標，優先服務年長、老花眼及視力不佳的讀者。

AdSense 第一階段只規劃在具充分原創內容的文章與作品案例頁投放。首頁、政策頁、聯絡頁、404 頁及所有既有子網域暫不投放廣告。網站完成內容、SEO、隱私權、可存取性及技術驗收後，才重新申請 AdSense 審查。

## 2. 目標與成功定義

### 2.1 產品目標

1. 建立能統整不同主題與作品的個人品牌入口。
2. 以原創文章、實作過程與案例研究提高網站的實質內容價值。
3. 建立可由 GitHub 長期維護、審閱與備份的內容流程。
4. 讓 Cloudflare 自動部署每次核准後的內容更新。
5. 建立符合 AdSense 再審查所需之內容完整性、可信度、政策透明度與導覽品質。
6. 讓年長、老花眼與低視力使用者不需要額外設定即可舒適閱讀。

### 2.2 第一版成功條件

1. 根網域完成品牌入口切換，`www` 永久轉址至根網域。
2. 首發內容至少包含 5 篇完整作品案例與 6 篇原創文章。
3. 所有正式頁面具備作者、日期、來源、內容分類、SEO 資料及 AI 協作揭露。
4. 所有公開路由回傳預期的 `200`、`301` 或 `404`，沒有重新導向迴圈。
5. 手機、平板與桌機均無非預期橫向捲動，瀏覽器放大 200% 後仍可操作。
6. 主要互動元素可使用鍵盤操作，且自動化測試沒有嚴重無障礙錯誤。
7. `robots.txt`、`sitemap.xml`、RSS、canonical、結構化資料及 `ads.txt` 均通過檢查。
8. AdSense 不出現在排除頁面與既有子網域。
9. Cloudflare Preview、正式部署、建置失敗保護及回復流程均完成驗證。

### 2.3 不保證的外部結果

Google AdSense 是否核准及審查所需時間由 Google 決定。本專案能改善網站品質及審查條件，但不得宣稱或保證一定通過，也不得宣稱可保證收益或財富自由。

## 3. 第一版範圍

### 3.1 納入範圍

- 根網域品牌入口網站。
- 文章與作品案例的 Markdown 內容系統。
- 11 篇首發內容。
- 品牌、作者、聯絡、隱私權、服務條款、編輯政策與免責聲明頁面。
- 大字切換、鍵盤操作與低動態效果支援。
- SEO、RSS、結構化資料、Search Console 所需檔案。
- AdSense 驗證、`ads.txt`、廣告頁面白名單與 CMP 接入位置。
- GitHub 分支預覽、`main` 自動部署、測試與回復流程。
- 舊根網域樂透內容的遷移與轉址規則。

### 3.2 排除範圍

- 會員、登入、訂閱付費或個人化推薦。
- 留言區、論壇與使用者產生內容。
- 資料庫、後台 CMS 與伺服器端文章編輯器。
- 新聞自動抓取、批次生成短篇 AI 文章與未經人工核准的自動發布。
- 聯盟行銷填充內容。
- 所有子網域的 AdSense 投放。
- 投資、投注、收益或中獎保證。
- 第一版的 GA4；初期流量分析使用 Cloudflare Web Analytics。

## 4. 受眾、品牌與內容主張

### 4.1 主要受眾

- 尋找免費 AI 工具的一般使用者。
- 想了解資料分析方法與限制的讀者。
- 希望把想法做成可使用工具的人。
- 需要可照著操作之實作教學的非專業開發者。

### 4.2 品牌敘事

Simon Synapse 代表把人的想法、AI 能力、資料與實作連結成可持續累積的數位資產。首頁主標語固定使用：

> 用 AI 實現財富自由

主標語附近必須同步顯示以下說明，避免收益保證或誤導：

> 透過實用工具、資料研究與持續創作，建立可累積的數位資產。本站內容不構成投資、投注或收益保證。

所有文章及作品案例以「賽腦耶」署名。

## 5. 網域與資訊架構

### 5.1 網域責任

| 網域 | 第一版責任 | AdSense |
|---|---|---|
| `simonsynapse.net` | Simon Synapse 品牌、文章、案例與政策頁 | 只允許合格文章與案例頁 |
| `lotto.simonsynapse.net` | 樂透統計與研究工具 | 暫停 |
| `sfiimfoan.simonsynapse.net` | FIFA AI 預測作品 | 暫停 |
| `ssacompressor.simonsynapse.net` | 影片壓縮工具 | 暫停 |
| `tswu5168.github.io/exam-roadmap/` | 考試路線圖作品 | 不在本專案控制範圍 |
| `mps.simonsynapse.net` | Matt Pocock skills 中文指南 | 暫停 |

截至 2026-07-24 的公開檢查顯示，`simonsynapse.net` 與 `lotto.simonsynapse.net` 仍提供相同的樂透內容。根網域切換必須在新網站預覽驗收完成後執行。

### 5.2 正式路由

| 路由 | 功能 | 可投放廣告 |
|---|---|---|
| `/` | 品牌首頁與最新內容 | 否 |
| `/insights` | 所有文章 | 否 |
| `/insights/{slug}` | 完整原創文章 | 是 |
| `/projects` | 所有作品案例 | 否 |
| `/projects/{slug}` | 完整作品案例 | 是 |
| `/about` | 品牌與作者介紹 | 否 |
| `/contact` | 公開聯絡入口 | 否 |
| `/privacy` | 隱私權政策 | 否 |
| `/terms` | 服務條款 | 否 |
| `/editorial-policy` | 編輯與 AI 協作政策 | 否 |
| `/disclaimer` | 投資、投注與收益免責聲明 | 否 |
| `/404` | 找不到頁面 | 否 |

### 5.3 首頁閱讀順序

1. 品牌名稱、中文標語與風險說明。
2. 一篇主打原創文章。
3. 最新觀點時間軸。
4. 精選作品案例。
5. 作者「賽腦耶」與創作方法。
6. 主題分類入口。
7. 政策、聯絡、RSS 與版權頁尾。

## 6. 內容系統

### 6.1 儲存結構

```text
src/
  content/
    insights/
    projects/
  components/
  layouts/
  pages/
  styles/
public/
  images/
  ads.txt
```

第一版使用 Astro Content Collections 與 Markdown。只有需要嵌入小型互動元件時才允許 MDX；一般文章不得使用 MDX 增加不必要的 JavaScript。

### 6.2 內容欄位

文章與案例的 schema 至少包含：

- `title`
- `description`
- `publishedAt`
- `updatedAt`
- `category`
- `tags`
- `author`
- `sources`
- `aiAssisted`
- `draft`
- `featured`
- `seoTitle`
- `seoDescription`
- `socialImage`

`author` 第一版固定為「賽腦耶」。正式內容不可缺少摘要、日期、來源或 AI 協作狀態。草稿不得出現在 sitemap、RSS、首頁、索引頁或正式建置中。

### 6.3 編輯工作流程

1. 使用者提出個人想法、觀察或作品發想。
2. Codex 協助整理大綱、補充可驗證來源、檢查敘述與風險。
3. 使用者核准最終觀點、語氣與發布內容。
4. 內容寫入 GitHub 分支的 Markdown 檔案。
5. Pull Request 產生 Cloudflare Preview。
6. 完成內容、手機與大字模式檢查後合併至 `main`。
7. Cloudflare 自動建置並更新正式網站。

AI 不得在沒有使用者核准的情況下自動發布文章。文章必須保留使用者的實際經驗、決策過程、限制、成果與反思，不能只有一般化摘要。

## 7. 首發內容

### 7.1 作品案例

1. 小賽 AI 樂透預測：誠實呈現機率、模型限制、回測與隨機性。
2. FIFA AI 預測：說明資料來源、預測方法、限制與實際用途。
3. SSA Compressor：說明本機處理、隱私權、壓縮流程與使用情境。
4. Exam Roadmap：說明考試時程、學習規劃與資訊呈現設計。
5. Matt Pocock Skills Guide：說明 skills 蒐集、中文翻譯、分類、搜尋與互動式呈現。

每篇案例必須包含問題、動機、方法、設計選擇、限制、成果、目前狀態、外部作品連結及後續方向。

### 7.2 原創文章

1. 為什麼建立 Simon Synapse。
2. 如何把一個想法變成真正能使用的產品。
3. 如何把 AI 工具累積成數位資產。
4. 為什麼影片壓縮工具應優先在本機處理。
5. 預測模型為什麼必須誠實面對回測、機率與隨機性。
6. 如何設計真正能執行的考試路線圖。

文章不得使用誇大收益、保證成功、保證中獎或假裝具有實證支持的文字。

## 8. 視覺與元件設計

### 8.1 視覺方向

採 Neural Aurora：

- 背景：深藍黑與柔和網格。
- 訊號色：青色、紫色、洋紅色。
- 內容面板：清楚邊界的深色玻璃卡片。
- 裝飾：CSS 漸層、光暈、訊號線與低密度粒子感。
- 禁止：背景影片、WebGL、持續閃爍、過度視差、低對比霓虹字。

建議色彩 token：

| 用途 | 色碼 |
|---|---|
| 頁面背景 | `#050816` |
| 內容表面 | `#0B1020` |
| 主要文字 | `#F4F7FF` |
| 次要文字 | `#C4CEE7` |
| 青色訊號 | `#58E6FF` |
| 紫色訊號 | `#9B7BFF` |
| 洋紅訊號 | `#FF5FD2` |
| 鍵盤焦點 | `#FFE66D` |

實作時必須逐組驗證文字、背景、邊框與互動狀態的對比，不可只依色碼名稱判定符合 WCAG。

### 8.2 核心元件

- `SiteHeader`：品牌、主要導覽、行動版選單。
- `FontSizeControl`：「標準字／大字」切換。
- `HeroSignal`：標語、風險說明與主要內容入口。
- `InsightCard`：文章摘要、日期、分類與閱讀時間。
- `ProjectCard`：作品目的、狀態、技術標籤與外部連結。
- `ArticleMeta`：作者、發布及更新日期、AI 協作說明。
- `SourceList`：文章參考來源。
- `AdSlot`：只在白名單頁面啟用的廣告容器。
- `ConsentManager`：需要時載入 Google 認證 CMP。
- `SiteFooter`：政策、聯絡、RSS、GitHub 與版權。

每個元件只負責單一用途；SEO、廣告資格與內容 schema 不混入視覺卡片內部。

## 9. 銀髮與低視力友善要求

### 9.1 預設排版

- 手機內文字級至少 `18 px`。
- 桌機內文字級至少 `20 px`。
- 文章行高約 `1.8`。
- 主要閱讀欄最大寬度約 `760 px`，每行約 32 至 40 個中文字。
- 導覽、按鈕與表單文字至少 `18 px`。
- 輔助標籤不得小於 `16 px`。
- 不使用過細、低透明度或低對比文字。
- 中文字型採系統字型堆疊，避免因外部字型下載失敗影響閱讀。

### 9.2 操作與放大

- 點擊及觸控目標至少 `48 × 48 CSS px`。
- 大字模式約為標準模式的 125%。
- 字級偏好只保存在本機 `localStorage`，不作追蹤用途。
- 瀏覽器放大 200% 時內容必須重新排列，不產生非預期橫向捲動。
- 鍵盤焦點必須清楚可見。
- 連結不得只依賴顏色區分。
- 支援 `prefers-reduced-motion`，降低或停用非必要動畫。
- 主要內容在 JavaScript 停用時仍可閱讀及導覽。

驗收目標為 WCAG 2.2 AA；`48 × 48 px` 操作目標是本專案的銀髮友善要求，高於最低合規思維。

## 10. AdSense、隱私權與廣告治理

### 10.1 第一階段廣告規則

- 首頁、索引頁、政策頁、聯絡頁與 404 頁不投放廣告。
- 只有完整原創文章及完整作品案例可以投放。
- 每篇最多兩個響應式廣告位置：內文前半段後一個、文章結尾附近一個。
- 不使用偽裝下載按鈕、誘導點擊、黏住主要內容或壓過文章的廣告。
- 所有既有子網域暫停 AdSense。
- `AdSlot` 在廣告未載入、遭封鎖或沒有填充時自動收合，不留下大型空白。

### 10.2 驗證與啟用

- 全站 `<head>` 提供 AdSense 網站擁有權驗證標籤。
- 根網域提供正確的 `ads.txt`。
- 建置設定使用 `ADS_ENABLED=false` 作為預設。
- 網站通過內容與技術驗收並取得 AdSense 可投放狀態後，才把正式環境改為 `ADS_ENABLED=true`。
- 廣告程式只由合格內容版型載入，不能因環境變數啟用而出現在排除頁面。

### 10.3 CMP 與隱私權

若向歐洲經濟區、英國或瑞士訪客提供 AdSense，必須使用 Google 認證且支援 IAB TCF 的 CMP。隱私權政策必須說明 Cookie、Google 與廣告合作夥伴的資料用途、同意撤回方法、資料保存原則及聯絡方式。

第一版使用 Cloudflare Web Analytics，不加入 GA4。未來若加入 GA4，必須先更新同意流程與隱私權政策。

## 11. SEO 與可信度

- 每個正式頁面使用自我指向 canonical。
- `www.simonsynapse.net` 使用 `301` 轉址至 `simonsynapse.net`。
- `sitemap.xml` 只包含正式、可索引的 `200` 頁面。
- `robots.txt` 指向正式 sitemap。
- 草稿、預覽與重複頁面不得被索引。
- 提供 RSS Feed。
- 使用適當的 `WebSite`、`Person`、`ProfilePage`、`BlogPosting` 與 `BreadcrumbList` 結構化資料。
- 作品案例只使用能準確描述內容的結構化類型，不為了搜尋曝光過度標記。
- 文章顯示作者、發布日期、更新日期、來源、AI 協作揭露及內容限制。
- 外部連結使用清楚文字，開啟新分頁時必須告知輔助科技，並設定安全的 `rel` 屬性。

公開聯絡頁第一版使用 `https://github.com/tswu5168` 作為可追溯的公開聯絡入口。除非使用者另外提供要公開的信箱，網站不顯示或虛構電子郵件地址。

## 12. 舊內容遷移

### 12.1 轉址原則

1. 實作階段先從舊根網域 sitemap 與實際路由建立完整清單。
2. 不與新品牌路由衝突的舊樂透路徑，逐項 `301` 至 `https://lotto.simonsynapse.net/{原路徑}`。
3. `/about`、`/contact` 與 `/privacy` 改由新品牌網站使用；舊樂透版本繼續保留在樂透子網域，不從相同根網域路徑轉址。
4. 不使用無差別萬用轉址，以免攔截新文章、作品及政策頁。
5. 轉址表必須納入自動化測試，逐筆確認目標存在且沒有迴圈。

### 12.2 切換步驟

1. 在 Cloudflare Preview 完成整站測試。
2. 確認所有樂透內容已可從子網域讀取。
3. 完成轉址表與 Search Console 檢查。
4. 在 Cloudflare Pages 加入根網域。
5. 檢查 TLS、DNS、首頁、政策頁、sitemap、robots、RSS、`ads.txt` 與 canonical。
6. 保留切換前最後一個成功的正式部署作為回復點。

## 13. 技術架構與部署

### 13.1 建置架構

- Framework：Astro 靜態產生模式。
- Content：Astro Content Collections 與 Markdown。
- Runtime：主要內容無伺服器端執行需求。
- Build command：`npm run build`。
- Output directory：`dist`。
- Production branch：`main`。
- Hosting：Cloudflare Pages Git integration。

### 13.2 Git 流程

1. 每篇文章或功能使用獨立分支。
2. 推送分支後自動產生 Preview。
3. GitHub Actions 執行內容、建置、連結、SEO 與無障礙檢查。
4. Pull Request 通過檢查及人工預覽後才能合併。
5. 合併至 `main` 後由 Cloudflare 自動部署正式環境。

密碼、API Token、Cloudflare 憑證與未公開資料不得進入儲存庫。需要的非公開設定由 GitHub Secrets 或 Cloudflare 環境變數提供。

### 13.3 資料流

```text
個人想法
  → Markdown 草稿
  → Codex 整理與查核
  → 使用者核准
  → GitHub 分支
  → 自動檢查
  → Cloudflare Preview
  → 合併 main
  → Cloudflare Production
  → simonsynapse.net
```

## 14. 錯誤處理與復原

- 內容 schema 錯誤、必要欄位缺漏或來源 URL 格式無效時，建置失敗；外部網站暫時離線只在發布檢查中警告，不因瞬時網路錯誤阻止一般內容建置。
- 建置失敗不得替換目前的正式部署。
- 外部作品無法連線時，案例內文仍保持可讀，並顯示中性狀態提示。
- 圖片失敗時保留替代文字與固定比例，避免版面崩塌。
- AdSense 被封鎖或沒有填充時，廣告容器收合。
- JavaScript 失效時保留主要導覽與文章內容。
- 未知路由提供大字、高對比且含主要導覽的 404 頁。
- 緊急事件先使用 Cloudflare Pages 回復至先前成功的 production deployment。
- 完成緊急回復後，使用 Git revert 修正 `main`，讓 Git 歷史重新成為正式狀態的唯一來源。
- Preview deployment 不作為回復目標。

## 15. 測試策略

### 15.1 每次提交

- Content Collections schema 驗證。
- Astro 型別及正式建置。
- 內部連結與本機圖片路徑檢查。
- 草稿、日期、作者、來源與 AI 協作欄位檢查。
- canonical、robots、sitemap、RSS 與 JSON-LD 檢查。
- 廣告白名單與排除頁面檢查。
- 舊路徑轉址表檢查。

### 15.2 瀏覽器驗收

至少驗證：

- `360 × 800` 手機。
- `768 × 1024` 平板。
- `1440 × 900` 桌機。
- 標準字與大字模式。
- 瀏覽器放大 200%。
- 鍵盤導覽、跳至主要內容、焦點順序及選單。
- `prefers-reduced-motion`。
- JavaScript 停用。
- 廣告阻擋或廣告無填充。
- 主要頁面沒有非預期橫向捲動。

### 15.3 發布前查核

- 所有公開網址的 HTTP 狀態。
- 所有作品外部連結的實際可用性。
- 根網域與 `www` 轉址。
- `ads.txt` 可讀且發布商資料正確。
- Search Console 網域資源及 sitemap 提交。
- AdSense 程式沒有出現在子網域與排除頁面。
- Lighthouse Accessibility、SEO 與 Best Practices 目標至少 90 分。
- 自動化無嚴重無障礙錯誤。

瀏覽器自動化通過不等於實體裝置證明。正式切換前仍需在至少一支實際手機及一台桌機完成目視與操作驗收。

## 16. AdSense 再審查順序

1. 完成並部署新品牌網站。
2. 發布至少 5 篇案例及 6 篇原創文章。
3. 驗證作者、來源、政策、AI 協作揭露及風險說明。
4. 完成手機、大字、200% 放大及鍵盤測試。
5. 確認 Search Console、sitemap、canonical 與結構化資料。
6. 確認 `ads.txt` 狀態。
7. 確認子網域及排除頁面沒有廣告程式。
8. 最後才提交 AdSense 再審查。
9. 審查期間不反覆移除及重新新增網站。

## 17. 實作分界與依賴

書面規格核准後，下一步只建立詳細實作計畫。實作計畫必須拆分為：

1. Astro 專案與內容 schema。
2. 設計系統、主要版型與易讀性控制。
3. 固定政策頁與 11 篇首發內容。
4. SEO、RSS、結構化資料及廣告治理。
5. 自動化測試與 GitHub Actions。
6. Cloudflare Pages Preview。
7. 舊根網域遷移及正式切換。
8. AdSense 再審查前驗收。

正式切換需要使用者現有 GitHub 與 Cloudflare 帳號的授權狀態。任何網域切換、DNS 變更或 AdSense 表單提交前，必須先完成相對應的唯讀驗證與預覽檢查。

## 18. 參考資料

- [Cloudflare Pages Git integration](https://developers.cloudflare.com/pages/configuration/git-integration/)
- [Cloudflare Pages Astro guide](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/)
- [Cloudflare Pages custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/)
- [Cloudflare Pages rollbacks](https://developers.cloudflare.com/pages/configuration/rollbacks/)
- [Google AdSense site connection and review](https://support.google.com/adsense/answer/7584263?hl=zh-Hant)
- [Google AdSense ads.txt guide](https://support.google.com/adsense/answer/12171612?hl=zh-Hant)
- [Google certified CMP requirements](https://support.google.com/adsense/answer/13554020?hl=zh-Hant)
- [Google ProfilePage structured data](https://developers.google.com/search/docs/appearance/structured-data/profile-page?hl=zh-tw)
- [W3C WCAG 2.2 Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced)
