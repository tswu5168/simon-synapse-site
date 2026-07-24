# Cloudflare Preview 驗收表

## 部署識別

| 欄位 | 紀錄 |
|---|---|
| 驗收日期 | 2026-07-24；公開 Preview 建立後補記部署時間 |
| Preview URL | 待填寫 |
| Cloudflare deployment ID | 待填寫 |
| Commit SHA | 待填寫 |
| GitHub Actions | 待填寫 |
| Cloudflare deployment check | 待填寫 |

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

## Windows 實體桌面

| 欄位 | 紀錄 |
|---|---|
| 裝置與作業系統 | 待填寫 |
| 瀏覽器與版本 | 待填寫 |
| Viewport | 待填寫 |
| 標準字級 | 待驗證 |
| 大字模式 | 待驗證 |
| 瀏覽器 200% 縮放 | 待驗證 |
| 純鍵盤操作 | 待驗證 |
| Reduced motion | 待驗證 |

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

建立 Preview 後逐項驗證：

1. 首頁與固定信任頁回應 HTTP 200。
2. 6 篇草稿洞見與 5 篇草稿作品可以開啟。
3. `ads.txt`、`robots.txt`、`sitemap-index.xml` 與 `rss.xml` 可以讀取。
4. 沒有 `pagead2.googlesyndication.com` 請求。
5. 大字偏好重新載入後仍保留。
6. 行動版沒有非預期水平捲動。

## 證據原則

- 自動化行動版測試只代表瀏覽器模擬，不代表實體手機。
- 200% 等效 reflow 依縮小有效 CSS viewport 驗證；實際瀏覽器 200% 縮放另行記錄。
- Search Console、AdSense、Cloudflare deployment 與 GitHub checks 只記錄實際顯示狀態，不提前宣稱通過。
- 不提交含有帳戶個資、權限資訊或私人識別資料的截圖。
