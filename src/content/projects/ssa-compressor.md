---
title: 小賽影片壓縮器：瀏覽器本機轉碼的實作與限制
description: 檢查 WebAssembly 影片壓縮器的程式碼與實際網路行為，說明本機處理設計、外部依賴及目前必須修正的模擬成功問題。
publishedAt: 2026-07-24
updatedAt: 2026-07-24
category: 作品紀錄
tags: [WebAssembly, FFmpeg, 隱私, 影片工具]
author: 賽腦耶
sources:
  - title: 小賽影片壓縮器
    url: https://ssacompressor.simonsynapse.net/
  - title: 小賽影片壓縮器執行程式
    url: https://ssacompressor.simonsynapse.net/index.js
  - title: FFmpeg.wasm
    url: https://github.com/ffmpegwasm/ffmpeg.wasm
aiAssisted: true
draft: true
featured: false
seoTitle: 小賽影片壓縮器作品案例｜Simon Synapse
seoDescription: 以程式碼與瀏覽器網路測試檢查 FFmpeg.wasm 本機壓縮流程，並揭露目前 Worker 失敗與模擬成功的限制。
socialImage: /images/og/simon-synapse-default.png
projectUrl: https://ssacompressor.simonsynapse.net/
status: 持續改進
---

## 問題與動機

影片太大時，使用者常被迫把私人影像上傳到不熟悉的伺服器。我想做一個開啟網頁就能使用的壓縮工具，讓檔案留在瀏覽器內，由 WebAssembly 版 FFmpeg 讀取、轉碼並產生本機下載連結。這個方向同時考驗效能、瀏覽器相容性與隱私，因此不能只靠首頁的「100% 本機處理」文案判斷，必須檢查程式碼和實際網路請求。

## 我做了什麼

介面支援拖放或選取影片，可調整 CRF、編碼速度與輸出解析度。程式使用 `FFmpeg.writeFile` 把使用者選取的 File 寫入 WebAssembly 虛擬檔案系統，執行轉碼後以 `readFile` 取回 `output.mp4`，再用 Blob URL 產生下載連結。頁面以 COOP／COEP 標頭啟用跨來源隔離，並從 unpkg 載入 FFmpeg 程式庫及核心檔案。

## 核心設計選擇

我把輸入、轉碼與輸出都設計在瀏覽器工作階段內完成，不建立影片上傳 API。2026 年 7 月 24 日的瀏覽器測試中，我產生一個小型 WebM 測試檔、選入頁面並開始壓縮；點擊後沒有出現新的影片上傳請求。這項結果只能證明該次測試沒有把檔案傳到伺服器，不能推論所有版本、瀏覽器與未來更新都一定如此。頁面仍會連線到 Google Fonts、Google Analytics、AdSense、Cloudflare Analytics 與 unpkg。

## 實際成果

公開網站回傳 HTTP 200，能辨識影片、顯示設定、進度與下載流程；`window.crossOriginIsolated` 也確實為 `true`。但實際轉碼測試沒有成功：FFmpeg 建立 Worker 時，瀏覽器拒絕從 unpkg 的不同來源載入分割程式。程式捕捉錯誤後自動進入模擬模式，顯示假想的 FFmpeg 紀錄、65% 壓縮率與成功畫面，並建立空白 Blob。這不是有效的壓縮結果，也不能算成功完成作品目標。

## 限制與風險

目前最大的風險不是速度，而是模擬模式會讓使用者誤以為檔案已成功轉碼。大檔案也會占用大量記憶體，行動裝置可能中止頁面；外部 CDN 失效或版本變動時，核心無法載入。即使影片本身未上傳，分析與廣告服務仍會處理一般瀏覽資料，因此「100% 隱私」的說法過度絕對。未完成真實輸出驗證前，不應把模擬結果當成產品功能。

## 目前狀態

網站目前只能列為持續改進。介面、本機資料流設計與安全標頭已存在，但正式壓縮路徑在本次 Chromium 測試失敗，降級行為也不符合誠實揭露原則。

## 後續方向

第一優先是移除假成功：Worker 或核心載入失敗時，必須清楚顯示錯誤並禁止下載。接著把 Worker 與 FFmpeg 核心自有託管到同源路徑，加入小型實際影片的端到端測試，核對輸出可播放、大小合理且壓縮期間沒有檔案上傳。通過這些檢查後，才可以重新描述本機壓縮能力。
