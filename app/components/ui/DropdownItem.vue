<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue'
import { cn } from '~/utils/cn'

const props = defineProps<{
  class?: HTMLAttributes['class']
  disabled?: boolean
}>()

const classes = computed(() =>
  cn(
    'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
    props.disabled && 'pointer-events-none opacity-50',
    props.class,
  ),
)
</script>

<template>
  <div :class="classes" role="menuitem">
    <slot />
  </div>
</template>
