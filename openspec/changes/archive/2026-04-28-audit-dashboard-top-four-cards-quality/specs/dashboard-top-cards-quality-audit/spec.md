## ADDED Requirements

### Requirement: 四個統計卡必須有一致且可驗證的狀態輸出
系統 MUST 對四個統計卡在 `ready`、`empty`、`stale`、`error` 提供一致且可測試的輸出規則，至少包含顯示值與次文案（subtext）兩個層面。

#### Scenario: ready 狀態顯示實值
- **WHEN** Dashboard 摘要資料完整且 freshness 判定有效
- **THEN** 四個統計卡 SHALL 顯示對應實值而非 `--`
- **AND** 次文案 SHALL 顯示該卡語意資訊（例如代號列表、自選股數、最長天數、入帳日期）

#### Scenario: 非 ready 狀態顯示中性值
- **WHEN** 狀態為 `empty`、`stale` 或 `error`
- **THEN** 四個統計卡 SHALL 顯示 `--`
- **AND** 不得以 `0` 作為缺值替代

### Requirement: 缺值、過期、錯誤三種狀態文案必須可區分
系統 MUST 對 `empty`、`stale`、`error` 輸出可辨識且不互相混淆的文案。

#### Scenario: empty 文案中性
- **WHEN** 摘要資料不存在（例如初載無可用資料）
- **THEN** 卡片次文案 SHALL 顯示中性文案（例如「暫無資料」）

#### Scenario: stale 文案提示同步中
- **WHEN** 摘要存在但 `asOf` 缺失或 freshness 失效
- **THEN** 卡片次文案 SHALL 顯示同步/過期提示（例如「資料同步中」）

#### Scenario: error 文案提示失敗
- **WHEN** 請求流程失敗
- **THEN** 卡片次文案 SHALL 顯示錯誤提示（例如「資料讀取失敗」）

### Requirement: 日期時間輸出必須可讀且不可直接顯示 ISO 原始格式
系統 MUST 對卡片中的日期或時間欄位做可讀化處理，MUST NOT 直接顯示原始 ISO timestamp 字串。

#### Scenario: 下次入帳日期顯示可讀格式
- **WHEN** 卡片有入帳日期資訊
- **THEN** 日期 SHALL 以使用者可讀格式顯示（例如 `YYYY/MM/DD` 或在地格式）
- **AND** 不得顯示含 `T` 與毫秒時區段之原始 ISO 字串
