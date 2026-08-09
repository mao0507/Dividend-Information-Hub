# dashboard-week-ex-div-count Specification

## Purpose
確保 Dashboard「本週除息」計數以台北時區之日曆週為準，並與「今日除息」共享相同的時區基準，避免跨時區邏輯矛盾。

## Requirements
### Requirement: 「本週除息」計數 MUST 以台北時區之日曆週為準

Dashboard 摘要 API 回傳之 `weekExDiv.count` MUST 代表：在 **Asia/Taipei** 時區下，**當週週一 00:00:00 至週日 23:59:59.999**（含兩端整日）內，至少有一筆 `exDate` 落於該區間之股息事件所對應的**相異股票代號**數量。不得再以「自伺服器本地今日起連續 7 個日曆日」作為唯一定義。

#### Scenario: 週二為參考日且除息落在本週週三

- **WHEN** 參考「現在」為某週週二（台北），且資料庫中股票 A 之 `exDate` 落於該週週三（台北日期）
- **THEN** `weekExDiv.count` MUST 至少包含股票 A 一檔（若無其他股票則為 1）

#### Scenario: 除息日落在上週日

- **WHEN** 參考「現在」為某週週一（台北），且股票 B 之 `exDate` 為上一日曆週之週日（台北日期）
- **THEN** `weekExDiv.count` MUST NOT 將股票 B 計入本週檔數

### Requirement: 查詢上下界 MUST 涵蓋整日且與 Prisma 比較一致

用於篩選 `exDate` 之區間起訖 MUST 對應台北該週第一日之開始與最後一日之結束（毫秒精度明確），使資料庫中以「日期」語意儲存之 `DateTime` 不會因「僅上界為次日 00:00」而系統性排除最後一日之事件。

#### Scenario: 除息日為週日當日整日

- **WHEN** 股票 C 之 `exDate` 對應台北該週週日之交易日除息（儲存為該日之合理 `DateTime`）
- **THEN** `weekExDiv.count` MUST 將股票 C 計入該週

### Requirement: 自選股本週除息檔數 MUST 與全體本週除息使用相同時間窗與去重規則

`weekExDiv.watchlistCount` MUST 等於：於上述同一週區間與去重規則下，其股票代號存在於該使用者自選股集合之檔數。

#### Scenario: 自選股僅命中一檔本週除息

- **WHEN** 本週除息相異股票為 {2330, 0050}，使用者自選股僅含 2330
- **THEN** `weekExDiv.count` MUST 為 2
- **AND** `weekExDiv.watchlistCount` MUST 為 1

### Requirement: 「今日除息」MUST 與「本週除息」共享台北日界線

`todayExDiv` 所使用之「今日」日期 MUST 與 `weekExDiv` 所使用之 **Asia/Taipei** 日曆一致，避免儀表板同頁卡片因 UTC/本地混用出現「今日無、本週有」或相反之邏輯矛盾。

#### Scenario: 伺服器 UTC 與台北差一日

- **WHEN** UTC 時間仍為前一日但台北已進入新曆日，且除息 `exDate` 落在台北「今日」
- **THEN** `todayExDiv.count` MUST 反映該除息事件（不得僅依伺服器 UTC 午夜判定「今日」）
