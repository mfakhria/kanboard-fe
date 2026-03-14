<script setup lang="ts">
import { Plus, FolderKanban } from 'lucide-vue-next'

const projectStore = useProjectStore()

const topProjects = computed(() => projectStore.allProjects.slice(0, 5))

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
  <div class="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex flex-col overflow-hidden h-full">
    <!-- Header -->
    <div class="flex items-center justify-between px-5 py-4 border-b border-gray-50 dark:border-gray-800">
      <div class="flex items-center gap-2">
        <FolderKanban class="h-4 w-4 text-[#478FC8]" />
        <span class="text-[13.5px] font-bold text-gray-900 dark:text-white">Project</span>
      </div>
      <NuxtLink to="/project">
        <button class="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EDF4FF] dark:bg-[#478FC8]/10 text-[#478FC8] hover:bg-[#478FC8]/20 transition-all text-xs font-semibold">
          <Plus class="h-3 w-3" />
          New
        </button>
      </NuxtLink>
    </div>
    <!-- Content -->
    <div class="flex-1 flex flex-col">
      <div v-if="topProjects.length === 0" class="flex-1 flex flex-col items-center justify-center gap-2 py-10">
        <FolderKanban class="h-10 w-10 text-gray-300 dark:text-gray-600" />
        <p class="text-[13px] font-semibold text-gray-500 dark:text-gray-400">No projects yet</p>
      </div>

      <div v-else class="flex flex-col divide-y divide-gray-50 dark:divide-gray-800/60 px-5 py-2">
        <NuxtLink
          v-for="(project, idx) in topProjects"
          :key="project.id"
          :to="`/project/${project.id}`"
          class="flex items-center gap-3 py-3 group"
        >
          <div
            class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            :style="{ backgroundColor: (project.color || '#478FC8') + '20', color: project.color || '#478FC8' }"
          >
            <UiLucideIcon :name="project.icon || 'FolderKanban'" :size="14" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-[13px] font-semibold text-gray-800 dark:text-gray-200 truncate">{{ project.name }}</p>
            <p class="text-[11px] text-gray-400 dark:text-gray-500">Due date: {{ formatDueDate(project.dueDate) }}</p>
            <div class="mt-1 h-1 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-500"
                :class="getProgress(project) === 0 ? 'bg-gray-200 dark:bg-gray-700' : ''"
                :style="{
                  width: `${getProgress(project)}%`,
                  backgroundColor: getProgress(project) === 100 ? '#22c55e' : getProgress(project) > 0 ? (project.color || '#478FC8') : '',
                }"
              />
            </div>
          </div>
          <span
            :class="[getProgress(project) === 100 ? 'text-green-600' : 'text-gray-400 dark:text-gray-500']"
            class="shrink-0 text-xs font-bold"
          >
            {{ getProgress(project) }}%
          </span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
