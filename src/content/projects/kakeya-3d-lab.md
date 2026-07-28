---
title: 掛谷猜想 3D 實驗室：互動、沉浸與數學教學
description: 以同一套三維幾何核心製作三個獨立網頁，分別用可調參數、沉浸光雕與六步驟課程解說掛谷猜想。
publishedAt: 2026-07-28
updatedAt: 2026-07-28
category: 實作教學
tags: [掛谷猜想, Three.js, 3D 視覺化, 數學科普]
author: 賽腦耶
sources:
  - title: The Kakeya conjecture in three dimensions
    url: https://arxiv.org/abs/2502.17655
  - title: Three.js 官方文件
    url: https://threejs.org/docs/
aiAssisted: true
draft: false
featured: false
seoTitle: 掛谷猜想 3D 實驗室｜Simon Synapse
seoDescription: 用互動科普、沉浸藝術與六步驟數學教學三個頁面，直觀探索掛谷猜想、有限方向取樣與三維維度結果。
socialImage: /images/og/simon-synapse-default.png
projectUrl: https://simonsynapse.net/kakeya/interactive
status: 持續改進
---

## 專案目標

掛谷猜想問的是：一個集合若能在每一個方向容納一根單位線段，它的維度至少必須多大？這個專案不把複雜定理壓成一張靜態圖片，而是用 3 個獨立入口服務不同的閱讀目的。

1. 「互動科普」讓讀者調整方向數、線段粗細與中心分散程度。
2. 「沉浸藝術」把方向密度轉化為可觀看、可暫停的數學光雕。
3. 「數學教學」以 6 個步驟區分線段、方向、重疊、δ 鄰域、測度與維度。

## 共同幾何核心

三個頁面共用相同的確定性方向取樣與 Three.js 實例化繪圖核心。相同參數與亂數種子會產生相同結果，方便測試與比較；頁面只改變資訊層級、互動方式與視覺密度。

為了避免誤導，每個頁面都明確說明：螢幕上的線段是有限方向取樣，細管具有可見粗細，因此只能協助建立直覺，不能取代無限方向與極限過程的數學證明。

## 三維結果

Wang 與 Zahl 在 2025 年公開的預印本證明，每一個三維掛谷集合的 Minkowski 維度與 Hausdorff 維度都是 3。教學頁將這個結論與「測度為 0 不等於維度小於 3」分開解釋，並直接連結原始論文。

## 使用與無障礙

頁面支援滑鼠、觸控與鍵盤操作，尊重系統的「減少動態」偏好。若瀏覽器無法建立 WebGL 畫面，仍會保留文字內容、靜態圖形與具體修正建議，不會只留下空白區域。
