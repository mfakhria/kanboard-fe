<script setup lang="ts">
import { Pause, Square } from 'lucide-vue-next'

const analyticsStore = useAnalyticsStore()
const timeTracker = computed(() => analyticsStore.timeTracker)

// Timer interval
let timerInterval: ReturnType<typeof setInterval> | null = null

const formattedTime = computed(() => {
  const totalSeconds = timeTracker.value.elapsed
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

onMounted(() => {
  timerInterval = setInterval(() => {
    analyticsStore.incrementTimer()
  }, 1000)
})

onBeforeUnmount(() => {
  if (timerInterval) clearInterval(timerInterval)
})
</script>

<template>
  <UiCard class="h-full overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 text-white border-gray-800">
    <!-- Decorative lines -->
    <div class="absolute inset-0 opacity-10">
      <div v-for="i in 8" :key="i" class="absolute h-full w-px bg-lime-400" :style="{ left: `${i * 12}%` }" />
    </div>

    <UiCardHeader class="relative pb-2">
      <UiCardTitle class="text-base text-lime-300">Time Tracker</UiCardTitle>
    </UiCardHeader>
    <UiCardContent class="relative">
      <!-- Time Display -->
      <div class="mb-6 text-center">
        <p class="text-4xl font-bold tracking-wider text-white font-mono">
          {{ formattedTime }}
        </p>
      </div>

      <!-- Controls -->
      <div class="flex items-center justify-center gap-3">
        <button
          class="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
          @click="analyticsStore.toggleTimeTracker()"
        >
          <Pause v-if="timeTracker.isRunning" class="h-5 w-5" />
          <svg v-else class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5,3 19,12 5,21" />
          </svg>
        </button>
        <button
          class="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/80 text-white hover:bg-red-500 transition"
          @click="analyticsStore.resetTimeTracker()"
        >
          <Square class="h-5 w-5" />
        </button>
      </div>
    </UiCardContent>
  </UiCard>
</template>
