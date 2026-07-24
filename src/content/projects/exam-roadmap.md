---
title: 會考備考路線圖：把日期轉成每週可執行任務
description: 將十個考試階段與四十六週任務整理成可閱讀的靜態路線圖，並說明校方確認日期、暫定窗口及資料同步限制。
publishedAt: 2026-07-24
updatedAt: 2026-07-24
category: 作品紀錄
tags: [教育, 路線圖, 資料模型, GitHub Pages]
author: 賽腦耶
sources:
  - title: 會考備考路線圖
    url: https://tswu5168.github.io/exam-roadmap/
  - title: exam-roadmap 原始碼
    url: https://github.com/tswu5168/exam-roadmap
  - title: exam_phases.json
    url: https://raw.githubusercontent.com/tswu5168/exam-roadmap/main/exam_phases.json
aiAssisted: true
draft: true
featured: false
seoTitle: 會考備考路線圖作品案例｜Simon Synapse
seoDescription: 十個考試階段與四十六週任務如何生成靜態路線圖，並分開管理校方確認日期、暫定窗口與變更流程。
socialImage: /images/og/simon-synapse-default.png
projectUrl: https://tswu5168.github.io/exam-roadmap/
status: 持續改進
---

## 問題與動機

「準備會考」太大，也太抽象。學生真正需要的是本週要完成什麼、下一個檢查點在哪裡，以及段考來臨時是否暫停會考長線。這個作品把 2026 年 7 月到 2027 年會考前的準備拆成十個考試階段與四十六週任務，讓日期不只是行事曆標記，而能直接驅動複習、練習、訂正與節奏切換。

## 我做了什麼

公開專案以 `exam_phases.json` 保存十個階段，包含四次模考、五次段考與一次國中教育會考。每個階段有起訖日期、考試範圍、目標及逐週任務，`generate.js` 讀取這份資料後產生單一 `index.html`，再由 GitHub Pages 發布。頁面顯示距離會考天數、目前週次、階段導覽與每週清單，並用不同標籤區分模考、段考與會考。

## 核心設計選擇

第一個選擇是以考試階段而不是月份分組，因為模考、段考與會考需要不同策略。第二個選擇是讓「考後 48 小時訂正」成為固定回饋節點，避免只排閱讀量。第三個選擇是把日期可信度視為資料的一部分：校方已公告的日期應固定處理，尚未公告的下學期段考窗口必須清楚標示暫定，不能用同一種語氣呈現。

## 實際成果

2026 年 7 月 24 日檢查時，公開網站與 GitHub Pages 均正常回傳 HTTP 200。Repository 說明、頁面及資料檔可確認十階段、四十六週與逐週任務；頁面也將 2027 年 3 月 30–31 日及 4 月 29 日–5 月 5 日兩個下學期段考窗口標示為「暫定，待學校公布校正」。頁面沒有帳號、表單、外部字型、廣告或分析請求，是純靜態閱讀工具。

## 限制與風險

目前仍有資料一致性問題。公開 `exam_phases.json` 的頂層說明寫成所有日期皆暫定，但頁面只對兩個下學期段考加上暫定標示；另一份校務行事曆資料才把已公告事件與暫定窗口分開。`generate.js` 現在只讀取 `exam_phases.json`，沒有直接讀取 `school_calendar.json`，因此來源更新後不會自動同步。2027 會考日期也應持續以官方公告為準，不能把早期規劃日期永遠當成確定資訊。

## 目前狀態

公開路線圖可用，任務結構也足以支援每週執行；但它仍是產生後的靜態快照，日期狀態與來源同步尚未完全自動化，因此列為持續改進。

## 後續方向

下一步會建立單一日期來源，為每筆事件加入 `confirmed`、`tentative`、來源與最後核對日，再由產生器把狀態直接渲染到頁面。每週檢視時只調整未確認窗口，已公告日期除非學校正式更改，否則不應漂移。這樣路線圖才不只是漂亮清單，而是能安全更新的行動系統。
