<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue'
import { cn } from '~/utils/cn'

const props = withDefaults(defineProps<{
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'success'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  class?: HTMLAttributes['class']
  disabled?: boolean
}>(), {
  variant: 'default',
  size: 'default',
})
const classes = computed(() =>
  cn(
    'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
    {
      'bg-[#478FC8] text-white shadow hover:bg-[#478FC8]/90': props.variant === 'default',
      'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90': props.variant === 'destructive',
      'border border-input bg-background shadow-sm hover:bg-[#EDF4FF] hover:text-[#478FC8]': props.variant === 'outline',
      'bg-[#EDF4FF] text-[#478FC8] shadow-sm hover:bg-[#EDF4FF]/80': props.variant === 'secondary',
      'hover:bg-[#EDF4FF] hover:text-[#478FC8]': props.variant === 'ghost',
      'text-[#478FC8] underline-offset-4 hover:underline': props.variant === 'link',
      'bg-emerald-500 text-white shadow hover:bg-emerald-600': props.variant === 'success',

      'h-9 px-4 py-2': props.size === 'default',
      'h-8 rounded-md px-3 text-xs': props.size === 'sm',
      'h-10 rounded-md px-8': props.size === 'lg',
      'h-9 w-9': props.size === 'icon',
    },
    props.class,
  ),
)
</script>

<template>
  <button :class="classes" :disabled="disabled">
    <slot />
  </button>
</template>
