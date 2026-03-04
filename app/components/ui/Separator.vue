<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue'
import { cn } from '~/utils/cn'

const props = withDefaults(defineProps<{
  class?: HTMLAttributes['class']
  orientation?: 'horizontal' | 'vertical'
}>(), {
  orientation: 'horizontal',
})

const classes = computed(() =>
  cn(
    'shrink-0 bg-border',
    props.orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
    props.class,
  ),
)
</script>

<template>
  <div role="separator" :class="classes" />
</template>
