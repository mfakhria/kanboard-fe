<script setup lang="ts">
import { ref, watch, type HTMLAttributes, computed } from 'vue'
import { cn } from '~/utils/cn'

const props = withDefaults(defineProps<{
  class?: HTMLAttributes['class']
  open?: boolean
  title?: string
  description?: string
}>(), {
  open: false,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  close: []
}>()

const isOpen = ref(props.open)

watch(() => props.open, (val) => {
  isOpen.value = val
})

const close = () => {
  isOpen.value = false
  emit('update:open', false)
  emit('close')
}

const overlayClasses = 'fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4'

const dialogClasses = computed(() =>
  cn(
    'relative w-full max-w-lg rounded-xl border bg-background p-6 shadow-lg',
    props.class,
  ),
)
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="isOpen" :class="overlayClasses" @click.self="close">
        <div :class="dialogClasses" @click.stop>
          <button
            class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none"
            @click="close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
          <div v-if="title || description" class="mb-4">
            <h2 v-if="title" class="text-lg font-semibold">{{ title }}</h2>
            <p v-if="description" class="mt-1 text-sm text-muted-foreground">{{ description }}</p>
          </div>
          <slot :close="close" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
