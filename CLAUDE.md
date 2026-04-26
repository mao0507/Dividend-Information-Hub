# 股息站 Dividend Hub — 專案開發規範

## JavaScript / TypeScript 風格

### 函式宣告一律使用 ES6 const 箭頭函式

```ts
// ❌ 禁止
function fetchData(id: string) { ... }

// ✅ 正確
const fetchData = (id: string): Promise<Data> => { ... }
```

### 每個函式都必須加 JSDoc 註解

包含 `@param`、`@returns`，async 函式加 `@returns {Promise<...>}`：

```ts
/**
 * 取得股票詳細資料
 * @param code 股票代號，例如 '2330'
 * @returns 股票詳情物件
 */
const getStockDetail = async (code: string): Promise<StockDetail> => { ... }
```

---

## Vue 3 Composition API 型別規範

### ref 必須明確標注型別

```ts
// ❌ 禁止
const count = ref(0)
const user = ref(null)

// ✅ 正確
const count = ref<number>(0)
const user = ref<User | null>(null)
```

### computed 必須明確標注回傳型別

```ts
// ❌ 禁止
const fullName = computed(() => `${first.value} ${last.value}`)

// ✅ 正確
const fullName = computed<string>(() => `${first.value} ${last.value}`)
```

---

## 套用範圍

以上規則適用於：
- `frontend/src/**/*.ts`
- `frontend/src/**/*.vue`（`<script setup>` 區塊）
- `backend/src/**/*.ts`
