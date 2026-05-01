# 股息站 Dividend Hub — 專案開發規範

## git commit 
-  git commit 訊息 請使用正體中文
-  必須要有 type (Prefix) , 請參照類別規範
-  必須要有 subject 
   -  不超過 50 個字元
   -  結尾不加句號
   -  盡量讓 Commit 單一化，一次只更動一個主題

### <type> 類別規範 
* feat：新增或修改功能（feature）
* fix：修補 bug（bug fix）
* docs：文件（documentation）
* style：格式
* refactor：重構
* perf：改善效能（improves performance）
* test：增加測試（when adding missing tests）
* chore：maintain，不影響程式碼運行，建構程序或輔助工具的變動
* revert：撤銷回覆先前的 commit

## 工作流程
- SDD：openapi.yaml = 唯一事實來源
- 寫程式前必須先 /opsx:propose
- 用 openspec apply 傳播規格變更

## 風格
- 第一則訊息載入 caveman skill
- Caveman 完整模式：省略填充語、片段句可接受、程式區塊保持原樣
- 安全自動切換：安全性或破壞性操作時自動恢復詳細輸出

## JavaScript / TypeScript 風格

### 函式宣告一律使用 ES6 const 箭頭函式

```ts
// ❌ 禁止
function fetchData(id: string) { ... }

// ✅ 正確
const fetchData = (id: string): Promise<Data> => { ... }
```

### 每個函式都必須加 JSDoc 註解

含 `@param`、`@returns`，async 加 `@returns {Promise<...>}`：

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

## Vue Template HTML 風格

### 無內容的標籤一律使用自閉合語法

```html
<!-- ❌ 禁止 -->
<div class="flex-1"></div>
<span></span>
<img src="..."></img>

<!-- ✅ 正確 -->
<div class="flex-1" />
<span />
<img src="..." />
```

> 無子節點（文字、元素、插值）= 無內容，須自閉合。

---

## 套用範圍

規則適用：
- `frontend/src/**/*.ts`
- `frontend/src/**/*.vue`（`<script setup>` 區塊）
- `backend/src/**/*.ts`
