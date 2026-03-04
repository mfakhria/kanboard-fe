<script setup lang="ts">
/**
 * PageHeader — unified page header
 * Provides consistent title, subtitle, and optional action buttons.
 *
 * Reference: Dashboard page header
 */
defineProps<{
  /** Page title */
  title: string
  /** Page subtitle / description */
  subtitle?: string
}>()
</script>

<template>
  <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <!-- Optional breadcrumb / extra content above title -->
      <slot name="breadcrumb" />
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white lg:text-3xl">{{ title }}</h1>
      <p v-if="subtitle" class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {{ subtitle }}
      </p>
    </div>
    <div v-if="$slots.actions" class="flex items-center gap-3">
      <slot name="actions" />
    </div>
  </div>
</template>
