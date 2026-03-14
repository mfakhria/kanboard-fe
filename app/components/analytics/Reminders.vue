<script setup lang="ts">
import { CalendarDays } from 'lucide-vue-next'

const analyticsStore = useAnalyticsStore()
const reminders = computed(() => analyticsStore.reminders)

function getPriority(time: string): 'high' | 'medium' | 'low' {
  if (time.includes('Today') || time.includes('Tomorrow')) return 'high'
  if (time.includes('2 days') || time.includes('3 days')) return 'medium'
  return 'low'
}

const priorityDotColor: Record<string, string> = {
  high: 'bg-red-400',
  medium: 'bg-amber-400',
  low: 'bg-green-400',
}

const priorityBadge: Record<string, { bg: string; text: string }> = {
  high: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400' },
  medium: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400' },
  low: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400' },
}
</script>

<template>
  <div class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex flex-col overflow-hidden h-full">
    <!-- Header -->
    <div class="flex items-center justify-between px-5 py-4 border-b border-gray-50 dark:border-gray-800">
      <div class="flex items-center gap-2">
        <CalendarDays class="h-4 w-4 text-amber-400" />
        <span class="text-[13.5px] font-bold text-gray-900 dark:text-white">Upcoming Deadlines</span>
      </div>
    </div>
    <!-- Content -->
    <div class="flex-1 flex flex-col">
      <div v-if="reminders.length === 0" class="flex-1 flex flex-col items-center justify-center gap-2 py-10">
        <CalendarDays class="h-10 w-10 text-gray-300 dark:text-gray-600" />
        <p class="text-[13px] font-semibold text-gray-500 dark:text-gray-400">No upcoming deadlines</p>
      </div>

      <div v-else class="flex flex-col divide-y divide-gray-50 dark:divide-gray-800/60 px-5 py-2">
        <div
          v-for="reminder in reminders"
          :key="reminder.id"
          class="flex items-start gap-3 py-3 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-800/30 -mx-2 px-2 rounded-lg transition-colors"
        >
          <!-- Priority dot -->
          <span
            :class="['mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full', priorityDotColor[getPriority(reminder.time)]]"
          />
          <div class="min-w-0 flex-1">
            <p class="text-[13px] font-medium text-gray-700 dark:text-gray-200 truncate">
              {{ reminder.title }}
            </p>
            <p class="mt-0.5 text-[11px] text-gray-400 dark:text-gray-500">
              {{ reminder.time }}
            </p>
          </div>
          <!-- Priority badge -->
          <span
            :class="[
              'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium',
              priorityBadge[getPriority(reminder.time)].bg,
              priorityBadge[getPriority(reminder.time)].text,
            ]"
          >
            {{ getPriority(reminder.time) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
