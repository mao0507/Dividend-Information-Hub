## ADDED Requirements

### Requirement: 系統必須提供投資金額占比資料契約
系統 MUST 提供投資比重 API，回傳每檔股票的投資金額與占比；投資金額 MUST 以各 lot 的 `buyPrice * shares` 累計計算，不得以現價市值替代。

#### Scenario: 使用者有多檔持股
- **WHEN** 使用者呼叫投資比重 API
- **THEN** 系統 SHALL 回傳每檔股票投資金額、占比與總投資金額

#### Scenario: 使用者無持股
- **WHEN** 使用者呼叫投資比重 API 且沒有任何 lot
- **THEN** 系統 SHALL 回傳總投資金額為 0 與空比重清單

### Requirement: 圓餅圖資料比例必須可驗證
系統 MUST 保證回傳比例可重現：各股票占比總和 SHOULD 與 100% 等價（允許小數四捨五入誤差），且每筆占比 MUST 對應其投資金額與總投資金額。

#### Scenario: 一般比例計算
- **WHEN** 系統回傳多檔持股比例
- **THEN** 每筆占比 SHALL 等於該檔投資金額除以總投資金額並採固定小數位

#### Scenario: 單一持股
- **WHEN** 使用者僅持有一檔股票
- **THEN** 系統 SHALL 回傳該檔占比為 100%
