## Context

目前 `Onboarding.vue` 存在但未與任何功能完整整合。路由守衛與 `Unauthorized.vue` 已在上一個 change（`add-route-guard`）中被調整為指向 `/onboarding`，但這造成：
1. 使用者因找不到完整 onboarding 流程而困惑
2. 路由邏輯需同時處理 `/login` 與 `/onboarding` 兩個入口
3. `Onboarding.vue` 只有頁面殼，無後端整合

## Goals / Non-Goals

**Goals:**
- 移除 `/onboarding` 路由與對應元件
- 讓所有認證重導向統一走 `/login`
- 測試保持 100% 通過

**Non-Goals:**
- 重新設計 onboarding 流程（未來另立 change）
- 修改 `Login.vue` 內容
- 調整其他公開路由（`/401`、`/403`）

## Decisions

**保留 `Login.vue` 作為唯一認證入口**
Onboarding 精靈功能未完整，`/login` 已能滿足目前所有認證需求。合併入口降低維護成本。

**直接刪除 `Onboarding.vue`，不保留 dead code**
若未來需要 onboarding 功能，應重新設計而非復原現有殼，git history 保留原始實作。

## Risks / Trade-offs

未來若要實作 onboarding 流程，需從 git history 還原 `Onboarding.vue` 並重新設計整合點。→ 可接受，因現有實作不完整。
