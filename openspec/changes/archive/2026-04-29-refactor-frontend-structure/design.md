## Context

`frontend/src/` 目前有約 60 個 `.vue`/`.ts` 檔，分佈在 `api/`, `components/`, `pages/`, `stores/`, `utils/` 等頂層目錄。隨著功能擴增（holdings、drip、viz 等），單純按檔案類型分類導致同一業務功能的邏輯散落各處。使用者提供的目錄慣例（全域 vs 功能域分離）已被驗證適合中大型 Vue 3 後台專案。

## Goals / Non-Goals

**Goals:**
- 建立一致的目錄慣例，全域資源 vs 功能域資源界線清晰
- 所有 import 路徑正確更新，`pnpm build` 與 `pnpm test` 通過
- `views/<domain>/` 結構讓每個功能可自治管理其 composables/components

**Non-Goals:**
- 不新增任何業務功能或 UI 變更
- 不拆分 router（維持單一 `router/index.ts`）
- 不引入 i18n、plugins（config/locales 目錄預留但本次不建立內容）
- 不改變 Vite alias `@` 設定

## Decisions

### 1. `pages/` 改名為 `views/`，按業務功能建子目錄

**決定**：所有頁面元件移至 `views/<domain>/`，命名去掉 `Page` 後綴（例：`DashboardPage.vue` → `views/dashboard/Dashboard.vue`）。

**理由**：與使用者提供的慣例一致；去掉 `Page` 後綴在 domain 資料夾下已能表達角色；router lazy import 路徑同步更新。

**替代方案**：保留 `pages/`、在其下建 domain 子目錄 → 否定，`pages/` 命名暗示扁平結構，易回到舊習慣。

### 2. 功能域頁面元件保留在 domain 根，不再加 `Page` 後綴

**決定**：`views/dashboard/Dashboard.vue`（非 `views/dashboard/DashboardPage.vue`）。

**理由**：domain 資料夾本身已提供足夠語意，`Page` 後綴冗餘。

### 3. `api/` → `services/`，axios 實例獨立為 `services/request.ts`

**決定**：
```
services/
├── request.ts        # axios 實例（原 api/index.ts）
└── api/
    ├── index.ts      # barrel export（export * from './auth' ...）
    ├── auth.ts
    ├── alerts.ts
    └── ...（其餘 API 模組）
```
**理由**：`request.ts`（基礎設施）與 `api/*.ts`（業務呼叫）職責分開；barrel `index.ts` 讓呼叫方只需 `import { authApi } from '@/services/api'`。

**替代方案**：保留 `api/`，僅加 barrel → 否定，命名與使用者慣例不符。

### 4. `primevue-pt.ts` → `plugins/primevue.ts`

**決定**：建立 `plugins/` 目錄，`primevue-pt.ts` 移入並改名 `primevue.ts`，export 名稱不變（`primevuePT`）。

**理由**：根目錄懸浮檔案找不到歸屬；`plugins/` 符合「第三方整合初始化」語意。

### 5. 功能域專用元件／工具下放到 domain

**決定**：
- `components/dashboard/KpiCard.vue` → `views/dashboard/components/KpiCard.vue`
- `utils/dashboardTopCards.ts` → `views/dashboard/utils/dashboardTopCards.ts`

圖表元件（`components/chart/*`）跨多個功能使用，**維持在全域 `components/chart/`**。

**理由**：KpiCard 僅在 Dashboard 使用，下放讓 `components/` 只剩真正跨域共用的元件。

### 6. `types/index.ts` 保留位置不動

**決定**：`types/` 不在使用者模板內，但本專案全局共用 TypeScript 型別，維持 `src/types/index.ts`。

### 7. Import 路徑更新策略

統一採用 find-and-replace 更新：
- `from '@/pages/` → `from '@/views/`
- `from '@/api/` → `from '@/services/api/`
- `from './primevue-pt'` → `from './plugins/primevue'`
- 路由 lazy import 同步更新
- spec 檔案 mock path 同步更新

## Risks / Trade-offs

- **大量 import 路徑修改** → 風險：漏改導致 build 失敗。緩解：修改完後立即跑 `pnpm build && pnpm test`，以錯誤訊息定位漏改處。
- **spec 測試路徑** → 有些 spec 直接 import page 元件，路徑改變後 mock 需同步。緩解：修改後跑 `pnpm test` 確認。
- **router lazy import** → 路由若仍指向舊路徑，runtime 才會報錯，build 不一定能抓到。緩解：修改後手動測試每個路由是否能正常載入。
