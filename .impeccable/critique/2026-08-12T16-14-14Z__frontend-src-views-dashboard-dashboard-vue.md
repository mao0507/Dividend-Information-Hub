---
target: frontend/src/views/dashboard/Dashboard.vue
total_score: 20
max_score: 32
na_heuristics: 7,10
p0_count: 2
p1_count: 2
timestamp: 2026-08-12T16-14-14Z
slug: frontend-src-views-dashboard-dashboard-vue
---
# Critique: Dashboard

Method: dual-agent

## Design Health Score
20/32 (Acceptable, 63%) — heuristics 7,10 n/a for solo-user Operate dashboard.

## Design Specificity Verdict
Fails on the metric that matters: fill-progress (product's stated differentiator) is absent from the dashboard. Generic TAIEX/watchlist composition otherwise. CLI detector clean. Browser blocked by auth wall.

## Priority Issues
- [P0] Core differentiator (填息進度) absent from dashboard
- [P0] SparkLine.vue fabricates fake trend data for stocks with <2 price points
- [P1] Watchlist/calendar rows keyboard/screen-reader unreachable
- [P1] No sync-staleness indicator despite modeled 'stale' state
- [P2] Failure state and empty state textually identical
- [P2] Inconsistent card header treatment

## Persona Red Flags
Alex: core loop requires leaving the dashboard. Sam: 2/3 cards unreachable by keyboard.
