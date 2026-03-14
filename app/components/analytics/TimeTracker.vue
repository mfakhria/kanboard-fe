<script setup lang="ts">
import { Clock, Play, Pause, RotateCcw } from 'lucide-vue-next'

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
  <div class="bg-gray-900 rounded-2xl flex flex-col items-center justify-center gap-5 p-6 h-full min-h-[220px]">
    <!-- Header -->
    <div class="flex items-center gap-1.5 self-start">
      <Clock class="h-3.5 w-3.5 text-[#478FC8]" />
      <span class="text-[#478FC8] text-xs font-semibold">Time Tracker</span>
    </div>

    <!-- Timer Display -->
    <div
      class="text-white tracking-[0.08em] tabular-nums"
      style="font-size: clamp(28px, 5vw, 38px); font-weight: 800;"
    >
      {{ formattedTime }}
    </div>

    <!-- Controls -->
    <div class="flex items-center gap-3">
      <button
        :class="[
          'flex h-10 w-10 items-center justify-center rounded-full transition-all',
          timeTracker.isRunning
            ? 'bg-white/10 hover:bg-white/20'
            : 'bg-white/10 hover:bg-white/20'
        ]"
        @click="analyticsStore.toggleTimeTracker()"
      >
        <Pause v-if="timeTracker.isRunning" class="h-4 w-4 text-white" />
        <Play v-else class="ml-0.5 h-4 w-4 text-white" />
      </button>
      <button
        class="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/80 hover:bg-red-500 transition-all"
        @click="analyticsStore.resetTimeTracker()"
      >
        <RotateCcw class="h-4 w-4 text-white" />
      </button>
    </div>
  </div>
</template>
