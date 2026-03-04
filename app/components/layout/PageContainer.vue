<script setup lang="ts">
/**
 * PageContainer — unified page layout wrapper
 * Provides consistent max-width, padding, and vertical spacing
 * for all pages under the dashboard layout.
 *
 * Reference: Dashboard page layout
 */
withDefaults(defineProps<{
  /** Remove default vertical gap between children */
  flush?: boolean
}>(), {
  flush: false,
})
</script>

<template>
  <div class="mx-auto w-full max-w-[1600px]" :class="[flush ? '' : 'space-y-6']">
    <slot />
  </div>
</template>
