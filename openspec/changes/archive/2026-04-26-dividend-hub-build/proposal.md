# 股息站（Dividend Information Hub）— 建置提案

## 背景

依據 Hi-Fi A 方向設計稿（Bloomberg/Linear 深色終端風格），從零建置完整的台股股息資訊平台。目標是幫助存股族一站追蹤除息日、填息進度、被動收入。

## 技術棧

| 層級 | 技術 |
|------|------|
| 前端 | Vue 3 + TypeScript + Tailwind CSS + Vite |
| 後端 | NestJS + TypeScript |
| ORM  | Prisma |
| 資料庫 | PostgreSQL |
| 部署 | 前端 Vercel / 後端 Railway or Render / DB Supabase or Neon |

## 核心功能範圍

### 必做（MVP）
- Onboarding 4步嚮導（帳號 + 自選股設定 + 提醒 + 完成）
- 儀表板（KPI卡片 + Hero圖表 + 自選股列表 + 7日除息）
- 除息行事曆（月視圖，日/週/月/年切換）
- 個股詳情（走勢圖 + 配息歷史10年 + 填息進度 + 同業比較 + 持有分析）
- 高股息排行 + 篩選器（殖利率/頻率/產業/連續年數/填息天數/市值）
- 自選股管理（分組 + 拖曳排序）
- 再投入試算 DRIP（滑桿參數 + 複利圖表）
- 提醒中心（通知動態 + 規則管理）
- 視覺化分析（甜甜圈 + 月度柱狀 + 熱力圖 + 分層成長圖）
- 設定（證券戶連結 + 同步偏好）
- ⌘K 全域搜尋（Command Palette）
- Mobile 響應式（390×844 對應所有主要頁面）

### 非目標（Phase 1 不含）
- 真實台股 API 串接（Phase 1 用 seed data，Phase 2 再串）
- 真實券商 OAuth 連結
- LINE Notify 推播
- 訂閱付費機制

## 使用者故事

```
作為存股族，我想要：
- 一眼看到今日/本週有哪些自選股除息
- 知道每次除息後的填息進度（%、天數）
- 瀏覽過去10年的配息歷史，判斷穩定度
- 試算若把股息再投入，10年後資產會成長多少
- 即時收到除息日前N天的 Push/Email 提醒
- 用篩選器找出殖利率>6% 且連續配息10年以上的股票
- 在任何頁面按 ⌘K 搜尋股票代號或名稱
```

## 設計規範參考

- 設計稿位置：`design/hifi.html`（含 A/B/C 三方向，本次建置 A 方向）
- 色系：`#0a0a0b` 近黑背景，`#22c55e` 綠色 accent，`#ef4444` 紅漲，`#f59e0b` 琥珀警示
- 字型：Inter/Noto Sans TC（UI），JetBrains Mono（數字/代號）
- Tweaks 系統：accent色/漲跌色/密度/字型/圓角 可動態調整

## 成功指標

- 所有設計稿頁面 pixel-accurate 還原（桌機 + 手機）
- API 回應 < 200ms（含分頁）
- Lighthouse 分數 > 90（Performance / Accessibility）
- 80%+ 測試覆蓋率（核心業務邏輯）
