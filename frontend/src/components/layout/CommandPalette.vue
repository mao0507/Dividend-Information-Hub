<template>
  <!-- Backdrop -->
  <div class="fixed inset-0 z-[100] flex items-start justify-center pt-[120px]">
    <div class="absolute inset-0 bg-black/50 backdrop-blur-md" @click="$emit('close')" />

    <!-- Palette -->
    <div class="relative w-[720px] bg-[#15151a] border border-border-strong rounded-[14px] shadow-[0_40px_80px_rgba(0,0,0,0.6)] overflow-hidden">
      <!-- Input -->
      <div class="flex items-center gap-3 px-[22px] py-[18px] border-b border-border">
        <ThemedIcon name="magnifying-glass" size-class="w-5 h-5 text-content-faint" />
        <input
          ref="inputRef"
          v-model="query"
          class="flex-1 bg-transparent text-base text-content placeholder:text-content-faint outline-none font-sans"
          placeholder="搜尋股票代號或名稱..."
          autofocus
        />
        <span class="font-mono text-[10px] text-content-faint px-1.5 py-0.5 bg-surface-3 rounded">ESC</span>
      </div>

      <!-- Results -->
      <div class="max-h-[460px] overflow-auto">
        <!-- Stock results -->
        <template v-if="results.length">
          <div class="px-[22px] py-2.5 text-[10px] text-content-faint font-mono tracking-[0.15em] uppercase">
            股票 · {{ results.length }}
          </div>
          <div
            v-for="(r, i) in results"
            :key="r.code"
            :class="[
              'flex items-center gap-3 px-[22px] py-2.5 cursor-pointer transition-colors border-l-2',
              i === selected ? 'bg-accent/10 border-accent' : 'border-transparent hover:bg-surface-3',
            ]"
            @click="goTo(r.code)"
            @mouseenter="selected = i"
          >
            <div class="w-7 h-7 rounded-[6px] bg-surface-3 flex items-center justify-center font-mono text-[10px] text-content-soft shrink-0">
              {{ r.code }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-[13px] font-medium text-content truncate">{{ r.name }}</div>
              <div class="font-mono text-[11px] text-content-faint">{{ r.sector }}</div>
            </div>
          </div>
        </template>

        <!-- Actions -->
        <div class="px-[22px] py-2.5 text-[10px] text-content-faint font-mono tracking-[0.15em] uppercase mt-1">動作</div>
        <div
          v-for="action in ACTIONS"
          :key="action.label"
          class="flex items-center gap-3 px-[22px] py-2.5 hover:bg-surface-3 cursor-pointer"
          @click="action.fn"
        >
          <div class="w-7 h-7 rounded-[6px] bg-surface-3 flex items-center justify-center shrink-0">
            <ThemedIcon :name="action.icon" size-class="w-4 h-4 text-accent" />
          </div>
          <span class="flex-1 text-[13px] text-content">{{ action.label }}</span>
          <span v-if="action.key" class="font-mono text-[10px] text-content-faint px-1.5 py-0.5 bg-surface-3 rounded">{{ action.key }}</span>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-[22px] py-2.5 border-t border-border flex items-center gap-3.5 text-[10px] text-content-faint font-mono">
        <span class="inline-flex items-center gap-0.5">
          <ThemedIcon name="chevron-up" size-class="w-3 h-3" />
          <ThemedIcon name="chevron-down" size-class="w-3 h-3" />
          <span class="ml-0.5">移動</span>
        </span>
        <span>↵ 開啟</span>
        <span>ESC 關閉</span>
        <div class="flex-1" />
        <span>由 股息站 提供</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { stockApi } from '@/services/api/stock'
import ThemedIcon from '@/components/icons/ThemedIcon.vue'
import type { ThemedIconName } from '@/components/icons/ThemedIcon.vue'

const emit = defineEmits<{ (e: 'close'): void }>()
const router = useRouter()

const query = ref('')
const results = ref<{ code: string; name: string; sector: string }[]>([])
const selected = ref(0)

let debounceTimer: ReturnType<typeof setTimeout>

watch(query, (q) => {
  clearTimeout(debounceTimer)
  if (!q.trim()) { results.value = []; return }
  debounceTimer = setTimeout(async () => {
    const res = await stockApi.search(q, 8)
    results.value = res.data
  }, 300)
})

function goTo(code: string) {
  router.push(`/stock/${code}`)
  emit('close')
}

const ACTIONS: Array<{
  icon: ThemedIconName
  label: string
  key: string
  fn: () => void
}> = [
  { icon: 'bolt', label: '設定除息提醒', key: '⌘A', fn: () => {} },
  { icon: 'star', label: '加入自選股', key: '⌘S', fn: () => {} },
  { icon: 'calculator', label: '開啟再投入試算', key: '⌘D', fn: () => { void router.push('/drip') } },
  { icon: 'calendar', label: '除息行事曆', key: '', fn: () => { void router.push('/calendar') } },
]
</script>
