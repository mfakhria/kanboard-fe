<script setup lang="ts">
const analyticsStore = useAnalyticsStore()
const progress = computed(() => analyticsStore.projectProgress)

// Calculate donut chart
const circumference = 2 * Math.PI * 60
const completedDash = computed(() => (progress.value.completed / 100) * circumference)
const inProgressDash = computed(() => (progress.value.inProgress / 100) * circumference)
const pendingDash = computed(() => (progress.value.pending / 100) * circumference)
</script>

<template>
  <UiCard class="h-full">
    <UiCardHeader class="pb-3">
      <UiCardTitle class="text-base">Project Progress</UiCardTitle>
    </UiCardHeader>
    <UiCardContent>
      <!-- Donut Chart -->
      <div class="flex items-center justify-center">
        <div class="relative h-40 w-40">
          <svg viewBox="0 0 140 140" class="h-full w-full -rotate-90">
            <!-- Background circle -->
            <circle cx="70" cy="70" r="60" fill="none" class="stroke-gray-200 dark:stroke-gray-700" stroke-width="14" />
            <!-- Completed (green) -->
            <circle
              cx="70" cy="70" r="60" fill="none"
              stroke="#a3e635" stroke-width="14" stroke-linecap="round"
              :stroke-dasharray="`${completedDash} ${circumference}`"
              stroke-dashoffset="0"
            />
            <!-- In Progress (lime-400) -->
            <circle
              cx="70" cy="70" r="60" fill="none"
              stroke="#bef264" stroke-width="14" stroke-linecap="round"
              :stroke-dasharray="`${inProgressDash} ${circumference}`"
              :stroke-dashoffset="`-${completedDash}`"
            />
          </svg>
          <!-- Center text -->
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <span class="text-3xl font-bold text-gray-900 dark:text-white">{{ progress.completed }}%</span>
            <span class="text-xs text-gray-500 dark:text-gray-400">Project Ended</span>
          </div>
        </div>
      </div>

      <!-- Legend -->
      <div class="mt-4 flex items-center justify-center gap-6">
        <div class="flex items-center gap-1.5">
          <div class="h-2.5 w-2.5 rounded-full bg-lime-500" />
          <span class="text-xs text-gray-500 dark:text-gray-400">Completed</span>
        </div>
        <div class="flex items-center gap-1.5">
          <div class="h-2.5 w-2.5 rounded-full bg-lime-300" />
          <span class="text-xs text-gray-500 dark:text-gray-400">In Progress</span>
        </div>
        <div class="flex items-center gap-1.5">
          <svg class="h-2.5 w-2.5 text-gray-300 dark:text-gray-600" viewBox="0 0 10 10">
            <line x1="0" y1="5" x2="10" y2="5" stroke="currentColor" stroke-width="2" stroke-dasharray="2 2"/>
          </svg>
          <span class="text-xs text-gray-500 dark:text-gray-400">Pending</span>
        </div>
      </div>
    </UiCardContent>
  </UiCard>
</template>
