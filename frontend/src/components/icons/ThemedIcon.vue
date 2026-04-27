<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    :class="mergedClass"
    aria-hidden="true"
    focusable="false"
  >
    <!-- Heroicons 24/outline 風格路徑（對應 Icônes 常見集），以 currentColor 吃主題色 -->
    <path
      v-if="name === 'magnifying-glass'"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
    />
    <path
      v-else-if="name === 'arrow-down-tray'"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
    />
    <path
      v-else-if="name === 'bell'"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.109V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
    />
    <path
      v-else-if="name === 'cog-6-tooth'"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.723 6.723 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.752.072 1.077-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
    />
    <path
      v-if="name === 'cog-6-tooth'"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      v-else-if="name === 'chevron-down'"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
    />
    <path
      v-else-if="name === 'chevron-up'"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M4.5 15.75l7.5-7.5 7.5 7.5"
    />
    <path
      v-else-if="name === 'calendar'"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M6.75 3v1.5M17.25 3v1.5M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5a2.25 2.25 0 012.25 2.25v7.5"
    />
    <path
      v-else-if="name === 'clock'"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
    />
    <path
      v-else-if="name === 'banknotes'"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M2.25 18.75a60.07 60.07 0 0015.798 2.206c.814.015 1.624-.09 2.41-.27m-18.09-1.93l.867 12.142A2.25 2.25 0 007.138 21H9a2.25 2.25 0 002.227-1.932l.414-2.066a59.77 59.77 0 0118.382 1.39M2.25 18.75h1.5m16.5 0h1.5m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5a2.25 2.25 0 012.25 2.25v7.5"
    />
    <path
      v-else-if="name === 'chart-bar'"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v4.125c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 013 17.25v-4.125zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125v-8.25zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
    />
    <path
      v-else-if="name === 'calculator'"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M15.75 15.75V18h-2.25M15.75 15.75h-2.25m2.25 0v-2.25m0 2.25h-2.25m-7.5-9h7.5m-7.5 6h7.5m-7.5-3h4.5M4.5 6.75h15A2.25 2.25 0 0121.75 9v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V9A2.25 2.25 0 014.5 6.75z"
    />
    <path
      v-else-if="name === 'arrow-trending-down'"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181"
    />
    <path
      v-else-if="name === 'newspaper'"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v4.5H6V7.5z"
    />
    <path
      v-else-if="name === 'bolt'"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
    />
    <path
      v-else-if="name === 'sparkles'"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
    />
    <path
      v-else-if="name === 'star'"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
    />
    <path
      v-else-if="name === 'x-mark'"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M6 18L18 6M6 6l12 12"
    />
    <path
      v-else-if="name === 'check'"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M4.5 12.75l6 6 9-13.5"
    />
    <path
      v-else-if="name === 'arrow-trending-up'"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M2.25 18L9 11.25l4.306 4.306a11.948 11.948 0 004.768-2.367l.75-.75m-7.5-3.75L18 2.25"
    />
    <path
      v-else-if="name === 'squares-2x2'"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25v-2.25z"
    />
    <path
      v-else-if="name === 'presentation-chart-line'"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6.75v1.5"
    />
    <path
      v-else-if="name === 'currency-dollar'"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M12 6v12m-3.75-7.5h7.5m-7.5 3h7.5M12 3.75c-1.036 0-1.875.84-1.875 1.875v0c0 1.036.84 1.875 1.875 1.875h0c1.036 0 1.875.84 1.875 1.875v0c0 1.035-.84 1.875-1.875 1.875"
    />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

/** 支援的語意圖示名稱（對應 Heroicons outline 語意） */
export type ThemedIconName =
  | 'magnifying-glass'
  | 'arrow-down-tray'
  | 'bell'
  | 'cog-6-tooth'
  | 'chevron-down'
  | 'chevron-up'
  | 'calendar'
  | 'clock'
  | 'banknotes'
  | 'chart-bar'
  | 'calculator'
  | 'arrow-trending-down'
  | 'newspaper'
  | 'bolt'
  | 'sparkles'
  | 'star'
  | 'x-mark'
  | 'check'
  | 'arrow-trending-up'
  | 'squares-2x2'
  | 'presentation-chart-line'
  | 'currency-dollar'

const props = withDefaults(
  defineProps<{
    /** 圖示語意名稱 */
    name: ThemedIconName
    /** 額外 Tailwind class（尺寸建議 w-4 h-4） */
    sizeClass?: string
  }>(),
  { sizeClass: 'w-4 h-4' },
)

/**
 * 合併根節點 SVG 的 class（避免尺寸被擠壓）。
 * @returns Tailwind class 字串
 */
const mergedClass = computed<string>(() => `shrink-0 ${props.sizeClass}`)
</script>
