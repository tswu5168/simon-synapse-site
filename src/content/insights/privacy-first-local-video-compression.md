---
title: 本機影片壓縮的可驗證邊界：小賽壓縮器技術案例
description: 以小賽影片壓縮器的工作紀錄與當前驗證流程，拆解 File API、Web Worker、網路請求與輸出檔，釐清本機處理的證據範圍。
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
  - title: 小賽影片壓縮器目前載入的執行程式
    url: https://ssacompressor.simonsynapse.net/index.js
aiAssisted: true
draft: false
featured: true
seoTitle: 本機影片壓縮的可驗證邊界｜Simon Synapse
seoDescription: 以工作紀錄與 DevTools 驗證流程，檢查檔案資料流、Worker、網路請求與輸出解碼，釐清本機處理與真實轉檔的差異。
socialImage: /images/og/simon-synapse-default.png
---

## 先說結論

「選檔後沒有看到上傳」與「影片已成功在本機轉檔」是兩個不同結論。這篇以 [小賽影片壓縮器](/projects/ssa-compressor/) 的作者工作紀錄為背景，提供讀者可在當前版本自行重跑的驗證方法；它不是產品宣傳，也不把介面上的成功畫面當成證據。

本文唯一可驗證的結論是：讀者依下方步驟，以自己的瀏覽器和測試檔檢查當前頁面，才能判斷該次工作階段是否外送檔案內容、Worker 是否載入，以及輸出是否可解碼。這種結果只代表當下的瀏覽器、外部依賴與程式版本，不能替其他環境或未來部署背書。

## 一筆不能當作證據的工作紀錄

作者在 2026 年 7 月 24 日的工作紀錄中，曾描述選檔後沒有看到影片上傳請求，並記下 FFmpeg Worker 載入失敗後進入模擬模式、產生空白 Blob 的情況。這份紀錄沒有保存 HAR、Console 或 Worker 日誌、瀏覽器完整版本、測試檔雜湊，或當時執行程式的版本快照與 commit permalink。

因此，該日期的敘述只是作者當時的工作紀錄，不能被讀者獨立追溯、重現或用來證實目前行為。它也不能證明任何版本曾成功或未成功轉檔。模擬模式與空白 Blob 是需要在當前測試中特別防範的限制，而不是可由這篇文章單獨驗證的歷史事實。

## 預期資料流與它能說明的事

W3C File API 定義了使用者選取檔案後的 `File`、不可變二進位資料的 `Blob`，以及讀取與 Blob URL 等能力。它讓網頁能在瀏覽器工作階段中取得檔案資料，但規格也預期它可與 `XMLHttpRequest`、`postMessage()` 及 Web Workers 併用；只要程式另行發送請求，`File` 或 `ArrayBuffer` 仍可能離開裝置。使用 File API 不是隱私保證。

ffmpeg.wasm 的官方架構將高負載工作放進 Web Worker，將輸入寫入核心檔案系統，完成後再讀出結果。官方使用範例的成功路徑依序包含 `writeFile`、`exec`、`readFile`，最後才以 `Blob` 建立可播放的 URL。Worker 可在背景執行，也可發出網路請求；它不是網路隔離機制。這正是驗證時必須同時檢查 Worker 載入、網路請求和輸出內容的原因。

來源清單中的小賽影片壓縮器 `index.js` 連結，只用來檢查目前載入的執行程式。它不是 2026 年 7 月 24 日的程式版本快照；CDN 或部署更新後，現在看到的內容不能反推歷史狀態。程式設計意圖也不能取代當前執行結果。

## 如何自行驗證當前版本

請使用不含私人影片的小型測試檔。下列流程是本文唯一可驗證的結論來源，結果只能代表「此瀏覽器、此版本、此時刻」的觀察。

