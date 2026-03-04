<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, type HTMLAttributes } from 'vue'
import { cn } from '~/utils/cn'

const props = withDefaults(defineProps<{
  class?: HTMLAttributes['class']
  open?: boolean
}>(), {
  open: false,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const isOpen = ref(props.open)

const toggle = () => {
  isOpen.value = !isOpen.value
  emit('update:open', isOpen.value)
}

const close = () => {
  isOpen.value = false
  emit('update:open', false)
}

const dropdownRef = ref<HTMLElement>()

const handleClickOutside = (e: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

const classes = computed(() => cn('relative inline-block', props.class))
</script>

<template>
  <div ref="dropdownRef" :class="classes">
    <div @click="toggle">
      <slot name="trigger" />
    </div>
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 z-50 mt-2 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
      >
        <slot :close="close" />
      </div>
    </Transition>
  </div>
</template>
