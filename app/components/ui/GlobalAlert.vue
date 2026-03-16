<script setup lang="ts">
import { AlertTriangle, CheckCircle2, X } from 'lucide-vue-next'

interface AlertItem {
  id: number
  message: string
  type: 'error' | 'success'
}

const alerts = ref<AlertItem[]>([])
const timers = new Map<number, number>()

function closeAlert(id: number) {
  alerts.value = alerts.value.filter(alert => alert.id !== id)
  const timerId = timers.get(id)
  if (timerId) {
    window.clearTimeout(timerId)
    timers.delete(id)
  }
}

function pushAlert(message: string, type: 'error' | 'success') {
  const trimmed = String(message || '').trim()
  if (!trimmed) return

  const id = Date.now() + Math.floor(Math.random() * 1000)
  alerts.value.unshift({ id, message: trimmed, type })

  const timerId = window.setTimeout(() => {
    closeAlert(id)
  }, 7000)

  timers.set(id, timerId)

  if (alerts.value.length > 5) {
    const removed = alerts.value.pop()
    if (removed) closeAlert(removed.id)
  }
}

function onErrorEvent(event: Event) {
  const customEvent = event as CustomEvent<{ message?: string }>
  pushAlert(customEvent.detail?.message || 'An error occurred. Please try again.', 'error')
}

function onSuccessEvent(event: Event) {
  const customEvent = event as CustomEvent<{ message?: string }>
  pushAlert(customEvent.detail?.message || 'Success.', 'success')
}

onMounted(() => {
  window.addEventListener('app:error-alert', onErrorEvent as EventListener)
  window.addEventListener('app:success-alert', onSuccessEvent as EventListener)
})

onBeforeUnmount(() => {
  window.removeEventListener('app:error-alert', onErrorEvent as EventListener)
  window.removeEventListener('app:success-alert', onSuccessEvent as EventListener)
  for (const timerId of timers.values()) {
    window.clearTimeout(timerId)
  }
  timers.clear()
})
</script>

<template>
  <div class="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(92vw,420px)] flex-col gap-2">
    <TransitionGroup name="alert-list" tag="div" class="flex flex-col gap-2">
      <div
        v-for="item in alerts"
        :key="item.id"
        :class="[
          'pointer-events-auto rounded-xl px-4 py-3 shadow-lg',
          item.type === 'error'
            ? 'border border-red-200 bg-red-50 text-red-800 shadow-red-900/10 dark:border-red-900/40 dark:bg-red-950/70 dark:text-red-200'
            : 'border border-emerald-200 bg-emerald-50 text-emerald-800 shadow-emerald-900/10 dark:border-emerald-900/40 dark:bg-emerald-950/70 dark:text-emerald-200',
        ]"
      >
        <div class="flex items-start gap-3">
          <AlertTriangle v-if="item.type === 'error'" :size="18" class="mt-0.5 shrink-0" />
          <CheckCircle2 v-else :size="18" class="mt-0.5 shrink-0" />
          <div class="min-w-0 flex-1">
            <p class="text-sm font-bold">{{ item.type === 'error' ? 'Error' : 'Success' }}</p>
            <p class="mt-0.5 text-sm leading-5">{{ item.message }}</p>
          </div>
          <button
            type="button"
            :class="[
              'rounded-md p-1 transition',
              item.type === 'error'
                ? 'text-red-700 hover:bg-red-100 dark:text-red-300 dark:hover:bg-red-900/50'
                : 'text-emerald-700 hover:bg-emerald-100 dark:text-emerald-300 dark:hover:bg-emerald-900/50',
            ]"
            aria-label="Close alert"
            @click="closeAlert(item.id)"
          >
            <X :size="16" />
          </button>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.alert-list-enter-active,
.alert-list-leave-active {
  transition: all 0.22s ease;
}

.alert-list-enter-from,
.alert-list-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}

.alert-list-move {
  transition: transform 0.22s ease;
}
</style>
