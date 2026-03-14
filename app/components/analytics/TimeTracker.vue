<script setup lang="ts">
import { Clock, Play, Square, RotateCcw } from 'lucide-vue-next'

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
  <UiCard
    class="h-full overflow-hidden border-0 shadow-sm"
    style="background: linear-gradient(135deg, #1a1f2e 0%, #0f1420 100%)"
  >
    <UiCardContent class="flex h-full flex-col items-center justify-center gap-6 p-6">
      <!-- Header -->
      <div class="flex w-full items-center gap-2 self-start">
        <Clock class="h-4 w-4 text-cyan-400" />
        <span class="text-[13px] font-medium text-cyan-400">Time Tracker</span>
      </div>

      <!-- Timer Display -->
      <div class="font-mono text-[2.8rem] font-bold tracking-[0.12em] text-white">
        {{ formattedTime }}
      </div>

      <!-- Controls -->
      <div class="flex items-center gap-4">
        <button
          :class="[
            'flex h-12 w-12 items-center justify-center rounded-full transition-all',
            timeTracker.isRunning
              ? 'bg-gray-700 hover:bg-gray-600'
              : 'bg-white/15 hover:bg-white/25'
          ]"
          @click="analyticsStore.toggleTimeTracker()"
        >
          <Square v-if="timeTracker.isRunning" class="h-5 w-5 fill-white text-white" />
          <Play v-else class="ml-0.5 h-5 w-5 fill-white text-white" />
        </button>
        <button
          class="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/80 hover:bg-red-500 transition-all"
          @click="analyticsStore.resetTimeTracker()"
        >
          <RotateCcw class="h-4 w-4 text-white" />
        </button>
      </div>

      <!-- Status -->
      <div class="flex items-center gap-1.5">
        <span
          :class="[
            'h-2 w-2 rounded-full',
            timeTracker.isRunning ? 'bg-green-400 animate-pulse' : 'bg-gray-600'
          ]"
        />
        <span class="text-[11px] text-gray-400">
          {{ timeTracker.isRunning ? 'Tracking...' : 'Stopped' }}
        </span>
      </div>
    </UiCardContent>
  </UiCard>
</template>
