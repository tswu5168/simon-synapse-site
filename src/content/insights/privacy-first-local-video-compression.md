---
title: 隱私優先的本機影片壓縮：不能只相信前端文案
description: 從 File API、FFmpeg.wasm、Worker 與瀏覽器網路紀錄，說明如何驗證影片是否真的留在本機及壓縮是否成功。
publishedAt: 2026-07-24
updatedAt: 2026-07-24
category: 實作教學
tags: [隱私, WebAssembly, FFmpeg, 瀏覽器測試]
author: 賽腦耶
sources:
  - title: ffmpeg.wasm Overview
    url: https://ffmpegwasm.netlify.app/docs/overview/
  - title: ffmpeg.wasm Installation
    url: https://ffmpegwasm.netlify.app/docs/getting-started/installation/
  - title: W3C File API
    url: https://www.w3.org/TR/FileAPI/
  - title: 小賽影片壓縮器執行程式
    url: https://ssacompressor.simonsynapse.net/index.js
aiAssisted: true
draft: true
featured: false
seoTitle: 如何驗證本機影片壓縮與隱私｜Simon Synapse
seoDescription: 用程式碼、Worker、網路請求與輸出檔案四層證據，驗證 WebAssembly 影片壓縮是否真的在瀏覽器本機完成。
socialImage: /images/og/simon-synapse-default.png
---

## 問題

「影片不會上傳」是一項很強的隱私主張。畫面使用 `<input type="file">`、顯示 WebAssembly 或產生 Blob URL，都不足以單獨證明主張成立，因為 JavaScript 仍可把 File 或 ArrayBuffer 傳給任何伺服器。另一個常被忽略的問題是：檔案沒有上傳，不代表壓縮真的成功。若核心載入失敗後用模擬進度完成，隱私可能守住了，功能卻沒有交付。

## 我的判斷

本機處理至少需要四層證據。第一層是架構：程式把輸入寫入瀏覽器內的虛擬檔案系統，而不是呼叫上傳 API。第二層是網路：選檔與處理期間沒有攜帶檔案內容的外送請求。第三層是輸出：下載檔真的包含轉碼資料，可以被媒體解碼。第四層是失敗行為：任何一層出錯都要停止並清楚說明，不能偽裝成成功。

檢查前還要先寫威脅模型。我要保護的是影片內容、檔名、基本瀏覽資料，還是全部網路連線？第三方字型、廣告與分析可能看不到影片位元組，仍會收到 IP 位址、瀏覽器或頁面網址。若只說「影片不上傳」，就應限定在檔案內容；若說「完全不會傳送資料」，則必須移除或阻擋所有外部請求。主張的範圍決定測試範圍。

## 實作方法

W3C File API 定義 File、Blob、非同步讀取與 Blob URL；它同時也能和 XMLHttpRequest 等傳輸介面一起使用，所以「用了 File API」不是隱私證明。ffmpeg.wasm 的官方架構則把轉碼放在 Web Worker，先寫入核心檔案系統，完成後再讀回輸出。這提供在瀏覽器內處理的技術路徑，但 Worker、核心與 WASM 檔仍必須正確載入。

驗證時，我先讀取程式碼，確認 `writeFile`、`exec`、`readFile` 和 Blob URL 的資料流，再用瀏覽器產生小型測試影片。開始處理前記錄所有請求，開始後另記新請求的方法、目的地與內容大小。完成時不只看進度條，還要檢查 Blob 大小、容器格式、播放時間與畫面。最後模擬核心載入失敗，確認介面不會提供假下載。

## 證據與限制

在 2026 年 7 月 24 日對小賽影片壓縮器的測試中，頁面具備 COOP／COEP，`crossOriginIsolated` 為真；選入測試影片並點擊後，也沒有新增上傳請求。但 FFmpeg 在建立來自 unpkg 的 Worker 時遭到瀏覽器拒絕，正式轉碼沒有執行。程式隨後切到模擬模式，輸出假想紀錄、65% 節省比例及空白 Blob。這證明「未觀察到上傳」和「壓縮成功」是兩個不同結論。

ffmpeg.wasm 官方安裝文件也提醒，套件會產生 Web Worker，通常應下載並自行託管，而不是直接從 CDN 匯入。即使修正同源 Worker，大影片仍可能耗盡手機記憶體；瀏覽器、編碼器與格式支援也需要分別測試。頁面載入 Analytics、AdSense 或字型時，仍會產生一般瀏覽資料流量，因此隱私說明要區分「影片內容」與「網站分析資料」。

## 可以怎麼開始

先用最小測試影片建立端到端測試：選檔、轉碼、下載、解碼。網路監控要從選檔前開始，並對非必要外部服務建立清單。Worker 與核心採同源或官方建議的 Blob URL 載入方式，鎖定版本與完整性。錯誤時移除下載按鈕，顯示可行的解法。通過後再增加大檔、行動裝置、離線與中止流程。

發布前再用一個含有可辨識內容、但不涉及個資的測試檔重跑，並保存請求清單與輸出摘要。若網站日後新增分析、廣告或第三方服務，這組測試也要重新執行，因為隱私結論只能代表當時的程式與依賴版本。

## 結語

隱私優先不是一句「本機處理」，而是一組可重跑的證據。真正可信的工具會同時證明資料沒有外送、核心確實執行、輸出可以使用，並在失敗時停止。只要其中一項尚未驗證，文案就應保留條件，而不是用百分之百掩蓋未知。
