# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

主要使用者是產品作者自己（個人使用），用來追蹤自己的台股存股持股與配息紀錄。非商業對外產品，未來若擴大受眾，仍以台股存股/存 ETF 的散戶投資人為原型使用者：需要記錄持股成本、追蹤除權息與填息進度、掌握配息收入。

## Product Purpose

股息站（Dividend Information Hub）協助存股投資人追蹤持股、自動同步台股（TWSE/TPEX）股價與股利資料，計算填息進度、未實現損益、配息收入統計，讓使用者不用手動查價、手動算股利與填息天數。

## Positioning

相對 Goodinfo（全市場資料庫查詢工具）與一般存股記帳 App（手動記帳為主），本產品的差異化機制是「填息追蹤 + 自動同步」的持股配息工具：資料自動從 TWSE/TPEX/FinMind 同步（不用手動輸入股價/股利），並提供填息進度追蹤、DRIP 股息再投資試算、配息行事曆與 alert 提醒規則，這些是 Goodinfo 與一般記帳類 App 都沒有做的。

## Operating Context

- 使用者在 Vue3 + PrimeVue 前端操作：新增/刪除持股批次（HoldingLot）、查看持股彙總、配息行事曆、股利排行榜、儀表板總覽
- 後端（NestJS + Prisma + PostgreSQL/Supabase）定期排程（cron，Asia/Taipei 時區）從 TWSE OpenAPI、TPEx OpenAPI、FinMind、TDCC 同步股價、股利、除權息公告、股權分散表
- 使用者透過 JWT 登入，資料皆綁定 userId

## Capabilities and Constraints

- 已有：持股批次管理（分批成本）、配息歷史/填息追蹤、股價/K線圖表（lightweight-charts）、股利排行榜（含快取）、股息再投資試算、月配息收入/熱力圖/年度成長圖表、通知中心與 alert 規則、自選股分組、券商連結
- 進行中/新增：未實現損益（P&L）計算、全市場籌碼資料（董監持股/股權分散表，僅股權分散表已實作）、股利排行深度強化（多年殖利率趨勢、產業相對排名；配息率因無 EPS 資料源目前固定為 null）
- 技術限制：無 EPS 資料源，配息率（payout ratio）目前無法計算
- 台股（TWSE 上市 + TPEx 上櫃）範圍，非國際股市

## Brand Commitments

無正式品牌承諾。目前僅有 UI 圖標（icon）設計已確認；配色/字體/視覺系統尚未建立正式規範（DESIGN.md 待補）。

## Evidence on Hand

無外部佐證素材（無使用者見證、案例研究、新聞露出）。資料真實性來自即時同步的 TWSE/TPEx/FinMind/TDCC 公開資料，非展示用假資料。

## Product Principles

1. 自動化優先：資料應自動同步，不要求使用者手動輸入股價/股利
2. 填息與配息是核心敘事：填息進度、配息收入是產品最獨特的價值，視覺與資訊架構應突顯
3. 誠實面對資料缺口：EPS 等目前沒有的資料要明確標示「無法計算」而非用 0 或估計值誤導
4. 台股在地脈絡：所有資料範圍、術語、日期時區以台灣（Asia/Taipei）、TWSE/TPEx 慣例為準

## Accessibility & Inclusion

尚未建立產品特定的無障礙需求；沿用標準 Web 無障礙基準即可。
