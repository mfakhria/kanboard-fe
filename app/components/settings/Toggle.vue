<script setup lang="ts">
defineProps<{
  enabled: boolean
}>()

const emit = defineEmits<{
  toggle: []
}>()
</script>

<template>
  <button
    class="relative w-11 h-6 rounded-full transition-all duration-200 shrink-0"
    :class="enabled ? 'bg-[#478FC8]' : 'bg-gray-200 dark:bg-gray-700'"
    @click="emit('toggle')"
  >
    <div
      class="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-200"
      :class="enabled ? 'left-[22px]' : 'left-0.5'"
    />
  </button>
</template>
