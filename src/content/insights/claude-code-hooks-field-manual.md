---
title: Claude Code Hook 實作手冊：把重複提醒變成可驗證規則
description: 把 Claude Code Hook 的觸發時機、範圍、handler 與驗證流程整理成一份可操作、可回查的公開學習紀錄。
publishedAt: 2026-08-18
updatedAt: 2026-08-18
category: 實作教學
tags: [Claude Code, Hooks, 自動化, 工程流程]
author: 賽腦耶
sources:
  - title: Claude Code Hooks Guide
    url: https://code.claude.com/docs/en/hooks-guide
  - title: Claude Code Hooks Reference
    url: https://code.claude.com/docs/en/hooks
  - title: Claude Code Debug your configuration
    url: https://code.claude.com/docs/en/debug-your-config
aiAssisted: true
draft: false
featured: false
seoTitle: Claude Code Hook 實作手冊｜Simon Synapse
seoDescription: 用可驗證的步驟理解 Claude Code Hook，從事件、範圍與 handler 到測試與安全防呆，建立可長期維護的自動化規則。
socialImage: /images/og/simon-synapse-default.png
---

我常遇到的不是不知道該提醒工具做什麼，而是同一件事要提醒很多次。改完程式要跑測試、準備提交要檢查敏感資料、完成前要確認輸出結果，這些事情只靠對話規則，總有被忽略的時候。

Hook 把這種「在固定時機一定要做」的行為，從提示文字變成可檢查的流程。它不是要把每個習慣自動化，而是用在那些遺漏成本明確、可以寫出放行條件的環節。

<p><a class="button primary" href="/learning/claude-code-hooks/">開啟互動 Hook Field Manual</a></p>

## 先判斷是不是 Hook 的工作

一次性的任務，直接在對話裡交代最有效。專案背景、慣例與建置方式，適合留在 `CLAUDE.md`。只有當一個規則必須在指定時機穩定觸發，而且不應該依賴模型臨場記得時，才值得做成 Hook。

這個差別很重要。把所有規則都塞進 Hook，會讓工作流程變慢，也會讓錯誤更難追。先留下真正值得強制執行的少數規則，比把流程堆滿更可靠。

## 一條 Hook 要說清楚三件事

1. **什麼時候觸發：** 由 event 決定。例如工具執行前、工具完成後、工作階段開始，或準備結束時。
2. **攔截什麼：** 由 matcher 縮小範圍。它應該只命中真正需要處理的工具或操作。
3. **接著做什麼：** 由 handler 決定 command、HTTP、MCP tool、prompt 或 agent 等後續行為；在正式 JSON 裡，它會放在內層 `hooks` 陣列並以 `type` 表示。

設定看起來短，不代表責任很小。每個 event 可搭配的 handler、matcher 的寫法與可用設定位置，都應該以當前版本的官方文件為準。這也是我把手冊做成可互動的原因：先看清欄位與結果，再複製到自己的專案。

## 這次留下的學習方式

這份手冊從「Git 提交敏感資料防護」開始，因為它有清楚的兩條結果：找到不該提交的資料就阻擋，沒有問題才放行。這比把模糊的「幫我小心一點」交給模型，更容易測試，也更容易在出問題時追查。

另一個常見情境是修改程式後的快速驗收。它可以是格式化、語法檢查，或針對改動檔案跑小範圍測試。不過深度檢查不應在每一個小動作後都執行；把較重的驗收放在工作完成前，通常更符合工作節奏。

## 怎樣才算真的可用

設定寫進檔案不等於已經生效。我會用低風險案例依序確認：設定是否被 Claude Code 載入、matcher 有沒有命中、應該阻擋的情境是否阻擋、應該放行的情境是否放行。只測一邊不夠，因為防呆規則最常見的問題就是過度攔截或完全沒有攔截。

Stop Hook 特別需要設定終點。它若只知道「不通過就繼續」，卻沒有通過條件或停止門檻，很容易把工作帶進重複迴圈。遇到連續無法通過的情況，應該回報原因與檢查輸出，交回人來決定下一步。

## 留給下一次的更新欄

這不是一份宣稱已經適用所有專案的萬用設定，而是一個能持續修正的起點。未來遇到新的工具、事件或實際失敗案例，我會補上情境、驗收條件與限制，而不是只增加看似完整的範例。

手冊本身維持單一 HTML、沒有外部字型、CDN、分析碼或背景請求。它可以直接下載後離線開啟；放在這裡的文章，則保留來源、日期、脈絡與後續更新的位置。兩者各自做好一件事，才會是一份可以分享也可以持續維護的知識庫。
