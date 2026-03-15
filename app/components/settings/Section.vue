<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
    <div class="px-6 py-5 border-b border-gray-50 dark:border-gray-800/50">
      <h3 class="text-[15px] font-bold text-gray-900 dark:text-white">
        {{ title }}
      </h3>
      <p v-if="description" class="mt-0.5 text-gray-400 dark:text-gray-500 text-[12.5px]">
        {{ description }}
      </p>
    </div>
    <div class="px-6 py-5">
      <slot />
    </div>
  </div>
</template>
