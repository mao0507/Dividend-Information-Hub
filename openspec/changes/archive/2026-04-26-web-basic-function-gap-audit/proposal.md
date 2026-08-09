## Why

目前網頁已有多頁面雛形，但仍缺少多個「可實際完成使用者目標」的基本功能，導致流程中斷或僅停留在展示狀態。需要先做一次系統化缺口盤點，明確定義最低可用能力與補齊優先序，避免功能持續擴張但核心流程不可用。

## What Changes

- 新增一份跨頁面的「基本功能缺口盤點」能力，涵蓋登入、自選股、提醒、設定、搜尋、儀表板等核心流程。
- 定義每個核心流程的最小可用標準（MVP Definition of Done）與可驗證條件。
- 輸出缺口清單（缺功能、假資料、無法落地 API、僅 UI 未串接）與優先級（P0/P1/P2）。
- 建立缺口對應的修補任務模板（含前後端、資料模型、測試與驗收），供後續 `/opsx:apply` 直接實作。

## Capabilities

### New Capabilities
- `web-basic-function-gap-audit`: 盤點目前網站在核心使用者流程上的基本功能缺失，並產出可執行的補齊規格與任務清單。

### Modified Capabilities
- 無

## Impact

- 影響範圍：`frontend/src/pages/**`、`frontend/src/api/**`、`backend/src/**`、`openspec/changes/**`。
- 產出物：新增 capability spec、設計文件、可執行 tasks。
- 對外 API：以盤點與補齊為主，可能導致後續新增/調整部分 endpoint 契約。
- 測試：需補上對應流程的單元與 E2E 驗收基準。
