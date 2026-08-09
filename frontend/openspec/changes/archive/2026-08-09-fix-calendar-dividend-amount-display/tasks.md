## 1. 修正晶片 layout 確保金額可見

- [x] 1.1 `Calendar.vue`：移除外層 chip div 的 `truncate` class，改加 `min-w-0`
- [x] 1.2 第一個 span（stock code/name）改為 `flex-1 truncate` 確保名稱自行截斷
- [x] 1.3 第二個 span（金額）移除 `shrink-0`，保留 `text-accent`，補 `ml-1`

## 2. 新增 amountLabel helper 處理零值

- [x] 2.1 `Calendar.vue`：新增 `const amountLabel = (ev: CalendarEvent): string => ev.amount > 0 ? \`$\${ev.amount.toFixed(1)}\` : '—'`
- [x] 2.2 template 第 134 行改用 `{{ amountLabel(ev) }}` 取代 `{{ ev.amount.toFixed(1) }}`

## 3. 驗收

- [x] 3.1 執行 `pnpm test` 確認無回歸（88 passed）
- [ ] 3.2 手動驗證：有 `cash > 0` 的除息日格子顯示 `$X.X`；無資料格子顯示 `—`
