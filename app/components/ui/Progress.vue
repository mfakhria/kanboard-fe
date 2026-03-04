<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue'
import { cn } from '~/utils/cn'

const props = withDefaults(defineProps<{
  class?: HTMLAttributes['class']
  modelValue?: number
  max?: number
  indicatorClass?: string
}>(), {
  modelValue: 0,
  max: 100,
})

const percentage = computed(() => Math.min(100, Math.max(0, (props.modelValue / props.max) * 100)))

const classes = computed(() =>
  cn('relative h-2 w-full overflow-hidden rounded-full bg-primary/20', props.class),
)
</script>

<template>
  <div :class="classes">
    <div
      :class="cn('h-full w-full flex-1 bg-primary transition-all rounded-full', indicatorClass)"
      :style="{ transform: `translateX(-${100 - percentage}%)` }"
    />
  </div>
</template>
