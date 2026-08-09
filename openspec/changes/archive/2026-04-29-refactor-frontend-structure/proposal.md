## Why

目前 `frontend/src/` 混用「功能頁面」與「共用邏輯」，`pages/` 下所有頁面平鋪、`api/` 命名不一致、`primevue-pt.ts` 懸在根目錄，隨著功能增加會越來越難定位程式碼。透過導入全域（Global）與功能域（Domain）分離的目錄慣例，讓每個業務功能自我管理其 composables/components，全域共用資源集中放置，可大幅降低維護成本。

## What Changes

- **`pages/` → `views/`**：改名並以業務功能分資料夾（`dashboard/`, `calendar/`, `ranking/`, `alerts/`, `settings/`, `stock/`, `watchlist/`, `holdings/`, `drip/`, `viz/`, `auth/`）；每個功能域可有自己的 `composables/` 與 `components/`。
- **`api/` → `services/`**：`api/index.ts`（axios 實例）改名為 `services/request.ts`；各功能 API 模組移至 `services/api/`；加入 `services/api/index.ts` 作為 barrel export。
- **`primevue-pt.ts` → `plugins/primevue.ts`**：移入新增的 `plugins/` 目錄統一管理第三方整合。
- **`components/dashboard/KpiCard.vue` → `views/dashboard/components/KpiCard.vue`**：僅 Dashboard 使用的元件移入功能域。
- **`utils/dashboardTopCards.ts` → `views/dashboard/utils/dashboardTopCards.ts`**：Dashboard 專用工具函式移入功能域。
- **新增 `styles/` 目錄**：目前 `src/style.css` 移至此。
- **刪除 `components/HelloWorld.vue`**：未使用的鷹架檔案。
- **更新路由 `@/pages/` import → `@/views/`**（router/index.ts 及所有 spec 引用）。
- **更新 `@/api/` import → `@/services/api/`**（所有 pages/components 的 import 路徑）。

## Capabilities

### New Capabilities

- `frontend-directory-structure`：前端 src/ 目錄慣例，定義全域資源擺放規則與功能域自治原則，作為後續所有新功能的開發標準。

### Modified Capabilities

（無需求層級的行為變更，純架構重組）

## Impact

- **router/index.ts**：所有 `component: () => import('@/pages/...')` 改為 `@/views/...`。
- **全部 page 元件**：`import ... from '@/api/...'` 改為 `@/services/api/...`。
- **main.ts**：`import { primevuePT } from './primevue-pt'` 改為 `'./plugins/primevue'`。
- **測試 spec 檔案**：mock path 同步更新。
- **vite.config.ts**：`@` alias 不變，無需修改。
- **不影響後端、API 合約、測試邏輯本身**。
