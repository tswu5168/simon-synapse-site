# Simon Synapse 掛谷猜想首頁入口設計修訂

## 1. 決策背景

掛谷猜想 3D 三頁體驗已在 `codex/kakeya-3d-pages` 分支完成，並建立 Draft PR #1。正式站目前仍只顯示 4 個核心作品，且掛谷路由尚未發布。使用者已核准在首頁增加可見入口，並在驗證後完成 PR 合併與正式部署。

本文件修訂下列既有規格：

1. `2026-07-28-kakeya-3d-pages-design.md` 中「不更動首頁目前固定的核心作品排列」改為保留既有 4 個作品的順序，並在其後新增掛谷作品。
2. `2026-07-27-core-projects-homepage-design.md` 中固定 4 個核心作品改為固定 5 個核心作品。

## 2. 方案比較

### A. 新增第 5 張作品卡片，採用

- 沿用既有 `ProjectCard` 與 `card-grid`。
- 保留原 4 個作品的順序，將 `kakeya-3d-lab` 放在第 5 位。
- 首頁卡片同時提供站內案例頁與掛谷互動頁連結。
- 變更範圍最小，與 `/projects` 的內容模型一致。

### B. 新增獨立首頁橫幅，不採用

- 掛谷入口能取得更高視覺權重。
- 需要新增元件、版面與響應式規則，超出本次「補上 hyperlink」的必要範圍。

### C. 以掛谷作品替換現有卡片，不採用

- 首頁仍維持 4 張卡片。
- 會移除既有作品入口，不符合保留現有內容的要求。

## 3. 核准設計

首頁 `CORE_PROJECT_IDS` 固定為以下順序：

1. `xiaosai-ai-lottery`
2. `matt-pocock-skills-guide`
3. `fifa-ai-prediction`
4. `ssa-compressor`
5. `kakeya-3d-lab`

不新增卡片變體、不更動導覽列，也不調整前 4 個作品的順序。掛谷卡片的「閱讀案例」連到 `/projects/kakeya-3d-lab`，「開啟作品」連到 `/kakeya/interactive`；使用者可再由掛谷模式導覽切換至沉浸藝術與數學教學頁。

## 4. 錯誤與內容保護

1. 若 `kakeya-3d-lab` 內容不存在或被標記為草稿，正式建置測試必須失敗，不得讓首頁靜默少一張卡片。
2. 首頁測試必須驗證 5 張卡片的數量、順序與掛谷連結。
3. 3 個掛谷路由與案例頁必須在正式建置中產生，避免首頁連到 `404`。
4. PR 合併後，以正式網域重新檢查首頁、作品頁與 4 個掛谷相關網址。

## 5. TDD 與驗證

1. 先修改首頁測試，使其要求第 5 張卡片為掛谷專案，並確認測試因目前只有 4 張卡片而失敗。
2. 只在 `CORE_PROJECT_IDS` 加入 `kakeya-3d-lab`，讓測試通過。
3. 執行完整 `npm run check`、正式環境建置與 Chromium 端對端測試。
4. 推送同一功能分支，等待 GitHub Actions 與 Cloudflare Pages 檢查成功。
5. 將 PR #1 解除 Draft 後合併至 `main`，等待正式部署完成。

## 6. 完成條件

1. 正式首頁「作品實證」顯示 5 張卡片，原 4 張順序不變，掛谷專案排第 5。
2. 正式 `/projects` 顯示掛谷專案。
3. `/projects/kakeya-3d-lab`、`/kakeya/interactive`、`/kakeya/immersive` 與 `/kakeya/learn` 均可直接開啟。
4. GitHub Actions 與 Cloudflare Pages 正式部署檢查成功。
5. 工作樹無未提交變更，PR 已合併至 `main`。

## 7. 不在本次範圍

- 不新增首頁橫幅或導覽列項目。
- 不修改卡片視覺樣式。
- 不重新排序或移除既有 4 個核心作品。
- 不變更掛谷 3D 頁面的互動與數學內容。
