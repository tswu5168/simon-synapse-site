---
title: 本機影片壓縮的可驗證邊界：小賽壓縮器技術案例
description: 以小賽影片壓縮器的實測紀錄，拆解 File API、Web Worker、網路請求與輸出檔驗證，說明何時能談本機處理。
publishedAt: 2026-08-13
updatedAt: 2026-08-13
category: 實作教學
tags: [隱私, WebAssembly, FFmpeg, 瀏覽器測試, Web Worker]
author: 賽腦耶
sources:
  - title: W3C File API
    url: https://www.w3.org/TR/FileAPI/
  - title: MDN Using Web Workers
    url: https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers
  - title: ffmpeg.wasm Overview
    url: https://ffmpegwasm.netlify.app/docs/overview/
  - title: ffmpeg.wasm Usage
    url: https://ffmpegwasm.netlify.app/docs/getting-started/usage/
  - title: 小賽影片壓縮器執行程式
    url: https://ssacompressor.simonsynapse.net/index.js
aiAssisted: true
draft: false
featured: true
seoTitle: 本機影片壓縮的可驗證邊界｜Simon Synapse
seoDescription: 以小賽影片壓縮器的實測紀錄，檢查檔案資料流、Worker、網路請求與輸出檔，釐清本機處理與真實轉檔的差異。
socialImage: /images/og/simon-synapse-default.png
---

## 先說結論

「選檔後沒有看到上傳」與「影片已成功在本機轉檔」是兩個不同結論。這篇是 [小賽影片壓縮器](/projects/ssa-compressor/) 的第一手技術案例，記錄一次可追溯的測試，以及讀者可自行重跑的驗證方法；它不是產品宣傳，也不把介面上的成功畫面當成證據。

2026 年 7 月 24 日，我在 Chromium 進行測試：頁面可選取小型 WebM 檔案，且選檔與啟動處理後未觀察到新增的影片上傳請求；`window.crossOriginIsolated` 為 `true`。但 FFmpeg 建立來自 unpkg 的 Worker 時遭瀏覽器拒絕，程式接著進入模擬模式、顯示假想紀錄與 65% 節省比例，並產生空白 Blob。當次測試沒有完成真實轉檔，空白 Blob 也不是可用輸出檔。

因此，這個案例僅能說明：在該次觀察中，沒有看到測試影片內容外送；它不能證明所有瀏覽器、版本或日後部署都不會上傳，更不能證明目前工具已完成真實影片壓縮。

## 預期資料流與它能說明的事

W3C File API 定義了使用者選取檔案後的 `File`、不可變二進位資料的 `Blob`，以及讀取與 Blob URL 等能力。它讓網頁能在瀏覽器工作階段中取得檔案資料，但規格也預期它可與 `XMLHttpRequest`、`postMessage()` 及 Web Workers 併用；只要程式另行發送請求，`File` 或 `ArrayBuffer` 仍可能離開裝置。使用 File API 不是隱私保證。

ffmpeg.wasm 的官方架構將高負載工作放進 Web Worker，將輸入寫入核心檔案系統，完成後再讀出結果。官方使用範例的成功路徑依序包含 `writeFile`、`exec`、`readFile`，最後才以 `Blob` 建立可播放的 URL。Worker 可在背景執行，也可發出網路請求；它不是網路隔離機制。這正是驗證時必須同時檢查 Worker 載入、網路請求和輸出內容的原因。

小賽影片壓縮器的設計意圖也是這條資料流：選檔、寫入 FFmpeg 虛擬檔案系統、執行、讀回輸出，再建立下載連結。設計意圖不能取代執行結果；2026 年 7 月 24 日的 Worker 載入失敗，使這條正式路徑在當次測試中沒有走完。

## 如何自行驗證

請使用不含私人影片的小型測試檔，並把結果視為「此瀏覽器、此版本、此時刻」的觀察。

