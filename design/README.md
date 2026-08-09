# ⚠️ design/ 資料夾說明

**這個資料夾裡的東西跟目前的專案實作無關,不要拿來當實作參考或複製程式碼。**

## 這是什麼

這裡是純視覺／互動設計探索稿,用 **React（JSX）** 語法寫成,是設計階段用來快速拼版、比較不同視覺方向的草稿工具（含一個可拖拉排版的「design canvas」外殼）。

而本專案實際的前端實作是 **Vue 3**（`<script setup>` + Composition API,位於 `frontend/src/**/*.vue`）。兩者技術棧完全不同,`design/` 底下的元件**無法直接執行、無法直接搬進 `frontend/`**,程式邏輯、狀態管理、元件寫法都不適用於本專案。

這些檔案之前被 `.gitignore` 排除、未受版控,現屬歷史設計探索紀錄,保留供追溯設計脈絡使用。

## 檔案清單（依檔名判斷用途）

### 設計方向探索（direction-N-xxx.jsx）
不同頁面的多種視覺／版面方向草稿,用來比較選型：
- `direction-1-dashboard.jsx` — Dashboard 方向 1
- `direction-2-calendar.jsx` — 行事曆頁 方向 2
- `direction-3-watchlist.jsx` — 觀察清單頁 方向 3
- `direction-4-magazine.jsx` — 雜誌風格版面方向 4
- `direction-5-viz.jsx` — 資料視覺化導向方向 5

### 高保真稿（hifi-*.jsx / hifi.html）
選定方向後的高保真（high-fidelity）視覺稿,含更完整的樣式與假資料：
- `hifi-a-terminal.jsx` — Hi-fi 方向 A「終端機／Terminal」風格
- `hifi-b-glass.jsx` — Hi-fi 方向 B「玻璃擬態／Glassmorphism」風格
- `hifi-c-soft.jsx` — Hi-fi 方向 C「柔和／Soft」風格
- `hifi-shared.jsx` — 上述 hi-fi 稿共用的假資料與圖表元件
- `hifi-app.jsx` — 把三個 hi-fi 方向包進 design canvas 的入口 App
- `hifi.html` — hi-fi 稿的獨立 HTML 進入頁

### 另一組草稿（a-*.jsx）
看起來是另一輪／另一系列的頁面草稿（可能是延續某個選定方向後的細部頁面稿）：
- `a-calendar.jsx` — 行事曆頁草稿
- `a-detail.jsx` — 個股詳情頁草稿
- `a-mobile.jsx` — 行動版版面草稿
- `a-more.jsx`、`a-more2.jsx` — 其他補充頁面／區塊草稿

### 其他頁面草稿
- `detail-pages.jsx` — 個股詳情頁 3 種資訊架構版面比較（皆以 2330 台○電為範例資料）

### 共用基礎設施 / 工具
- `app.jsx` — 主 App 入口,把所有 wireframe 包進 design canvas,含字體切換等 tweaks
- `design-canvas.jsx` — 仿 Figma 的設計畫布外殼（可拖拉排版的 artboard、可全螢幕聚焦檢視等）
- `tweaks-panel.jsx` — 共用的「Tweaks」設定面板殼層與表單控制元件
- `wire-primitives.jsx` — 共用的線框稿（wireframe）基礎元件（box、placeholder、小圖示等）,黑白＋手繪風,僅金融語意色（漲跌）保留色彩
- `index.html` — 線框稿（wireframe，非 hi-fi）的獨立 HTML 進入頁
- `.design-canvas.state.json` — design canvas 的畫布狀態存檔（排版位置等）,非程式碼

## 如果要看目前實際的介面設計

請直接看 `frontend/src/` 底下的實際 Vue 元件（例如 `frontend/src/views/dashboard/Dashboard.vue`、`frontend/src/views/calendar/Calendar.vue` 等）,那才是目前上線／開發中的真實介面實作與設計決策依據。這個 `design/` 資料夾只是過程中的探索稿,不代表最終定案,也可能跟目前實作有落差。
