## ADDED Requirements

### Requirement: 四個統計區塊必須使用一致資料契約
系統 MUST 以前端統一資料模型渲染 Dashboard 上方四個統計區塊，且每個區塊 MUST 至少包含 `title`、`displayValue`、`state`、`asOf` 四項欄位；不得在模板中直接消化 API 原始欄位。

#### Scenario: 四個區塊完整資料
- **WHEN** Dashboard 載入時可取得完整且有效的四區塊原始資料
- **THEN** 系統 SHALL 轉換為四筆統一資料模型並渲染，且每筆均含 `asOf` 與 `state='ready'`

#### Scenario: 單一區塊資料缺漏
- **WHEN** 任一區塊缺少必要欄位或值無法解析
- **THEN** 系統 SHALL 僅將該區塊標記為非 ready 狀態，其他區塊維持可用，且不得因單一缺漏導致全區塊渲染失敗

### Requirement: 缺值或異常時不得顯示誤導數字
系統 MUST 在資料缺漏、同步失敗或 freshness 驗證失敗時，對受影響區塊顯示中性值（例如 `--`）與狀態文案，不得顯示 `0` 作為缺值替代。

#### Scenario: 區塊資料缺漏
- **WHEN** 區塊值為 null、NaN、空字串或不存在
- **THEN** 系統 SHALL 以中性值顯示且標記 `state='empty'`，不得顯示數值 0

#### Scenario: 區塊資料過期或同步失敗
- **WHEN** 區塊來源資料被判定為 stale 或 API 錯誤
- **THEN** 系統 SHALL 以中性值顯示且標記 `state='stale'` 或 `state='error'`

### Requirement: 四區塊與 Hero 報價必須共享資料時間基準
系統 MUST 讓四個統計區塊與 Hero 報價使用同次載入的 `asOf` 基準；若該基準不可用，系統 MUST 將四區塊與 Hero 共同降級為中性顯示。

#### Scenario: asOf 一致
- **WHEN** Dashboard 頁面完成單次資料載入
- **THEN** 四個統計區塊與 Hero 報價 SHALL 使用一致的 `asOf` 來源

#### Scenario: asOf 不可用
- **WHEN** 無法取得可用 `asOf` 或 freshness 驗證失敗
- **THEN** 系統 SHALL 對四區塊與 Hero 同步套用中性顯示策略
