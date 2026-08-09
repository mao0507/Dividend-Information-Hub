## Context

專案目前在多個頁面使用 emoji 或符號字元作為 icon（例如提醒類型、Topbar 操作、下拉箭頭），造成跨頁風格不一致，且不同作業系統字型渲染差異明顯。此次變更目標是改用一致的向量 icon 來源（參照 Icônes）並統一尺寸、顏色與互動狀態，維持現有功能行為不變。

## Goals / Non-Goals

**Goals:**
- 建立 icon 選型與命名規範，讓全站 icon 來源一致。
- 將現有 emoji 與不符合主題的符號替換為一致 icon 元件。
- 針對互動 icon 保留可存取性（aria-label）與可測試性。
- 替換後維持現有事件、路由與業務邏輯不變。

**Non-Goals:**
- 不重構頁面業務流程。
- 不調整後端 API 或資料結構。
- 不在本次引入完整設計系統重建。

## Decisions

1. **採單一 icon 生態來源**
   - 決策：以 Icônes 可對應的 icon 集作為來源，避免混搭 emoji/SVG/字元。
   - 理由：確保視覺一致性與可維護性。
   - 替代：保留現有 emoji 僅局部微調。缺點是風格破碎持續存在。

2. **以共用 icon 映射層管理替換**
   - 決策：建立 icon mapping（語意名稱 -> 元件/圖示），在頁面引用語意 key，而非直接硬寫符號。
   - 理由：後續統一替換與調整成本低。
   - 替代：逐頁直接寫死 icon。缺點是難維護、容易再度不一致。

3. **分階段替換高可見區域**
   - 決策：先覆蓋 Topbar/Sidebar/Alerts/CommandPalette/常用頁面，再清理剩餘零星符號。
   - 理由：優先解決使用者最常接觸區塊，降低一次性改動風險。
   - 替代：一次全改。缺點是回歸範圍過大。

## Risks / Trade-offs

- **[Risk] icon 替換後語意不直覺**  
  **Mitigation**：建立映射表並在 PR 檢查每個語意是否與功能一致。

- **[Risk] 新 icon 尺寸與排版衝突**  
  **Mitigation**：統一定義尺寸層級（例如 14/16/18）與行高，逐頁 smoke test。

- **[Risk] 替換遺漏導致介面混用**  
  **Mitigation**：以關鍵字掃描（emoji/特殊符號）做清單式驗收。

## Migration Plan

1. 盤點全專案 emoji/符號 icon 使用點並建立替換清單。
2. 建立 icon mapping 與共用渲染方式。
3. 套用到主要版位與頁面。
4. 執行單元/整合 smoke 測試，確保功能不變。
5. 若出現回歸，先回滾該頁 icon 套用，保留 mapping 基礎。

## Open Questions

- 是否優先採用單一 icon 套件（如 Material 或 Heroicons）還是允許同生態下少量混用？
- 是否需要在本次一併定義「狀態 icon（success/warn/error）」色彩規範？
