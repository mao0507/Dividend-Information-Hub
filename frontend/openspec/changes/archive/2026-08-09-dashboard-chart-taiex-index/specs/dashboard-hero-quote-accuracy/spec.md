## REMOVED Requirements

### Requirement: Hero 報價漲跌幅須有可驗證之基準價
**Reason**: 儀表板 Hero 個股圖表已移除，改以加權指數（TAIEX）取代，不再有個股 hero quote 顯示。
**Migration**: Hero 個股行情邏輯整體廢棄；TAIEX 漲跌幅改由 `GET /dashboard/taiex-series` 的 `latest.changePct` 欄位提供，精確度規則由 `dashboard-taiex-series` spec 管轄。

### Requirement: 禁止對使用者展示明顯不合理之漲跌幅
**Reason**: 同上，個股 hero 已移除；TAIEX 指數數據由 TWSE 官方 API 提供，不存在種子資料異常問題。
**Migration**: 無須遷移，此規則不適用於 TAIEX 資料。
