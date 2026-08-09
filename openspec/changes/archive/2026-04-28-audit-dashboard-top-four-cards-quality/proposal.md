## Why

Dashboard 上方四個統計卡目前雖可顯示數值，但在缺值、過期與格式化情境仍可能出現誤導（例如顯示 `0` 或 ISO 時間字串），影響使用者判讀。需要建立可重複執行的品質檢查與驗收標準，確認四卡「正常且完善」。

## What Changes

- 新增四卡品質驗收能力，定義正常、缺值、過期三種狀態的必須行為與文案。
- 補充四卡顯示值與時間文案規則，要求禁止誤導數值與不友善時間格式。
- 建立可追蹤的驗證清單（手動 + 測試）並輸出檢查結果，讓後續改動可快速回歸。

## Capabilities

### New Capabilities
- `dashboard-top-cards-quality-audit`: 定義四個統計卡的顯示正確性與完善度檢查標準

### Modified Capabilities
- `dashboard-hero-quote-accuracy`: 擴充與四卡共用時間基準時的降級與文案一致性要求

## Impact

- 受影響區域：`frontend/src/pages/DashboardPage.vue`、`frontend/src/utils/dashboardTopCards.ts`、對應測試檔
- 受影響流程：Dashboard 初載、缺值/過期降級顯示、手動驗收紀錄
- API/依賴：不新增第三方套件，不變更後端 API
