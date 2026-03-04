<script setup lang="ts">
import { ref, watch, type HTMLAttributes, computed } from 'vue'
import { cn } from '~/utils/cn'

const props = withDefaults(defineProps<{
  class?: HTMLAttributes['class']
  open?: boolean
  side?: 'left' | 'right'
}>(), {
  open: false,
  side: 'right',
})

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const isOpen = ref(props.open)

watch(() => props.open, (val) => {
  isOpen.value = val
})

const close = () => {
  isOpen.value = false
  emit('update:open', false)
}

const overlayClasses = computed(() =>
  cn('fixed inset-0 z-50 bg-black/50 transition-opacity', isOpen.value ? 'opacity-100' : 'opacity-0 pointer-events-none'),
)

const sheetClasses = computed(() =>
  cn(
    'fixed z-50 bg-background shadow-lg transition-transform duration-300',
    props.side === 'right' ? 'inset-y-0 right-0 w-3/4 max-w-sm' : 'inset-y-0 left-0 w-3/4 max-w-sm',
    isOpen.value
      ? 'translate-x-0'
      : props.side === 'right'
        ? 'translate-x-full'
        : '-translate-x-full',
    props.class,
  ),
)
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" :class="overlayClasses" @click="close" />
    <div :class="sheetClasses">
      <slot :close="close" />
    </div>
  </Teleport>
</template>
