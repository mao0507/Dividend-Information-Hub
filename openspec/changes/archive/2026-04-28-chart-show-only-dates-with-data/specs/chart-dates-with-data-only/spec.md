## ADDED Requirements

### Requirement: 圖表僅顯示有有效價格資料的日期
系統 MUST 僅將同時具備有效日期與可解析收盤價（且收盤價大於 0）的資料點輸出至圖表資料集合；不得輸出缺值、無法解析或無效價格的日期點。

#### Scenario: 混合有效與無效資料
- **WHEN** 輸入資料同時包含有效收盤價與無效收盤價（例如 `null`、`NaN`、`0`、非數字字串）
- **THEN** 系統 SHALL 僅輸出有效收盤價對應的日期與數值點

### Requirement: 圖表時間軸與數列索引必須一致
系統 MUST 由同一份過濾後資料同時產生圖表 labels 與 series，確保每個時間軸日期都對應唯一數值點，且順序一致。

#### Scenario: 過濾後索引對齊
- **WHEN** 原始資料含有中間缺資料日而被過濾
- **THEN** 系統 SHALL 使 labels 長度與 series 長度相等
- **AND** 系統 SHALL 保持 labels 與 series 的索引一一對應

### Requirement: 無有效資料時回傳空圖表資料
系統 MUST 在輸入資料皆為無效點或輸入為空時，回傳空 labels 與空 series，不得補入無資料日期佔位。

#### Scenario: 全部資料無效
- **WHEN** 輸入資料不存在任何有效收盤價點
- **THEN** 系統 SHALL 回傳空 labels 與空 series
