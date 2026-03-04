<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue'
import { cn } from '~/utils/cn'

const props = defineProps<{
  class?: HTMLAttributes['class']
  for?: string
}>()

const classes = computed(() =>
  cn('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', props.class),
)
</script>

<template>
  <label :class="classes" :for="props.for">
    <slot />
  </label>
</template>
