## Context

行事曆「僅自選股」篩選器啟用後沒有作用。JWT strategy 確認正確注入 `userId`，API 參數序列化正確。

根因鎖定在兩處：

1. **Watch 觸發不穩定**：`watch([year, month, filters], loadEvents, { deep: true })` 中 `filters` 是 `ref<object>`。Vue 3 deep watch 對 ref 包裹的 object property 變更理論上應觸發，但實務上建議改為 explicit getter，避免版本差異。

2. **自選股為空時無 UI 回饋**：若使用者自選股清單為空，`watchlistSet = new Set([])`，Prisma query 加入 `{ stockCode: { in: [] } }` 回傳 0 筆。前端無任何提示，使用者誤以為功能壞掉。

## Goals / Non-Goals

**Goals:**
- 確保 `watchlistOnly` toggle 每次變更都確實觸發 `loadEvents`
- 自選股為空時顯示提示訊息

**Non-Goals:**
- 不改後端服務邏輯（已正確）
- 不改 JWT / auth 流程

## Decisions

**D1: 改用 explicit watch getter**
```ts
// 改前（可能不穩定）
watch([year, month, filters], loadEvents, { deep: true })

// 改後（明確）
watch([year, month], loadEvents)
watch(() => filters.value.watchlistOnly, loadEvents)
watch(() => filters.value.freq, loadEvents)
watch(() => filters.value.yieldGt, loadEvents)
```
每個 filter property 獨立 watch，確保 Vue 正確追蹤。

**D2: 空自選股提示**
`watchlistOnly = true` 且 `events.value.length === 0` 時，於行事曆主區顯示 inline 提示：「自選股清單為空 — 前往新增」。

## Risks / Trade-offs

- [多個 watch] 可能觸發多次 `loadEvents`（year+month 同時變更時）→ 可接受，因 API 較輕量，或可加簡單 debounce