1. 以新的瀏覽器設定檔或無痕視窗開啟工具，暫停會改寫網頁或攔截流量的擴充功能。開啟 DevTools 的 Network 面板，勾選「Preserve log」並清除既有紀錄。
2. 重新整理頁面，先記下初始請求；這一批可能包含字型、分析碼、廣告碼與 FFmpeg 核心等資源。選取檔案前後都保留紀錄，避免把頁面載入流量誤判成影片上傳。
3. 在選檔並啟動處理後，檢查新增請求的網域、方法、`Content-Type`、Payload 與傳送大小。特別檢查 Fetch／XHR、Media、WebSocket 與其他非同源請求，確認沒有夾帶測試檔的位元組或檔名。Network 面板只能觀察目前瀏覽器工作階段，不能替未測的版本背書。
4. 檢查 Console 與 Worker 相關錯誤。若核心、Worker 或 WASM 載入失敗，應把它記為轉檔失敗，不應接受進度條、百分比或「成功」訊息作為結果。
5. 若介面提供下載，檢查輸出檔大小不是 0 bytes，並以本機播放器或瀏覽器開啟，確認容器、時長與畫面可被解碼。只有 `readFile` 的有效結果、非空輸出與可播放檔案都成立時，才可把該次操作稱為成功轉檔。

## 這次案例的失敗證據

2026 年 7 月 24 日的測試中，跨來源隔離存在，也未在選入測試檔後看到影片上傳；然而，這些只涵蓋檔案外送的一小部分。FFmpeg Worker 從 unpkg 載入時被瀏覽器拒絕，正式 `writeFile`、`exec`、`readFile` 的成功鏈沒有完成。錯誤處理反而改用模擬紀錄和空白 Blob，讓畫面看起來像成功。

這是一個重要的反例：即使本機選檔、Blob URL 與沒有上傳請求同時存在，仍不能從中推出「已完成本機壓縮」。在移除模擬成功、讓 Worker 與核心可靠載入，並以可播放輸出完成端對端測試前，這個工具的真實轉檔能力仍屬未實作完成的狀態。

## 仍然不能保證的事

- **瀏覽器擴充功能：** 擴充功能可注入指令碼、修改頁面或發送額外連線。一般網頁程式無法控制使用者已安裝的擴充功能，因此驗證應使用乾淨設定檔，並記錄實際環境。
- **分析服務與廣告服務：** 即使影片位元組沒有外送，Google Fonts、Google Analytics、AdSense、Cloudflare Analytics 等外部服務仍可能接收一般瀏覽請求，例如 IP 位址、瀏覽器資訊、頁面 URL 或 Cookie 狀態。這與「影片內容未上傳」不是同一項主張。
- **外部依賴：** ffmpeg.wasm 的 Worker、核心 JavaScript 與 WASM 若由 CDN 供應，會受到網域、CORS、版本、快取與可用性的影響。官方範例也以 `toBlobURL` 處理跨來源核心資源；載入方式必須在實際部署環境驗證。
- **裝置端殘留：** 本機處理不代表資料會自動抹除。瀏覽器記憶體、下載項目、快取、網站儲存空間與作業系統暫存位置，都可能依瀏覽器與裝置設定留下痕跡；本案例沒有驗證或承諾清除它們。
- **真實轉檔尚未完成：** 本案例所記錄的版本在 Worker 失敗後產生模擬成功與空白 Blob。除非新的測試證明輸出非空且可解碼，否則不得以「壓縮完成」或「100% 本機轉檔」描述它。

## 下一個可驗收門檻

要讓這項能力成為可用功能，至少需要把 Worker 與核心改為可控且可重現的載入方式，失敗時停在明確錯誤狀態並移除下載入口，最後以固定的小型測試影片執行端對端驗證：記錄 Network 請求、保存 Worker 日誌、確認輸出非空並解碼播放。每次更換瀏覽器支援範圍、FFmpeg 核心版本、CDN 或第三方服務後，都應重跑這些檢查。

真正可檢查的隱私主張不是「相信本機處理」，而是清楚指出資料類型、依賴、測試環境與未驗證範圍。這次案例的價值正在於失敗被保留下來，讓下一次修正有可比較的基線。
