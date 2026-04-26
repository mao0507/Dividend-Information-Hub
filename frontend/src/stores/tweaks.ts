import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { TweakSettings } from '@/types'

const DENSITY_SCALE = { compact: '0.85', cozy: '1', loose: '1.15' }

const defaults: TweakSettings = {
  accent: '#22c55e',
  upRed: true,
  density: 'cozy',
  monoFont: 'JetBrains Mono',
  sansFont: 'Inter',
  radius: 10,
}

function applyToDOM(t: TweakSettings) {
  const root = document.documentElement
  root.style.setProperty('--accent', t.accent)
  root.style.setProperty('--up-color', t.upRed ? '#ef4444' : '#22c55e')
  root.style.setProperty('--down-color', t.upRed ? '#22c55e' : '#ef4444')
  root.style.setProperty('--density', DENSITY_SCALE[t.density])
  root.style.setProperty('--radius', `${t.radius}px`)
}

export const useTweaksStore = defineStore('tweaks', () => {
  const settings = ref<TweakSettings>({ ...defaults })

  function setTweak<K extends keyof TweakSettings>(key: K, value: TweakSettings[K]) {
    settings.value = { ...settings.value, [key]: value }
  }

  function reset() {
    settings.value = { ...defaults }
  }

  watch(settings, applyToDOM, { deep: true, immediate: true })

  return { settings, setTweak, reset }
})
