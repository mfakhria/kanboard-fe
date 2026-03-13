<script setup lang="ts">
const analyticsStore = useAnalyticsStore()

const days = computed(() => analyticsStore.weeklyProductivity.labels)
const data = computed(() => analyticsStore.weeklyProductivity.data)
const maxValue = computed(() => Math.max(...data.value, 1))
const weeklyTotal = computed(() => data.value.reduce((sum, v) => sum + v, 0))
</script>

<template>
  <UiCard class="h-full">
    <UiCardHeader class="pb-2">
      <div class="flex items-center justify-between">
        <UiCardTitle class="text-base">Project Analytics</UiCardTitle>
        <span class="text-xs text-gray-400 dark:text-gray-500">
          <span class="inline-block h-2 w-2 rounded-full bg-[#478FC8] mr-1"></span>
          {{ weeklyTotal }} tasks this week
        </span>
      </div>
    </UiCardHeader>
    <UiCardContent>
      <!-- Bar Chart -->
      <div class="flex items-end justify-between gap-2 h-36 mt-2">
        <div
          v-for="(value, idx) in data"
          :key="idx"
          class="flex flex-1 flex-col items-center gap-2"
        >
          <div class="w-full flex justify-center">
            <div
              class="w-8 rounded-t-lg bg-[#478FC8]/20 transition-all relative overflow-hidden"
              :style="{ height: `${(value / maxValue) * 120}px` }"
            >
              <div
                class="absolute bottom-0 left-0 right-0 bg-[#478FC8] rounded-t-lg transition-all"
                :style="{ height: `${(value / maxValue) * 70}%` }"
              />
            </div>
          </div>
          <span class="text-xs font-medium text-gray-400 dark:text-gray-500">{{ days[idx] }}</span>
        </div>
      </div>
    </UiCardContent>
  </UiCard>
</template>
