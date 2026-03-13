<script setup lang="ts">
import { Clock, AlertTriangle } from 'lucide-vue-next'

const analyticsStore = useAnalyticsStore()
const reminders = computed(() => analyticsStore.reminders)
</script>

<template>
  <UiCard class="h-full">
    <UiCardHeader class="pb-3">
      <div class="flex items-center justify-between">
        <UiCardTitle class="text-base">Upcoming Deadlines</UiCardTitle>
        <span v-if="reminders.length > 0" class="text-xs font-medium text-amber-600 dark:text-amber-400">
          {{ reminders.length }} task{{ reminders.length > 1 ? 's' : '' }}
        </span>
      </div>
    </UiCardHeader>
    <UiCardContent class="space-y-3">
      <div
        v-for="reminder in reminders"
        :key="reminder.id"
        class="flex items-start gap-3 rounded-lg border border-gray-100 dark:border-gray-800 p-3"
      >
        <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-900/20">
          <AlertTriangle v-if="reminder.time.includes('Today') || reminder.time.includes('Tomorrow')" class="h-4 w-4 text-amber-500" />
          <Clock v-else class="h-4 w-4 text-amber-500" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ reminder.title }}</p>
          <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{{ reminder.time }}</p>
        </div>
      </div>

      <div v-if="reminders.length === 0" class="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
        No upcoming deadlines
      </div>
    </UiCardContent>
  </UiCard>
</template>
