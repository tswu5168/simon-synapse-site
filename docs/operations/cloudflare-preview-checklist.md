# Cloudflare Preview 驗收表

## 部署識別

| 欄位 | 紀錄 |
|---|---|
| 驗收日期 | 2026-07-24（Asia／Taipei） |
| GitHub repository | `https://github.com/tswu5168/simon-synapse-site` |
| Production URL | `https://simon-synapse-site.pages.dev` |
| Production deployment ID | `83c3347f-88ad-4518-9f19-1ce62ee7e590` |
| Preview branch URL | `https://feature-simon-synapse-hub.simon-synapse-site.pages.dev` |
| Preview immutable URL | `https://839ee915.simon-synapse-site.pages.dev` |
| Preview deployment ID | `839ee915-8881-4c05-860b-64ebe8044a95` |
| 驗收基準 Commit SHA | `f66b777817783187f019aac7ac8238e25d757f15` |
| GitHub Actions | `ci` 成功；run `30068433493` |
| Cloudflare deployment check | Production 與 Preview 均成功；Preview 於 2026-07-24 13:17（Asia／Taipei）完成 |

## Cloudflare 環境隔離

| 環境 | Branch | `NODE_VERSION` | `PUBLIC_SHOW_DRAFTS` | `PUBLIC_ADS_ENABLED` |
|---|---|---:|---:|---:|
| Production | `main` | `24.18.0` | `false` | `false` |
| Preview | 所有非正式分支 | `24.18.0` | `true` | `false` |

Cloudflare 遠端建置紀錄確認使用 Node.js `24.18.0`，Astro 檢查為 0 個錯誤、0 個警告、0 個提示，並完成 21 個 HTML 頁面的產物驗證。

## 自動化閘門

| 項目 | 預期 | 結果 |
|---|---|---|
| Astro 型別與內容檢查 | 0 錯誤、0 警告、0 提示 | 通過：0／0／0 |
| 單元測試 | 全部通過 | 通過：13／13 |
| Preview 內容數 | 6 篇洞見、5 篇作品 | 通過：6＋5，產物驗證 21 個 HTML |
| Chromium、Firefox、行動版 | 全部通過 | 通過：99；依廣告關閉條件略過 6 |
| axe-core | 0 個 serious／critical 問題 | 通過：6 路由 × 3 個瀏覽器專案 |
| 360、768、1,440 CSS px | 無非預期水平捲動 | 通過：6 路由 × 3 個瀏覽器專案 |
| 200% 等效 reflow | 無非預期水平捲動 | 通過：有效 640 CSS px |
| 鍵盤與跳至主要內容 | 可使用且焦點可見 | 通過：3 個瀏覽器專案 |
| Reduced motion | 動畫及轉場不超過 0.01 ms | 通過：3 個瀏覽器專案 |
| AdSense | 無 script、無廣告單元 | 通過：關閉模式；script 失敗模式另行 2／2 通過 |

本機自動化環境使用 Node.js `24.15.0`；`.nvmrc`、GitHub Actions 與 Cloudflare 建置設定鎖定 `24.18.0`。必須以遠端建置結果確認目標版本。

## 公開環境驗證

| 項目 | Production | Preview |
|---|---|---|
| HTTP 路由矩陣 | 24／24 通過 | 24／24 通過 |
| 固定頁、信任頁與機器可讀檔案 | 13 個路徑皆為 HTTP 200 | 13 個路徑皆為 HTTP 200 |
| 6 篇洞見與 5 篇作品草稿 | 11 個路徑皆為 HTTP 404 | 11 個路徑皆為 HTTP 200 |
| `X-Robots-Tag` | 未設定 `noindex` | 首頁、信任頁、草稿及機器可讀檔案皆回傳 `noindex` |
| Sitemap | 9 筆正式路徑，不含草稿 | 20 筆路徑，含 11 筆草稿 |
| RSS | 0 篇正式文章 | 6 篇草稿文章 |
| AdSense HTML 掃描 | 與 Preview 合計 29 個 HTTP 200 HTML，0 個 AdSense script 命中 | 與 Production 合計 29 個 HTTP 200 HTML，0 個 AdSense script 命中 |

`ads.txt` 已發布 Google AdSense 發布商紀錄；`PUBLIC_ADS_ENABLED=false` 僅關閉頁面廣告程式與廣告單元，不移除 `ads.txt`。

## Windows 實體桌面

| 欄位 | 紀錄 |
|---|---|
| 裝置與作業系統 | Windows 受控桌面驗證；實體裝置型號未記錄 |
| 瀏覽器與版本 | Chrome；受控環境未提供版本字串 |
| Viewport | 1,920 × 855 CSS px |
| 標準字級 | 通過 |
| 大字模式 | 通過；切換後跨頁導覽仍保留 |
| 瀏覽器 200% 縮放 | 待驗證 |
| 水平捲動 | 通過；聯絡頁 1,905 CSS px，小於 1,920 CSS px viewport |
| 純鍵盤操作 | 自動化通過；實體桌面待人工驗證 |
| Reduced motion | 自動化通過；實體桌面待人工驗證 |

## 行動版瀏覽器模擬

以 390 × 844 CSS px、開啟大字模式驗證 7 個代表路徑：首頁、文章列表、長標題文章、作品列表、長標題作品、隱私權政策及聯絡頁。

| 項目 | 結果 |
|---|---|
| 實際內容寬度 | 375 CSS px |
| 代表路徑水平溢位 | 0／7 |
| 各頁 `h1` | 7／7 存在 |
| 大字模式跨頁保留 | 通過 |

## 實體手機

| 欄位 | 紀錄 |
|---|---|
| 裝置與作業系統 | 待使用者填寫 |
| 瀏覽器與版本 | 待使用者填寫 |
| Viewport／螢幕方向 | 待使用者填寫 |
| 標準字級 | 待使用者驗證 |
| 大字模式 | 待使用者驗證 |
| 水平捲動 | 待使用者驗證 |
| 導覽選單 | 待使用者驗證 |

## 公開 Preview 路由

1. 通過：首頁與固定信任頁回應 HTTP 200。
2. 通過：6 篇草稿洞見與 5 篇草稿作品可以開啟。
3. 通過：`ads.txt`、`robots.txt`、`sitemap-index.xml` 與 `rss.xml` 可以讀取。
4. 通過：HTML 未包含 `pagead2.googlesyndication.com` 或 `adsbygoogle`。
5. 通過：大字偏好切換後跨頁導覽仍保留。
6. 通過：390 CSS px 行動版代表路徑沒有非預期水平捲動。

## 證據原則

- 自動化行動版測試只代表瀏覽器模擬，不代表實體手機。
- 200% 等效 reflow 依縮小有效 CSS viewport 驗證；實際瀏覽器 200% 縮放另行記錄。
- Search Console、AdSense、Cloudflare deployment 與 GitHub checks 只記錄實際顯示狀態，不提前宣稱通過。
- 不提交含有帳戶個資、權限資訊或私人識別資料的截圖。
- 本次未新增 Custom domain，未修改 `simonsynapse.net` DNS，也未提交 AdSense 重新審查。
