<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue'
import { cn } from '~/utils/cn'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

const classes = computed(() =>
  cn('text-sm text-muted-foreground', props.class),
)
</script>

<template>
  <p :class="classes">
    <slot />
  </p>
</template>
