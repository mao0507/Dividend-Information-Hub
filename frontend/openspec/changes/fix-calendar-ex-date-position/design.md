## Context

`Calendar.vue` 的 `makeCell` 函式用 `date.toISOString().slice(0, 10)` 產生格子 key：

```ts
// 問題：UTC+8 下 new Date(2024, 3, 15) → "2024-04-14T16:00:00.000Z" → key = "2024-04-14"
const key = date.toISOString().slice(0, 10)
```

事件日期比對也用 `new Date(ev.exDate).toISOString().slice(0, 10)`，但 `ev.exDate = "2024-04-15"` 被 `new Date()` 解析為 UTC midnight，`toISOString()` 反而正確回 `"2024-04-15"`。結果造成 key 與 exDate 不一致，事件落在前一天格子。

`fmtDate` 用 `new Date(d).getMonth()` 同樣受 UTC 解析影響，顯示日期偏一天。

## Goals / Non-Goals

**Goals:**
- 格子 key 永遠對應本地日期
- 除息/發放日比對正確
- 詳情浮層日期顯示正確

**Non-Goals:**
- 重構整個日期處理邏輯
- 支援多時區使用者

## Decisions

**使用本地 getFullYear/getMonth/getDate 拼接 key，不用 toISOString()**
```ts
const toLocalDateKey = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
```

**事件日期直接 .slice(0, 10) 取前綴，不過 new Date()**
API 回傳的日期字串格式為 `YYYY-MM-DD` 或 `YYYY-MM-DDTHH:mm:ss.sssZ`，前 10 碼即為日期，無需解析。

**fmtDate 用字串 split 取年月日**
```ts
const [, m, d] = dateStr.split('-')
return `${Number(m)}/${Number(d)}`
```
避免任何 Date 物件構造與時區轉換。

## Risks / Trade-offs

若 API 改變日期格式（非 ISO），`slice(0,10)` 會失效。→ 可接受，後端已固定 ISO 格式。
