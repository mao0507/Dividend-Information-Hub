## Context

目前前端路由已涵蓋主要功能頁，但對未知路徑沒有統一 Not Found 體驗。使用者輸入錯誤網址、舊書籤或外部連結失效時，缺少明確提示與導引，造成可用性下降。此變更聚焦前端路由與 UI 層，不涉及後端 API。

## Goals / Non-Goals

**Goals:**
- 為未知路徑提供一致的 404 頁面。
- 讓 404 頁面提供可行動導引（返回儀表板、回上一頁）。
- 確保路由順序正確，避免影響既有有效路由。
- 補齊最小驗收測試，確保未來重構不破壞 404 行為。

**Non-Goals:**
- 不修改後端路由或伺服器 rewrites 策略。
- 不做完整品牌視覺重設計。
- 不新增複雜分析追蹤（如 GA 事件）於此變更。

## Decisions

1. **使用 Vue Router catch-all 作為 404 入口**
   - 採用 `/:pathMatch(.*)*` 放在路由最後。
   - 理由：Vue Router 官方建議，能覆蓋所有未匹配路徑。
   - 替代：手動在導航守衛判斷。缺點是邏輯分散、維護成本較高。

2. **404 頁面使用獨立 page component**
   - 新增 `NotFoundPage.vue`，保持與其他頁面一致的專案結構。
   - 理由：便於測試、後續文案/設計迭代，避免把 404 內容硬塞進 router 設定。

3. **提供兩個導引動作**
   - 「回到儀表板」：固定導回 `/dashboard`
   - 「返回上一頁」：優先 `router.back()`，若無歷史則 fallback `/dashboard`
   - 理由：同時覆蓋直接開新分頁與站內誤導流兩種情境。

## Risks / Trade-offs

- **[Risk] catch-all 路由位置錯誤** → 明確要求放在 routes 最後一筆，並加上路由測試。
- **[Risk] 返回上一頁在無歷史時失效** → 設計 fallback 到 `/dashboard`。
- **[Risk] 404 頁和登入守衛衝突** → 將 404 視為 public route，避免未登入時再被重導到 onboarding。

## Migration Plan

1. 新增 `NotFoundPage.vue`。
2. 更新 `frontend/src/router/index.ts`，加入 catch-all 與 meta 設定。
3. 新增/更新前端測試（路由導向 + 動作按鈕）。
4. 本機驗證：
   - 輸入不存在 URL 顯示 404
   - 點擊按鈕可返回有效頁面
5. 若出現回歸，回滾 catch-all route 與 page 引入即可（低風險）。

## Open Questions

- 404 頁面是否要在未登入狀態顯示「前往 onboarding」按鈕（目前先統一導向 dashboard/onboarding 由守衛處理）？
- 是否要補 i18n 文案鍵值（目前專案以繁體中文硬編文案為主）？
