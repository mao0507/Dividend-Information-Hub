## 1. 修正 makeCell 日期 key 與事件比對

- [x] 1.1 `Calendar.vue`：新增 helper `toLocalDateKey(d: Date): string`，使用 `getFullYear/getMonth/getDate` 拼接，取代 `toISOString().slice(0, 10)`
- [x] 1.2 `makeCell` 中 `key` 改用 `toLocalDateKey(date)`
- [x] 1.3 事件過濾中 `exDate`/`payDate` 比對改為直接 `ev.exDate?.slice(0, 10)` 與 `ev.payDate?.slice(0, 10)`，移除 `new Date()` 轉換

## 2. 修正 fmtDate 顯示偏移

- [x] 2.1 `fmtDate`：改用 `d.split('-')` 取年月日，回傳 `${Number(m)}/${Number(day)}`，移除 `new Date()` 構造

## 3. 驗收

- [x] 3.1 執行 `pnpm test` 確認測試通過
- [ ] 3.2 手動驗證：行事曆除息事件顯示在正確日期格子
