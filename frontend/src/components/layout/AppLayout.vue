<template>
  <div class="flex h-screen overflow-hidden bg-surface text-content">
    <AppSidebar @open-search="searchOpen = true" />
    <div class="flex-1 flex flex-col overflow-hidden">
      <AppTopbar :breadcrumbs="breadcrumbs" />
      <main class="flex-1 overflow-auto">
        <slot />
      </main>
    </div>
    <TweaksPanel />
    <CommandPalette v-if="searchOpen" @close="searchOpen = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import AppSidebar from './AppSidebar.vue'
import AppTopbar from './AppTopbar.vue'
import TweaksPanel from './TweaksPanel.vue'
import CommandPalette from './CommandPalette.vue'

withDefaults(defineProps<{ breadcrumbs?: string[] }>(), { breadcrumbs: () => [] })

const searchOpen = ref(false)

function onKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    searchOpen.value = !searchOpen.value
  }
  if (e.key === 'Escape') searchOpen.value = false
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>
