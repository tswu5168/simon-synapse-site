---
title: Matt Pocock Skills 繁體中文互動速查手冊
description: 將 GitHub skills 逐項翻譯、分類並整理中英文觸發詞，製作成可搜尋、可篩選且單一檔案可攜的互動式手冊。
publishedAt: 2026-07-24
updatedAt: 2026-07-24
category: 作品紀錄
tags: [AI Skills, 繁體中文, 可攜式 HTML, 搜尋]
author: 賽腦耶
sources:
  - title: Matt Pocock Skills 速查手冊
    url: https://mps.simonsynapse.net/
  - title: mattpocock skills 原始專案
    url: https://github.com/mattpocock/skills
aiAssisted: true
draft: true
featured: false
seoTitle: Matt Pocock Skills 中文手冊案例｜Simon Synapse
seoDescription: 將 37 個 skills 的用途、使用時機與中英文觸發詞分類整理，製作成可搜尋、可篩選的單一 HTML 手冊。
socialImage: /images/og/simon-synapse-default.png
projectUrl: https://mps.simonsynapse.net/
status: 持續改進
---

## 問題與動機

Agent skill 的名稱通常很短，但真正決定能否正確使用的是目的、適用時機、觸發方式與限制。原始 GitHub repository 以英文文件為主；如果只把名稱翻成中文，仍然很難在工作中快速判斷要選哪一項。我想把完整 skills 清單整理成台灣繁體中文速查手冊，讓讀者可以從「我現在想做什麼」反向找到適合的 skill。

## 我做了什麼

我逐一閱讀 `mattpocock/skills` 的 `SKILL.md`，排除 deprecated 內容，再為每項 skill 整理中文用途、使用時機、中文觸發詞與英文 keyword。2026 年 7 月 24 日核對的來源版本共有 37 個 skills。手冊把它們分成工程開發、生產力與工作流、開發中／實驗性、雜項與安全性、個人工作流五類，並標示是使用者主動觸發或模型依情境觸發。

## 核心設計選擇

這個工具採用單一 HTML，不依賴後端資料庫，也不需要安裝套件。所有 skill 資料、樣式與互動程式都放在檔案內，可直接複製到其他電腦開啟。搜尋會比對名稱、中文說明及觸發詞，篩選器則可依分類、觸發角色與安裝狀態縮小範圍。明暗主題偏好只記錄在瀏覽器的 `localStorage`，不需要帳號。

## 實際成果

公開網站在檢查時回傳 HTTP 200，頁面可確認 37 個資料項目、五個分類、搜尋、分類篩選、中文觸發詞、英文觸發詞與原始 repository 連結。讀者可以輸入「盤問」、「TDD」、「review」等詞快速定位，也能只查看特定類型。網站版由 Cloudflare 代管並可能載入 Web Analytics；下載後的單一 HTML 則可在沒有網路時使用核心查詢功能。

## 限制與風險

觸發詞不是保證執行的魔法字串，模型仍會依上下文、平台能力與當前規則判斷。中文內容是對原始技能目的的整理，不取代原始 `SKILL.md`；原專案更新後，37 這個數字、觸發條件或流程都可能改變。若翻譯過度濃縮，也可能遺失「必須先做什麼」或「不得做什麼」等重要限制，因此每筆資料仍保留英文名稱與來源入口。

## 目前狀態

手冊已可使用並保持單檔可攜，但目前是人工產生的版本快照，尚未自動偵測上游新增、移除或修改的 skills。分類與翻譯也需要隨原始文件調整。

## 後續方向

下一步會加入來源 commit、最後同步日期與差異清單，讓讀者知道目前手冊對應哪個版本。更新流程應先比較上游檔案，再只重審有變動的 skill；發布前同時檢查資料筆數、搜尋結果、所有外部連結及離線開啟，維持可查證與可攜性。
