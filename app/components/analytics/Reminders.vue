<script setup lang="ts">
import { Video } from 'lucide-vue-next'

const analyticsStore = useAnalyticsStore()
const reminders = computed(() => analyticsStore.reminders)
</script>

<template>
  <UiCard class="h-full">
    <UiCardHeader class="pb-3">
      <UiCardTitle class="text-base">Reminders</UiCardTitle>
    </UiCardHeader>
    <UiCardContent>
      <div v-for="reminder in reminders" :key="reminder.id" class="mb-4">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white leading-tight">
          {{ reminder.title }}
        </h3>
        <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Time : {{ reminder.time }}
        </p>
        <button class="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#478FC8] px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-lime-600 transition">
          <Video class="h-4 w-4" />
          Start Meeting
        </button>
      </div>

      <div v-if="reminders.length === 0" class="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
        No upcoming reminders
      </div>
    </UiCardContent>
  </UiCard>
</template>
