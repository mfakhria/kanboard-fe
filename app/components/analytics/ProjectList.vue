<script setup lang="ts">
import { Plus, Layers } from 'lucide-vue-next'

const projectStore = useProjectStore()

const topProjects = computed(() => projectStore.allProjects.slice(0, 5))

const iconBgColors = [
  'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
]

const progressColors = ['#22c55e', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6']

function getProgress(project: { totalTasks?: number; completedTasks?: number }): number {
  const total = project.totalTasks ?? 0
  const completed = project.completedTasks ?? 0
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}

function formatDueDate(d?: string) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<template>
  <UiCard class="h-full border border-gray-100 dark:border-gray-800 shadow-sm">
    <UiCardHeader class="px-5 pt-5 pb-2">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/20">
            <Layers class="h-3.5 w-3.5 text-green-500" />
          </div>
          <UiCardTitle class="text-sm text-gray-700 dark:text-gray-200">Project</UiCardTitle>
        </div>
        <NuxtLink to="/project">
          <button class="inline-flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-700 px-2.5 py-1 text-[11px] font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition h-7">
            <Plus class="h-3 w-3" />
            New
          </button>
        </NuxtLink>
      </div>
    </UiCardHeader>
    <UiCardContent class="px-5 pb-5">
      <ul class="space-y-3">
        <li
          v-for="(project, idx) in topProjects"
          :key="project.id"
        >
          <NuxtLink
            :to="`/project/${project.id}`"
            class="flex items-center gap-3 rounded-xl p-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
          >
            <div
              :class="['flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', project.color ? '' : iconBgColors[idx % iconBgColors.length]]"
              :style="project.color ? { backgroundColor: project.color + '20', color: project.color } : {}"
            >
              <UiLucideIcon :name="project.icon || 'FolderKanban'" :size="16" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-[13px] font-medium text-gray-700 dark:text-gray-200 truncate">{{ project.name }}</p>
              <p class="text-[11px] text-gray-400 dark:text-gray-500">Due date: {{ formatDueDate(project.dueDate) }}</p>
              <!-- Dynamic progress bar from API -->
              <div class="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :style="{
                    width: `${getProgress(project)}%`,
                    backgroundColor: project.color || progressColors[idx % progressColors.length]
                  }"
                />
              </div>
            </div>
            <span class="shrink-0 text-[11px] text-gray-400 dark:text-gray-500">
              {{ getProgress(project) }}%
            </span>
          </NuxtLink>
        </li>
      </ul>

      <div v-if="topProjects.length === 0" class="flex flex-col items-center justify-center h-32 text-gray-400 dark:text-gray-500">
        <Layers class="h-8 w-8 mb-2 opacity-30" />
        <p class="text-xs">No projects yet</p>
      </div>
    </UiCardContent>
  </UiCard>
</template>
