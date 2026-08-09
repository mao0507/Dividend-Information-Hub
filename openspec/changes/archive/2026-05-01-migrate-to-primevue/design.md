# Design: migrate-to-primevue

## Architecture

### PrimeVue 安裝模式

使用 **unstyled: true** 模式，元件完全不帶任何 PrimeVue 預設 CSS，所有樣式透過 Pass-through (PT) 傳入。

```
main.ts
  app.use(PrimeVue, { unstyled: true, pt: primevuePT })

src/primevue-pt.ts  ← 新增，集中所有 global PT 設定
```

### Global PT 設定策略

靜態元件（Button、Select、Badge、ToggleSwitch）的樣式在 `primevue-pt.ts` 全域定義，頁面使用時不需傳任何 `pt` prop。

動態元件（Chip）因 `color`/`bg` 為 per-usage 動態值，每個使用點以 `:pt` prop 傳入 inline style object。

### 元件對應設計

#### Button

```
global PT:
  root: 現有 UButton 的 inline-flex / rounded / font-medium / focus-visible 等 class
  variant: 透過 severity prop 對應（primary=default, secondary=secondary, ghost=text/ghost）
  size: 透過 size prop 對應（sm/md/lg）
  loading spinner: 現有 border-current border-t-transparent animate-spin 動態 span

注意：PrimeVue Button severity 值與 UButton variant 名稱不同，需對應：
  UButton variant="primary"   → Button（無 severity 或 severity="primary"）
  UButton variant="secondary" → Button severity="secondary"
  UButton variant="ghost"     → Button text（PrimeVue 的 text 模式）
```

#### Select

```
global PT:
  root:           themedSelectTriggerClass（移自 form-control-styles.ts）
  listContainer:  themedSelectListClass
  option:         themedSelectOptionClass
  overlay:        z-index、shadow 等定位樣式

USelect 的 options 格式 { value, label }[] 與 PrimeVue Select 的 optionLabel/optionValue props 對應。
```

#### ToggleSwitch

```
global PT:
  root:   現有 UToggle 的 w-8 h-[18px] rounded-full transition-colors
  slider: 現有 thumb 的 absolute rounded-full transition-all
  checked state 透過 PrimeVue 的 data-p-checked attribute 搭配 PT class function
```

#### Badge

```
global PT:
  root: 現有 UBadge 的 font-mono text-[10px] font-semibold px-[5px] py-[1px] rounded-[3px] bg-accent/15 text-accent
```

#### Chip（動態 color/bg）

```
per-usage :pt:
  root: {
    class: 'inline-flex items-center gap-1 font-mono text-[10px] font-medium tracking-wide rounded-[4px] px-[7px] py-[2px]',
    style: { color: chipColor, background: chipBg }
  }

頁面各自傳入 color/bg 值，不再有 UChip wrapper。
```

#### Slider（USlider 展開）

PrimeVue 的 `<Slider>` 只提供 range track 機制，原 USlider 的 label + displayValue + unit 顯示需在各頁面展開為 wrapper markup。

```html
<!-- DripPage、TweaksPanel 各自展開 -->
<div class="space-y-1.5">
  <div class="flex justify-between items-center">
    <span class="text-[11px] text-content-soft">{{ label }}</span>
    <span class="font-mono text-xs text-accent">{{ formattedValue }}</span>
  </div>
  <Slider v-model="value" :min="min" :max="max" :step="step" :pt="sliderPT" />
</div>
```

sliderPT 在 primevue-pt.ts 全域定義，對應現有 USlider 的 track / thumb 樣式。

### 刪除清單

完成後刪除：
- `frontend/src/components/ui/UButton.vue`
- `frontend/src/components/ui/UBadge.vue`
- `frontend/src/components/ui/UChip.vue`
- `frontend/src/components/ui/USelect.vue`
- `frontend/src/components/ui/USlider.vue`
- `frontend/src/components/ui/UToggle.vue`
- `frontend/src/constants/form-control-styles.ts`

### 測試影響

現有 spec 檔案中 mock 了 UI 元件（例如 `vi.mock('@/components/ui/USelect.vue')`），遷移後需移除這類 mock，改用 PrimeVue 元件的實際 DOM selector 或繼續 mock PrimeVue 元件。

## Decisions

1. **Unstyled + PT，不使用任何 PrimeVue preset 主題**：確保視覺完全由現有 Tailwind 控制
2. **USlider 不保留包裝**：頁面展開，符合「全部換成 PrimeVue」決策
3. **UChip 不保留包裝**：per-usage :pt，符合「全部換成 PrimeVue」決策
4. **Global PT 集中在 primevue-pt.ts**：避免 main.ts 膨脹，便於維護
5. **Button severity 對應表**：primary→無 severity，secondary→severity="secondary"，ghost→text prop
