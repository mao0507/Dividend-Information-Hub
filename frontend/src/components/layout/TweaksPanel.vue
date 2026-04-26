<template>
  <div class="fixed bottom-4 right-4 z-50">
    <button
      class="w-8 h-8 rounded-full bg-surface-2 border border-border-strong flex items-center justify-center text-content-soft hover:text-content transition-colors shadow-lg"
      @click="open = !open"
    >⚙</button>

    <Transition name="slide-up">
      <div v-if="open" class="absolute bottom-10 right-0 w-[280px] bg-surface-2 border border-border-strong rounded-[var(--radius)] shadow-2xl p-4 space-y-5">
        <div class="text-xs font-semibold text-content-soft uppercase tracking-wider">Tweaks</div>

        <!-- Accent color -->
        <div>
          <div class="text-[11px] text-content-faint mb-2">Accent 色</div>
          <div class="flex gap-2">
            <button
              v-for="c in ACCENTS"
              :key="c"
              :style="{ background: c, outline: tweaks.settings.accent === c ? '2px solid white' : 'none' }"
              class="w-6 h-6 rounded-full outline-offset-2"
              @click="tweaks.setTweak('accent', c)"
            />
            <input
              type="color"
              :value="tweaks.settings.accent"
              class="w-6 h-6 rounded cursor-pointer border-0"
              @input="tweaks.setTweak('accent', ($event.target as HTMLInputElement).value)"
            />
          </div>
        </div>

        <!-- Up/Down color -->
        <div>
          <div class="text-[11px] text-content-faint mb-2">漲跌色</div>
          <div class="flex gap-2">
            <button
              v-for="opt in [{ v: true, l: '漲紅跌綠 · 台股' }, { v: false, l: '漲綠跌紅 · 美股' }]"
              :key="String(opt.v)"
              :class="['px-2.5 py-1 text-[10px] rounded-full border transition-colors font-mono', tweaks.settings.upRed === opt.v ? 'border-accent text-accent' : 'border-border text-content-soft']"
              @click="tweaks.setTweak('upRed', opt.v)"
            >{{ opt.l }}</button>
          </div>
        </div>

        <!-- Density -->
        <div>
          <div class="text-[11px] text-content-faint mb-2">介面密度</div>
          <div class="flex gap-1 p-0.5 bg-surface-3 rounded-[6px]">
            <button
              v-for="d in ['compact', 'cozy', 'loose'] as const"
              :key="d"
              :class="['flex-1 py-1 text-[10px] rounded-[4px] font-mono transition-colors', tweaks.settings.density === d ? 'bg-surface-2 text-content' : 'text-content-soft']"
              @click="tweaks.setTweak('density', d)"
            >{{ { compact: '緊湊', cozy: '舒適', loose: '寬鬆' }[d] }}</button>
          </div>
        </div>

        <!-- Radius -->
        <USlider
          label="圓角"
          :model-value="tweaks.settings.radius"
          :min="0"
          :max="24"
          :step="2"
          unit="px"
          @update:model-value="tweaks.setTweak('radius', $event)"
        />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTweaksStore } from '@/stores/tweaks'
import USlider from '@/components/ui/USlider.vue'

const tweaks = useTweaksStore()
const open = ref(false)

const ACCENTS = ['#22c55e', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444', '#06b6d4']
</script>

<style scoped>
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.2s ease; }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateY(8px); }
</style>
