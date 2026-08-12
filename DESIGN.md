---
name: 股息站 Dividend Hub
description: 溫和好懂的個人存股與配息追蹤終端
colors:
  surface: "#0a0a0b"
  surface-2: "#101013"
  surface-3: "#16161a"
  border: "rgba(255,255,255,0.06)"
  border-strong: "rgba(255,255,255,0.14)"
  content: "#e8e8ea"
  content-soft: "rgba(255,255,255,0.6)"
  content-faint: "rgba(255,255,255,0.5)"
  accent: "#22c55e"
  danger: "#ef4444"
  warning: "#f59e0b"
  up: "#ef4444"
  down: "#22c55e"
typography:
  body:
    fontFamily: "Inter, 'Noto Sans TC', system-ui, sans-serif"
    fontWeight: 400
  data:
    fontFamily: "'JetBrains Mono', monospace"
    fontWeight: 500
rounded:
  xs: "3px"
  sm: "4px"
  md: "8px"
  lg: "10px"
  xl: "20px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "20px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
  button-secondary:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.content-soft}"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
  chip:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.content}"
    rounded: "{rounded.sm}"
    padding: "2px 7px"
  badge:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent}"
    rounded: "3px"
    padding: "1px 5px"
---

# Design System: 股息站 Dividend Hub

## Overview

**Creative North Star: "The Trading Terminal"**

介面借用專業交易終端的視覺語言——近黑背景、等寬數字字體、扁平無陰影、細邊框分區——但服務對象不是機構交易員，而是自己記帳追蹤存股的個人投資人。因此語氣要溫和好懂：資訊密度高但不冷峻，數字用等寬字體給出終端感的精確可信度，介面結構與互動保持友善、低學習成本。

這不是要模仿 Bloomberg 終端的壓迫感，而是借它「數字說話、資料誠實」的精神，套進一個平易近人的個人工具外殼。

**Key Characteristics:**
- 近黑背景（#0a0a0b）+ 三層 surface 分級，靠明度差而非陰影分區
- JetBrains Mono 專門用於數字/代碼類資料，Inter + Noto Sans TC 用於一般文字
- 單一 Signal Green accent，扁平無陰影為主，僅 Dialog／浮層用陰影標示層級
- 圓角隨元件層級遞增：badge/chip 最緊（3–4px）→ button/select（8–10px）→ dialog（20px）

## Colors

深色終端基底，靠明度分層與極低透明度邊框做區隔，全系統只有一個強調色。

