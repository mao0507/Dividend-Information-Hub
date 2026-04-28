<template>
  <aside class="w-[220px] bg-surface-2 border-r border-border flex flex-col shrink-0 h-screen overflow-hidden">
    <!-- Logo -->
    <div class="px-[18px] pt-[18px] pb-3.5 border-b border-border">
      <div class="flex items-center gap-2">
        <div class="w-6 h-6 rounded-[6px] flex items-center justify-center font-mono text-[11px] font-bold text-surface"
          style="background: linear-gradient(135deg, var(--accent), #14a34a)">$</div>
        <span class="text-sm font-semibold text-content">股息站</span>
        <span class="ml-auto font-mono text-[9px] text-content-faint">v1.0</span>
      </div>
      <!-- Global search trigger -->
      <button
        class="mt-3.5 flex items-center gap-2 w-full px-2.5 py-[7px] bg-surface-3 rounded-[6px] text-xs text-content-faint hover:text-content-soft transition-colors"
        @click="$emit('openSearch')"
      >
        <span class="font-mono">⌘K</span>
        <span>搜尋股票</span>
      </button>
    </div>

    <!-- Nav -->
    <nav class="flex-1 px-[10px] py-3 overflow-y-auto">
      <div v-for="section in navSections" :key="section.group" class="mb-3.5">
        <div class="text-[10px] text-content-faint tracking-[0.15em] uppercase px-[10px] mb-0.5 py-1">
          {{ section.group }}
        </div>
        <RouterLink
          v-for="item in section.items"
          :key="item.to"
          :to="item.to"
          custom
          v-slot="{ isActive, navigate }"
        >
          <div
            :class="[
              'flex items-center gap-2.5 px-[10px] py-[7px] rounded-[6px] text-[13px] mb-[1px] cursor-pointer transition-colors',
              'border-l-2',
              isActive
                ? 'bg-surface-3 text-content border-accent'
                : 'text-content-soft hover:text-content border-transparent',
            ]"
            @click="navigate"
          >
            <ThemedIcon
              :name="item.icon"
              size-class="w-3.5 h-3.5"
              :class="isActive ? 'text-accent' : 'text-content-faint'"
            />
            <span class="flex-1">{{ item.label }}</span>
            <UBadge v-if="item.badge">{{ item.badge }}</UBadge>
          </div>
        </RouterLink>
      </div>
    </nav>

    <!-- Accumulated income -->
    <div class="border-t border-border px-[14px] py-[14px]">
      <div class="text-[10px] text-content-faint tracking-[0.1em] uppercase">2026 累計領息</div>
      <div class="text-[22px] font-mono font-semibold mt-0.5 text-content">$48,260</div>
      <div class="text-[10px] font-mono" style="color: var(--accent)">▲ +12.4% YoY</div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import UBadge from '@/components/ui/UBadge.vue'
import ThemedIcon from '@/components/icons/ThemedIcon.vue'
import type { ThemedIconName } from '@/components/icons/ThemedIcon.vue'

defineEmits<{ (e: 'openSearch'): void }>()

type NavItem = { to: string; icon: ThemedIconName; label: string; badge?: string }

const navSections: Array<{ group: string; items: NavItem[] }> = [
  {
    group: '主選單',
    items: [
      { to: '/dashboard', icon: 'presentation-chart-line', label: '儀表板' },
      { to: '/calendar', icon: 'calendar', label: '除息行事曆' },
      { to: '/watchlist', icon: 'star', label: '自選股', badge: '8' },
      { to: '/holdings', icon: 'archive-box', label: '持股管理' },
      { to: '/ranking', icon: 'arrow-trending-up', label: '高股息排行' },
      { to: '/viz', icon: 'squares-2x2', label: '視覺化分析' },
    ],
  },
  {
    group: '工具',
    items: [
      { to: '/drip', icon: 'calculator', label: '再投入試算' },
      { to: '/alerts', icon: 'bell', label: '提醒設定' },
      { to: '/settings', icon: 'cog-6-tooth', label: '設定' },
    ],
  },
]
</script>
