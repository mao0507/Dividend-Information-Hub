## ADDED Requirements

### Requirement: Dashboard 必須提供可驗證的累積股息收入定義
系統 MUST 將 Dashboard 的「累積股息收入」定義為在指定統計期間內、已確認入帳的現金股息總和，不得混入未確認或預估配息資料。

#### Scenario: 期間內有已確認入帳資料
- **WHEN** API 回傳至少一筆在統計期間內且狀態為已確認入帳的股息紀錄
- **THEN** 系統 SHALL 顯示該期間累加後的金額，並標記卡片 `state='ready'`

#### Scenario: 僅有未確認或預估資料
- **WHEN** API 只回傳未確認入帳或預估配息資料
- **THEN** 系統 SHALL 將卡片視為無可用累積收入資料並顯示中性值，且不得以預估值替代

### Requirement: 累積股息收入缺值時不得顯示 0
當累積股息收入資料缺漏、格式錯誤、計算失敗或來源不可用時，系統 MUST 顯示中性值（例如 `--`）與對應狀態文案，不得用 `0` 代表未知或錯誤狀態。

#### Scenario: 欄位缺漏或無法解析
- **WHEN** 累積股息收入欄位不存在、為空字串、null、NaN 或非數值格式
- **THEN** 系統 SHALL 顯示中性值並標記 `state='empty'`

#### Scenario: 來源錯誤或資料過期
- **WHEN** Dashboard 載入時 API 錯誤或 freshness 驗證失敗
- **THEN** 系統 SHALL 顯示中性值並標記 `state='error'` 或 `state='stale'`

### Requirement: 累積股息收入必須與 Dashboard 共用 asOf 時間基準
系統 MUST 讓累積股息收入卡片與 Hero 報價及其他摘要卡片共享同次載入的 `asOf` 時間基準；若共同基準不可用，卡片 MUST 降級為中性顯示。

#### Scenario: asOf 可用且一致
- **WHEN** Dashboard 完成單次資料載入且可取得有效 `asOf`
- **THEN** 累積股息收入卡片 SHALL 使用相同 `asOf`，與其他卡片保持一致

#### Scenario: asOf 缺漏
- **WHEN** 無法取得可用 `asOf` 或來源時間不一致無法對齊
- **THEN** 系統 SHALL 將累積股息收入卡片降級為中性顯示並標記非 `ready` 狀態
