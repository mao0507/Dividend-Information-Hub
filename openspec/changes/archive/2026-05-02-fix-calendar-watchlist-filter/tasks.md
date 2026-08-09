## 1. 修正 watch 觸發問題

- [x] 1.1 Calendar.vue：移除 `watch([year, month, filters], loadEvents, { deep: true })`
- [x] 1.2 改為獨立 watch：`watch([year, month], loadEvents)`
- [x] 1.3 新增 `watch(() => filters.value.watchlistOnly, loadEvents)`
- [x] 1.4 新增 `watch(() => filters.value.freq, loadEvents)`
- [x] 1.5 新增 `watch(() => filters.value.yieldGt, loadEvents)`

## 2. 自選股為空時的 UI 提示

- [x] 2.1 Calendar.vue：新增 `watchlistEmpty` computed：`filters.value.watchlistOnly && !loading.value && events.value.length === 0`
- [x] 2.2 在行事曆格子區域加入條件渲染：當 `watchlistEmpty` 為 true，顯示居中提示卡片
- [x] 2.3 提示卡片內容：「自選股清單為空」 + RouterLink 到 `/watchlist`

## 3. 驗收

- [x] 3.1 手動確認：點選「僅自選股」後行事曆立即重新載入
- [x] 3.2 手動確認：自選股清單有股票時，篩選結果正確
- [x] 3.3 手動確認：自選股清單為空時，顯示提示訊息
