## 1. Calendar.vue 溢出邏輯

- [x] 1.1 新增 `overflowDialogDate` ref（`ref<string | null>(null)`）
- [x] 1.2 在 `eventsByDate` computed 確認已按日期 key 分組（現有邏輯確認即可）
- [x] 1.3 日期格 template：將 `v-for` 改為 `slice(0, 2)` 只渲染前 2 筆

## 2. +N 更多 按鈕

- [x] 2.1 在日期格內，當 `eventsByDate[dateKey].length > 2` 時顯示 `+N 更多` 按鈕
- [x] 2.2 按鈕點擊設定 `overflowDialogDate = dateKey`（stop propagation）
- [x] 2.3 套用符合主題的按鈕樣式（font-mono、text-accent、text-[10px]）

## 3. 溢出 Dialog

- [x] 3.1 引入 PrimeVue `Dialog` 元件
- [x] 3.2 在 template 底部加入 `<Dialog>` 綁定 `v-model:visible`（`overflowDialogDate != null`）
- [x] 3.3 Dialog 標題顯示日期（格式 `YYYY/MM/DD`）
- [x] 3.4 Dialog 內建表格，欄位：代號、名稱、除息金額
- [x] 3.5 除息金額為 0 時顯示「尚未公布」，否則顯示 `x.xx 元`
- [x] 3.6 Dialog 關閉時將 `overflowDialogDate` 設回 `null`

## 4. 驗收

- [ ] 4.1 手動確認：找到同日多筆除息的日期，確認只顯示前 2 筆 + `+N 更多`
- [ ] 4.2 手動確認：點擊 `+N 更多` 後 Dialog 正確彈出並顯示完整清單
- [ ] 4.3 手動確認：Dialog 關閉功能正常
