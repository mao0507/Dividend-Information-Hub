<template>
  <RouterView />
</template>

<script setup lang="ts">
import { useTweaksStore } from '@/stores/tweaks'

useTweaksStore()
</script>
