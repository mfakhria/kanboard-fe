<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue'
import { cn } from '~/utils/cn'

const props = withDefaults(defineProps<{
  class?: HTMLAttributes['class']
  src?: string
  alt?: string
  fallback?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}>(), {
  size: 'md',
  alt: '',
  fallback: '',
})

const sizeClasses = computed(() => ({
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
}[props.size]))

const classes = computed(() =>
  cn('relative flex shrink-0 overflow-hidden rounded-full', sizeClasses.value, props.class),
)

const initials = computed(() => {
  if (props.fallback) return props.fallback
  if (props.alt) {
    return props.alt
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
  return '?'
})
</script>

<template>
  <span :class="classes">
    <img
      v-if="src"
      :src="src"
      :alt="alt"
      class="aspect-square h-full w-full object-cover"
    />
    <span
      v-else
      class="flex h-full w-full items-center justify-center rounded-full bg-muted font-medium"
    >
      {{ initials }}
    </span>
  </span>
</template>
