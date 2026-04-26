<template>
  <AppLayout :breadcrumbs="['股票', code]">
    <div class="p-6 flex items-center justify-center h-full">
      <div class="text-center space-y-2">
        <div class="font-mono text-2xl font-bold text-accent">{{ code }}</div>
        <div class="font-mono text-content-soft text-sm">個股詳情頁</div>
        <div class="font-mono text-content-faint text-xs">Phase 2 實作中</div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'

const route = useRoute()
const code = computed(() => route.params.code as string)
</script>
