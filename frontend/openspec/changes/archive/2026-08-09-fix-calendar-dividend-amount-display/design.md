## Context

`Calendar.vue` 事件晶片（第 122–135 行）以 flex 容器包裹 `stockCode + stockName` 與 `amount` 兩個 span。外層 div 帶 `truncate`（`overflow: hidden`），在極窄的格子裡，若名稱過長，`amount` span 雖有 `shrink-0` 保護，但實際可見寬度極小；加上字號 `text-[9px]`，使用者幾乎看不到配息金額。

此外當 `d.cash = 0`（資料尚未同步）時，顯示 `0.0` 與「無資料」無異，對使用者有誤導性。

## Goals / Non-Goals

**Goals:**
- 配息金額永遠可見，不被截斷
- `amount = 0` 時以 `—` 取代 `0.0`
- 不影響晶片整體高度或格子 layout

**Non-Goals:**
- 重新設計行事曆格子尺寸
- 變更後端資料同步邏輯

## Decisions

**移除外層 div 的 `truncate`，改由 stock name span 自行截斷**

```html
<!-- Before -->
<div class="flex ... truncate">
  <span class="truncate">{{ ev.stockCode }} {{ ev.stockName }}</span>
  <span class="shrink-0 text-accent">{{ ev.amount.toFixed(1) }}</span>
</div>

<!-- After -->
<div class="flex min-w-0 ...">           <!-- min-w-0 讓 flex child 可縮 -->
  <span class="truncate flex-1">{{ ev.stockCode }} {{ ev.stockName }}</span>
  <span class="shrink-0 text-accent ml-1">{{ amountLabel(ev) }}</span>
</div>
```

`min-w-0` 使 flex container 不強制撐到內容寬度，`flex-1` + `truncate` 讓名稱優先截斷，amount 始終完整顯示。

**`amountLabel` 計算屬性**

```ts
const amountLabel = (ev: CalendarEvent): string =>
  ev.amount > 0 ? `$${ev.amount.toFixed(1)}` : '—'
```

加上 `$` 前綴讓金額視覺識別度更高。

## Risks / Trade-offs

- `$` 前綴非台灣常見貨幣符號（應為 NT$），但在 9px 晶片中空間有限，使用單字元 `$` 可接受。→ 若用戶反饋可改回數字+無前綴。
