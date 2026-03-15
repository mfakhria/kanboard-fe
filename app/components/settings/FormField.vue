<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  label: string
  icon: Component
  type?: string
  placeholder?: string
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label class="text-gray-600 dark:text-gray-400 text-[12.5px] font-semibold">
      {{ label }}
    </label>
    <div class="relative">
      <div class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
        <component :is="icon" style="width: 14px; height: 14px;" />
      </div>
      <input
        :type="type || 'text'"
        :value="modelValue"
        :placeholder="placeholder"
        class="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 text-gray-800 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 outline-none transition-all focus:border-[#478FC8] focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-[#478FC8]/10 text-[13.5px]"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
    </div>
  </div>
</template>
