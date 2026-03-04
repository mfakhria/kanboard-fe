<script setup lang="ts">
import { MessageSquare, Paperclip, Calendar } from 'lucide-vue-next'
import type { Task } from '~/features/kanban/types'

const props = defineProps<{
  task: Task
}>()

const emit = defineEmits<{
  dragstart: []
  dragend: []
}>()

const showModal = ref(false)

const priorityStyles: Record<string, { bg: string; text: string }> = {
  low: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-600 dark:text-gray-300' },
  medium: { bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
  high: { bg: 'bg-orange-50 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400' },
  urgent: { bg: 'bg-red-50 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400' },
}

const labelColors: Record<string, string> = {
  design: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
  setup: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
  auth: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  backend: 'bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-400',
  api: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400',
  database: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  feature: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400',
  frontend: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400',
  responsive: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400',
  devops: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
}

const avatarColors = ['bg-red-400', 'bg-blue-400', 'bg-purple-400', 'bg-amber-400', 'bg-lime-400']
</script>

<template>
  <div
    draggable="true"
    class="group cursor-grab rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 p-3.5 shadow-sm hover:shadow-md transition-all active:cursor-grabbing"
    @dragstart="emit('dragstart')"
    @dragend="emit('dragend')"
    @click="showModal = true"
  >
    <!-- Labels -->
    <div v-if="task.labels.length" class="mb-2.5 flex flex-wrap gap-1.5">
      <span
        v-for="label in task.labels"
        :key="label"
        :class="['rounded-full px-2 py-0.5 text-[10px] font-medium', labelColors[label] || 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300']"
      >
         {{ label }}
      </span>
    </div>

    <!-- Title -->
    <h4 class="text-sm font-medium text-gray-800 dark:text-gray-200 leading-snug">{{ task.title }}</h4>

    <!-- Due Date -->
    <div v-if="task.dueDate" class="mt-2 flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
      <Calendar class="h-3 w-3" />
      {{ task.dueDate }}
    </div>

    <!-- Bottom row -->
    <div class="mt-3 flex items-center justify-between">
      <!-- Assignees -->
      <div class="flex -space-x-1.5">
        <div
          v-for="(assignee, idx) in task.assignees.slice(0, 3)"
          :key="assignee.id"
          :class="['flex h-6 w-6 items-center justify-center rounded-full border-2 border-white dark:border-gray-900 text-[10px] font-bold text-white', avatarColors[idx % avatarColors.length]]"
          :title="assignee.name"
        >
          {{ assignee.name.charAt(0) }}
        </div>
        <div
          v-if="task.assignees.length > 3"
          class="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white dark:border-gray-900 bg-gray-200 dark:bg-gray-700 text-[10px] font-bold text-gray-600 dark:text-gray-400"
        >
          +{{ task.assignees.length - 3 }}
        </div>
      </div>

      <!-- Meta -->
      <div class="flex items-center gap-2.5 text-gray-400 dark:text-gray-500">
        <div v-if="task.commentsCount" class="flex items-center gap-1">
          <MessageSquare class="h-3.5 w-3.5" />
          <span class="text-xs">{{ task.commentsCount }}</span>
        </div>
        <div v-if="task.attachmentsCount" class="flex items-center gap-1">
          <Paperclip class="h-3.5 w-3.5" />
          <span class="text-xs">{{ task.attachmentsCount }}</span>
        </div>
      </div>
    </div>

    <!-- Priority indicator -->
    <div class="mt-2">
      <span :class="['inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium', priorityStyles[task.priority]?.bg, priorityStyles[task.priority]?.text]">
        {{ task.priority }}
      </span>
    </div>
  </div>

  <!-- Task Modal -->
  <KanbanTaskModal
    v-if="showModal"
    :task="task"
    :open="showModal"
    @update:open="showModal = $event"
  />
</template>