1. 以新的瀏覽器設定檔或無痕視窗開啟工具，暫停會改寫網頁或攔截流量的擴充功能。開啟 DevTools 的 Network 與 Console 面板，勾選「Preserve log」並清除既有紀錄。
2. 記下測試時間、瀏覽器完整版本、頁面 URL 與目前載入的指令碼 URL。重新整理頁面，先保留初始請求；這一批可能包含字型、分析碼、廣告碼與 FFmpeg 核心等資源。選取檔案前後都保留紀錄，避免把頁面載入流量誤判成影片上傳。
3. 在選檔並啟動處理後，檢查新增請求的網域、方法、`Content-Type`、Payload 與傳送大小。特別檢查 Fetch／XHR、Media、WebSocket 與其他非同源請求，確認沒有夾帶測試檔的位元組或檔名。Network 面板只能觀察目前瀏覽器工作階段，不能替未測的版本背書。
4. 檢查 Console、Worker 與 WASM 相關錯誤。若核心、Worker 或 WASM 載入失敗，應把它記為轉檔失敗，不應接受進度條、百分比或「成功」訊息作為結果。若頁面進入模擬模式或只建立空白 Blob，同樣視為失敗。
5. 若介面提供下載，檢查輸出檔大小不是 0 bytes，並以本機播放器或瀏覽器開啟，確認容器、時長與畫面可被解碼。只有 `readFile` 的有效結果、非空輸出與可播放檔案都成立時，才可把該次操作稱為成功轉檔。
6. 若要讓結果可供日後核對，保存已移除敏感資料的 HAR、Console 與 Worker 訊息、測試檔 SHA-256、輸出檔大小及可固定指向的程式版本。這些是未來測試要建立的證據包，不是本文聲稱已保存的歷史資料。

## 不能據此判定目前狀態

作者的舊工作紀錄提到模擬模式與空白 Blob，這足以說明為何驗證不能只看成功畫面；但它沒有不可變證據，因此不能決定目前工具的狀態。只有讀者在當前頁面取得的 Network、Console、Worker 與輸出解碼結果，才能描述目前工作階段。

這仍是一個重要的判斷原則：即使本機選檔、Blob URL 與沒有上傳請求同時存在，仍不能從中推出「已完成本機壓縮」。只要目前測試出現模擬成功、Worker 載入錯誤、空白 Blob，或不能解碼的輸出，就不得以「壓縮完成」描述該次操作。

## 仍然不能保證的事

- **瀏覽器擴充功能：** 擴充功能可注入指令碼、修改頁面或發送額外連線。一般網頁程式無法控制使用者已安裝的擴充功能，因此驗證應使用乾淨設定檔，並記錄實際環境。
- **分析服務與廣告服務：** 即使影片位元組沒有外送，Google Fonts、Google Analytics、AdSense、Cloudflare Analytics 等外部服務仍可能接收一般瀏覽請求，例如 IP 位址、瀏覽器資訊、頁面 URL 或 Cookie 狀態。這與「影片內容未上傳」不是同一項主張。
- **外部依賴：** ffmpeg.wasm 的 Worker、核心 JavaScript 與 WASM 若由 CDN 供應，會受到網域、CORS、版本、快取與可用性的影響。官方範例也以 `toBlobURL` 處理跨來源核心資源；載入方式必須在實際部署環境驗證。
- **裝置端殘留：** 本機處理不代表資料會自動抹除。瀏覽器記憶體、下載項目、快取、網站儲存空間與作業系統暫存位置，都可能依瀏覽器與裝置設定留下痕跡；本案例沒有驗證或承諾清除它們。
- **真實轉檔：** 作者的舊工作紀錄曾提到 Worker 失敗後的模擬模式與空白 Blob，但那不是可追溯的版本證據。除非當前測試證明輸出非空且可解碼，否則不得以「壓縮完成」或「100% 本機轉檔」描述該次操作。

## 下一個可驗收門檻

要讓這項能力成為可用功能，至少需要把 Worker 與核心改為可控且可重現的載入方式，失敗時停在明確錯誤狀態並移除下載入口，最後以固定的小型測試影片執行端對端驗證：保存 Network 請求、Console 與 Worker 日誌、測試檔雜湊、程式版本資訊，並確認輸出非空且可解碼播放。每次更換瀏覽器支援範圍、FFmpeg 核心版本、CDN 或第三方服務後，都應重跑這些檢查。

真正可檢查的隱私主張不是「相信本機處理」，而是清楚指出資料類型、依賴、測試環境與未驗證範圍。這篇文章保留舊工作紀錄作為背景，但不把它當成證據；可供檢查的是讀者現在親自執行並保存的結果。
