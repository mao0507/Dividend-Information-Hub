## Metadata

- timestamp: 2026-04-26T23:00:00+08:00
- change: web-basic-function-gap-audit
- scope:
  - `frontend/src/pages/**`
  - `frontend/src/components/layout/CommandPalette.vue`
  - `backend/src/settings/settings.service.ts`

## Journey Status

- 登入/註冊：**部分可用**
- 儀表板：**部分可用**
- 自選股：**可用**
- 提醒中心：**部分可用**
- 設定：**部分可用**
- 全域搜尋：**部分可用**

## Gap Details

### GAP-001（P0）
- category: 功能缺失
- title: Command Palette 快捷動作為空操作
- evidence: `frontend/src/components/layout/CommandPalette.vue`
- reproduce:
  1. 開啟 Command Palette。
  2. 點擊「設定除息提醒」或「加入自選股」動作。
- expected: 導向可用流程（提醒建立或加入自選）。
- actual: `fn: () => {}`，無任何行為。
- impact: 全域搜尋入口不能完成關鍵操作，降低導航效率。

### GAP-002（P0）
- category: 資料真實性缺失
- title: 設定中的券商連結/同步偏好為記憶體暫存
- evidence: `backend/src/settings/settings.service.ts`
- reproduce:
  1. 在設定頁連結券商或切換同步偏好。
  2. 重啟後端服務後重新登入查看設定。
- expected: 設定應持久化保存。
- actual: 使用 `Map` in-memory 儲存，重啟後遺失。
- impact: 造成資料遺失與使用者信任問題。

### GAP-003（P1）
- category: 串接缺失
- title: 設定頁多區塊僅顯示「準備中」
- evidence: `frontend/src/pages/SettingsPage.vue`
- reproduce:
  1. 進入設定頁。
  2. 切換帳號/個人資料/通知/訂閱/資料匯出/安全/關於。
- expected: 至少提供基本可編輯或可檢視內容。
- actual: 顯示「區塊準備中」。
- impact: 設定資訊架構存在，但多數功能不可用。

### GAP-004（P1）
- category: 驗收缺失
- title: 多處 API 失敗被 `catch {}` 或 ignore，缺乏可見錯誤回饋
- evidence:
  - `frontend/src/pages/DashboardPage.vue`（silently fail）
  - `frontend/src/pages/SettingsPage.vue`（ignore）
  - `frontend/src/pages/AlertsPage.vue`（多處 catch fallback）
- reproduce:
  1. 模擬 API 失敗（401/500）。
  2. 觀察頁面回應。
- expected: 顯示錯誤訊息或明確空狀態，且便於追蹤。
- actual: 多數情況無可見錯誤提示。
- impact: 使用者無法判斷是無資料或系統錯誤，除錯困難。

### GAP-005（P1）
- category: 串接缺失
- title: 提醒中心通知管道顯示與實際能力不一致
- evidence: `frontend/src/pages/AlertsPage.vue`
- reproduce:
  1. 進入提醒中心右側「通知管道狀態」。
- expected: 只顯示已落地管道或標記為未開放。
- actual: 顯示 Email/LINE 狀態但未見完整串接能力。
- impact: 功能認知落差，易造成使用者誤解。

## Summary

- total gaps: 5
- P0: 2
- P1: 3
- P2: 0

優先修補建議：
1. 先修 `GAP-001`、`GAP-002`（P0）。
2. 再補 `GAP-003 ~ GAP-005`（P1）並加上可見錯誤回饋與驗收測試。