### Primary
- **Signal Green** (#22c55e)：唯一強調色。用於主要按鈕、選中狀態、開關 on 狀態、焦點光暈（`ring-accent`）。同時身兼「跌」色（`down-color`），對應台股紅漲綠跌慣例。

### Secondary
- **Alert Red** (#ef4444)：危險/警示操作色，同時身兼「漲」色（`up-color`）。與 Signal Green 共同構成漲跌配色，脈絡由欄位決定，不是單純的危險/成功二元。
- **Amber Warning** (#f59e0b)：次要警示色，用量極低。

### Neutral
- **Void Black** (#0a0a0b)：頁面底色（`bg-surface`）
- **Panel Black** (#101013)：卡片/對話框等次層表面（`bg-surface-2`）
- **Raised Black** (#16161a)：互動元件的第三層表面，如 toggle 未選中底色（`bg-surface-3`）
- **Hairline Border** (rgba(255,255,255,0.06))：預設分隔線，極輕
- **Strong Border** (rgba(255,255,255,0.14))：需要更明確邊界時（secondary 按鈕、對話框外框）
- **Primary Text** (#e8e8ea)：主要內文字色
- **Soft Text** (rgba(255,255,255,0.6))：次要文字（secondary 按鈕文字、未聚焦狀態）
- **Faint Text** (rgba(255,255,255,0.5))：最弱層級（disabled、icon、placeholder），需維持 WCAG AA 4.5:1 對比，不得再降低

### Data Visualization (categorical)
多類別圖表（如投資比重圓餅圖）需要視覺上可分的多色，但不得引入與 Signal Green 無關的色相。一律使用 Signal Green 色階（tonal ramp）分色，不用彩虹分類色。色階定義於 `.impeccable/design.json` 的 `colorMeta.accent.tonalRamp`。

### Named Rules
**The One Accent Rule.** 全系統只有 Signal Green 一個強調色；紅色只用在「漲」與危險操作語境，不與 Signal Green 並列作為兩個平行的品牌色使用。

## Typography

**Body Font:** Inter（含 Noto Sans TC 中文備援）
**Data Font:** JetBrains Mono

**Character:** Inter 負責一般 UI 文字，友善、現代、中性；JetBrains Mono 專門用在任何「數字類」資訊（價格、股數、代碼、百分比），營造終端機的精確感與可信度。兩者混排時以資料類型切換，不以裝飾為目的。

### Hierarchy
- **Body**（400, 14px 上下, 中文以 Noto Sans TC 補字）：一般說明文字、標籤
- **Data / Label**（JetBrains Mono, 500, 10–13px）：價格、代碼、篩選項目、對話框標題、badge/chip 文字——凡是「數字或代碼性質」的資訊一律走 mono

### Named Rules
**The Mono-For-Numbers Rule.** 任何股價、股數、百分比、股票代號、日期時間戳，一律用 JetBrains Mono；純敘述性文字用 Inter。混用是這個系統辨識度的核心。

## Layout

以 Tailwind utility 為主要排版手段，密度由 `--density` CSS 變數統一調整（預留給未來密度切換功能）。容器圓角由 `--radius`（預設 10px）全域變數控制，可整體調整而不必逐一改元件。

## Elevation & Depth

系統整體是扁平的：一般卡片、按鈕、輸入框不用陰影，深度靠三層 surface 明度（Void Black → Panel Black → Raised Black）疊出層級，而非投影。陰影只保留給「浮在內容之上」的暫態層——Dialog 和下拉選單 overlay——用來明確標示「這層蓋在別的內容上面」而非常態裝飾。

### Shadow Vocabulary
- **Overlay Shadow** (`box-shadow: 0 25px 50px -12px rgba(0,0,0,0.7)`)：Dialog 容器，強調懸浮在頁面之上
- **Control Shadow** (`box-shadow` 預設 Tailwind `shadow`/`shadow-lg`)：Select overlay、Slider handle 等小型互動元件的輕量懸浮感

### Named Rules
**The Flat-By-Default Rule.** 頁面內常駐元件（卡片、按鈕、輸入框）不用陰影；陰影只在元件短暫浮出頁面平面時出現（Dialog、下拉選單）。

## Shapes

圓角隨元件的「暫態/持久」與「層級大小」遞增：最小的資料標籤（badge 3px、chip 4px）幾乎方正，貼近等寬字體的機械感；中型互動元件（button、select 8–10px，走全域 `--radius` 變數）柔和一階；最大的浮層（Dialog 20px）圓角最明顯，強化「這是一個獨立浮起的面板」的觸感。邊框普遍極細極淡（多為 6–14% 白色透明度），不用實色邊框製造分隔。

## Components

### Buttons
- **Shape:** 全域 `--radius`（10px），跟隨系統圓角變數而非固定值
- **Primary:** Signal Green 底、Void Black 文字（`bg-accent text-surface`），字重 semibold，hover 降低不透明度（90%）
- **Secondary:** Panel Black 底 + Strong Border 外框、Soft Text 文字，hover 轉為 Primary Text
- **Text/Ghost:** 無底色，Soft Text 文字，hover 轉 Primary Text 並帶 Panel Black 底
- **Focus:** `ring-2 ring-accent`，焦點環用 Signal Green
- **Disabled:** 40% 不透明度 + cursor not-allowed

### Chips / Badges
- **Chip:** JetBrains Mono 10px、字重 medium、letter-spacing 加寬，圓角 4px，用於分類/標籤類資訊
- **Badge:** JetBrains Mono 10px、字重 semibold，Signal Green 15% 透明度底 + Signal Green 文字，圓角 3px，用於狀態徽章（如「高息」「長配」）

### Inputs / Select
- **Style:** Void Black 底、Hairline Border，圓角 8px；文字走 JetBrains Mono 12px（select 選項多為代碼/數字性質）
- **Focus:** 邊框轉 Signal Green + `ring-2 ring-accent/40`
- **Hover:** 邊框轉 Strong Border
- **Overlay（下拉選單）:** Panel Black 底 + Hairline Border + `shadow-lg`，選中項文字轉 Signal Green

### Toggle Switch
- **Style:** 未選中 Raised Black 底，選中轉 Signal Green 底；handle 為白色圓點，200ms 位移過渡
- **Focus:** `ring-2 ring-accent`

### Dialog
- **Corner Style:** 20px 圓角，`overflow: hidden`
- **Background:** Panel Black（#101013），header/content 同色維持一致平面
- **Shadow Strategy:** 見 Elevation & Depth 的 Overlay Shadow
- **Border:** Strong Border（14% 白）外框
- **Mask:** 55% 黑遮罩 + 4px 模糊背景
- **Title:** JetBrains Mono 13px semibold，強調對話框標題的「終端資訊」屬性而非一般標題

## Do's and Don'ts

### Do:
- **Do** 用 JetBrains Mono 呈現任何價格、股數、百分比、代碼、時間戳（The Mono-For-Numbers Rule）
- **Do** 用三層 surface 明度（#0a0a0b / #101013 / #16161a）表達層級，而非新增陰影
- **Do** 保持紅漲綠跌（Alert Red = 漲 / Signal Green = 跌）與台股慣例一致，不要套用西方紅跌綠漲直覺
- **Do** 圓角隨元件暫態程度遞增：常駐小元件方正、浮層元件（Dialog）圓潤

### Don't:
- **Don't** 幫常駐卡片、按鈕、輸入框加陰影——陰影保留給 Dialog/overlay 這類暫態浮層
- **Don't** 引入第二個強調色跟 Signal Green 並列成雙品牌色；紅色只服務漲跌與危險語境
- **Don't** 把一般敘述文字放進 JetBrains Mono，或把數字類資料放進 Inter——字體選擇是資料類型的語意標記，不是裝飾
