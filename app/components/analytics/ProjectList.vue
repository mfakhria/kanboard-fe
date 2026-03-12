<script setup lang="ts">
import { Plus } from 'lucide-vue-next'

const projectStore = useProjectStore()

const topProjects = computed(() => projectStore.allProjects.slice(0, 5))

const iconBgColors = [
  'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
]

function formatDueDate(d?: string) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<template>
  <UiCard class="h-full">
    <UiCardHeader class="pb-3">
      <div class="flex items-center justify-between">
        <UiCardTitle class="text-base">Project</UiCardTitle>
        <NuxtLink to="/project">
          <button class="inline-flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
            <Plus class="h-3 w-3" />
            New
          </button>
        </NuxtLink>
      </div>
    </UiCardHeader>
    <UiCardContent class="space-y-3">
      <NuxtLink
        v-for="(project, idx) in topProjects"
        :key="project.id"
        :to="`/project/${project.id}`"
        class="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer"
      >
        <div
          :class="['flex h-9 w-9 items-center justify-center rounded-lg', project.color ? '' : iconBgColors[idx % iconBgColors.length]]"
          :style="project.color ? { backgroundColor: project.color + '20', color: project.color } : {}"
        >
          <UiLucideIcon :name="project.icon || 'FolderKanban'" :size="18" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ project.name }}</p>
          <p class="text-xs text-gray-400 dark:text-gray-500">Due date: {{ formatDueDate(project.dueDate) }}</p>
        </div>
      </NuxtLink>
    </UiCardContent>
  </UiCard>
</template>
