<script setup lang="ts">
import { CalendarDays, AlertCircle } from 'lucide-vue-next'

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
  <UiCard class="h-full border border-gray-100 dark:border-gray-800 shadow-sm">
    <UiCardHeader class="px-5 pt-5 pb-2">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-900/20">
            <CalendarDays class="h-3.5 w-3.5 text-amber-500" />
          </div>
          <UiCardTitle class="text-sm text-gray-700 dark:text-gray-200">Upcoming Deadlines</UiCardTitle>
        </div>
        <AlertCircle class="h-4 w-4 text-gray-300 dark:text-gray-600" />
      </div>
    </UiCardHeader>
    <UiCardContent class="px-5 pb-5">
      <div v-if="reminders.length === 0" class="flex flex-col items-center justify-center h-32 text-gray-400 dark:text-gray-500">
        <AlertCircle class="h-8 w-8 mb-2 opacity-30" />
        <p class="text-xs">No upcoming deadlines</p>
      </div>

      <ul v-else class="space-y-3">
        <li
          v-for="reminder in reminders"
          :key="reminder.id"
          class="flex items-start gap-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 p-3 hover:bg-[#EDF4FF]/50 dark:hover:bg-[#478FC8]/5 transition-colors cursor-pointer"
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
        </li>
      </ul>
    </UiCardContent>
  </UiCard>
</template>
