---
target: frontend/src/views/stock/StockDetail.vue
total_score: 22
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 1
timestamp: 2026-08-12T16-14-22Z
slug: frontend-src-views-stock-stockdetail-vue
---
# Critique: 個股詳情 StockDetail

Method: dual-agent

## Design Health Score
22/40 (Acceptable, 55%)

## Design Specificity Verdict
填息進度 visualization genuinely bespoke; sits inside a generic dashboard-detail shell. CLI detector clean. Browser blocked by auth wall. 7 hard-coded hex colors found in Chip components bypassing token system.

## Priority Issues
- [P0] New 股權分散表 endpoint has zero frontend surface
- [P1] Off-palette decorative colors break One Accent Rule (7 hard-coded hex values)
- [P2] Dividend-history chart hides every value by default (40 bars, hover-only)
- [P2] Data gaps fail silently (v-if hides sections instead of explicit "無資料")
- [P3] KPI grid (6 items) + header chips (5) exceed chunking guidance

## Persona Red Flags
Alex: no keyboard nav on range toggles, must hover 40 bars individually. Jordan: zero inline help for jargon, dead-end not-found state.
