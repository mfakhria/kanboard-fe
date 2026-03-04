<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue'
import { cn } from '~/utils/cn'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

const classes = computed(() =>
  cn('rounded-xl border bg-card text-card-foreground shadow', props.class),
)
</script>

<template>
  <div :class="classes">
    <slot />
  </div>
</template>
