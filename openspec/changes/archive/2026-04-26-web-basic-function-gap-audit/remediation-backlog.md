## P0 / P1 修補任務清單

### P0-001 Command Palette 快捷動作落地
- 對應缺口：GAP-001
- owner:
  - frontend
  - backend（若需新增提醒建立 API）
- scope:
  - `frontend/src/components/layout/CommandPalette.vue`
  - 相關 API client / route
- deliverables:
  - 「設定除息提醒」連到規則建立流程
  - 「加入自選股」可直接帶入代號加入目標分組
- acceptance:
  - 兩個快捷動作皆能完成一個具體業務結果
  - 失敗時顯示可見錯誤訊息
- tests:
  - unit: CommandPalette action handler
  - integration: action → API 呼叫
  - e2e: 開 palette → 執行快捷動作 → 驗證結果

### P0-002 設定資料持久化（券商連結 / 同步偏好）
- 對應缺口：GAP-002
- owner:
  - backend
  - frontend
- scope:
  - `backend/src/settings/settings.service.ts`
  - Prisma schema / migration
  - `frontend/src/pages/SettingsPage.vue`
- deliverables:
  - 移除 in-memory `Map` 暫存
  - 改由資料庫儲存與讀取
  - 保持既有 API 契約或給明確升級說明
- acceptance:
  - 服務重啟後資料仍存在
  - 設定頁重整可讀回正確狀態
- tests:
  - unit: settings service persistence paths
  - integration: API create/update/read with DB
  - e2e: 設定變更 → 重整頁面 → 狀態一致

### P1-001 補齊設定頁非 brokers/appearance 區塊
- 對應缺口：GAP-003
- owner: frontend
- deliverables:
  - 至少提供可檢視資料或明確 disabled 狀態（含「尚未開放」文案）
- tests:
  - unit: nav 切換與區塊渲染
  - e2e: 切換各設定分頁不再只有準備中文案

### P1-002 統一錯誤回饋策略
- 對應缺口：GAP-004
- owner:
  - frontend
- scope:
  - Dashboard / Settings / Alerts 等主要頁面
- deliverables:
  - API 失敗時統一提示（toast/inline message）
  - 保留 fallback 但不得靜默吞錯
- tests:
  - unit: error handler
  - e2e: 模擬 500/401 顯示正確提示

### P1-003 通知管道能力與 UI 對齊
- 對應缺口：GAP-005
- owner:
  - frontend
  - backend（若要新增 Email/LINE 能力）
- deliverables:
  - 已支援能力才顯示為可用
  - 未支援能力顯示規劃中狀態與限制
- tests:
  - unit: channel status mapping
  - e2e: 提醒中心管道狀態展示與後端回應一致
