# Simon Synapse

Simon Synapse 是賽腦耶的個人內容入口網站，品牌標語為「用 AI 實現財富自由」。網站彙整原創觀點、實作教學與作品案例，並以來源、限制及 AI 協作揭露建立可持續維護的內容資產。

## 開發與驗證

| 項目 | 設定 |
|---|---|
| Local preview | `npm.cmd run dev` |
| Full verification | `npm.cmd run check; npm.cmd run build; npm.cmd run test:e2e` |
| Production branch | `main` |
| Cloudflare build command | `npm run build` |
| Cloudflare output directory | `dist` |
| Node version | `24.18.0` |

安裝與本機預覽：

```powershell
npm.cmd ci
$env:PUBLIC_SHOW_DRAFTS="true"
$env:PUBLIC_ADS_ENABLED="false"
npm.cmd run dev
```

完整 Preview 閘門：

```powershell
npm.cmd run check
$env:PUBLIC_SHOW_DRAFTS="true"
$env:PUBLIC_ADS_ENABLED="false"
$env:EXPECTED_INSIGHTS="6"
$env:EXPECTED_PROJECTS="5"
npm.cmd run build
npm.cmd run test:e2e
```

Production 公開內容閘門：

```powershell
$env:PUBLIC_SHOW_DRAFTS="false"
$env:PUBLIC_ADS_ENABLED="false"
$env:EXPECTED_INSIGHTS="4"
$env:EXPECTED_PROJECTS="5"
npm.cmd run build
```

`EXPECTED_INSIGHTS` 與 `EXPECTED_PROJECTS` 的數字是已核准公開內容的發布閘門，不是為 AdSense 填充頁數。

## 內容管理

- 洞見文章位於 `src/content/insights/`。
- 作品案例位於 `src/content/projects/`。
- 新內容必須符合 `src/content.config.ts` 的 frontmatter schema。
- 每篇內容至少包含標題、摘要、分類、標籤、作者、發布與更新日期、參考來源、SEO 欄位、AI 協作狀態、草稿狀態及焦點狀態。
- 作品案例另外需要實際作品網址與維護狀態。
- 未經人工審查的內容必須保持 `draft: true`。

Production 使用 `PUBLIC_SHOW_DRAFTS=false`，Cloudflare Preview 使用 `PUBLIC_SHOW_DRAFTS=true`。Preview 通過人工審查前，不得把草稿改為公開內容。

## 廣告治理

- `PUBLIC_ADS_ENABLED=false` 是 Preview 與初次 production 的預設值。
- 只有文章與作品詳情頁符合廣告資格。
- 首頁、內容索引、信任頁、聯絡頁與 404 頁不載入 AdSense script 或廣告單元。
- 真實廣告 slot 只存放在 Cloudflare 環境變數，不提交至 Git。
- 廣告啟用前必須完成 CMP、ads.txt、版面及失敗模式驗證。

## 自動部署

GitHub Actions 會在 pull request 與 `main` 推送時執行內容型別、單元測試、production 建置及 Chromium Preview 測試。Cloudflare Pages 連接 GitHub 後，由 `main` 產生 production，其他允許的分支產生 Preview。

部署設定與人工證據記錄於 `docs/operations/cloudflare-preview-checklist.md`。
