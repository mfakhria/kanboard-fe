<script setup lang="ts">
import {
  MessageSquare,
  Paperclip,
  Calendar,
  MoreVertical,
  Flag,
  ClipboardList,
} from 'lucide-vue-next'
import type { Task } from '~/features/kanban/types'

const props = defineProps<{
  task: Task
  columnTitle?: string
  draggable?: boolean
}>()

const emit = defineEmits<{
  dragstart: []
  dragend: []
}>()

const showModal = ref(false)

const priorityStyles: Record<string, { bg: string; text: string; label: string }> = {
  low: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-600 dark:text-gray-300', label: 'Low' },
  medium: { bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', label: 'Medium' },
  high: { bg: 'bg-orange-50 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400', label: 'High' },
  urgent: { bg: 'bg-red-50 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', label: 'Urgent' },
}

// Status badge based on column
const statusBadge = computed(() => {
  const col = (props.columnTitle || '').toLowerCase()
  if (col.includes('done') || col.includes('complete'))
    return { label: 'Completed', class: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' }
  if (col.includes('progress') || col.includes('doing'))
    return { label: 'Inprogress', class: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' }
  if (col.includes('review') || col.includes('testing'))
    return { label: 'Review', class: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' }
  return { label: 'To Do', class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' }
})

const avatarColors = [
  'bg-gradient-to-br from-amber-400 to-orange-500',
  'bg-gradient-to-br from-blue-400 to-indigo-500',
  'bg-gradient-to-br from-purple-400 to-pink-500',
  'bg-gradient-to-br from-emerald-400 to-teal-500',
  'bg-gradient-to-br from-rose-400 to-red-500',
]

const formattedDueDate = computed(() => {
  if (!props.task.dueDate) return ''
  const d = new Date(props.task.dueDate)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
})

const isOverdue = computed(() => {
  if (!props.task.dueDate) return false
  return new Date(props.task.dueDate) < new Date()
})
</script>

<template>
  <div
    :draggable="draggable !== false ? 'true' : 'false'"
    :class="['group rounded-xl border border-gray-100 dark:border-gray-700/60 bg-white dark:bg-gray-900 p-4 shadow-sm hover:shadow-md transition-all', draggable !== false ? 'cursor-grab active:cursor-grabbing active:shadow-lg active:scale-[1.02]' : '']"
    @dragstart="emit('dragstart')"
    @dragend="emit('dragend')"
    @click="showModal = true"
  >
    <!-- Top: Icon + Status + Menu -->
    <div class="flex items-start justify-between mb-3">
      <div class="flex items-center gap-2.5">
        <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-900/20 shrink-0">
          <ClipboardList class="h-4.5 w-4.5 text-amber-600 dark:text-amber-400" />
        </div>
        <span
          :class="['inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold', statusBadge.class]"
        >
          {{ statusBadge.label }}
        </span>
      </div>
      <button
        class="rounded-md p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
        @click.stop
      >
        <MoreVertical class="h-4 w-4 text-gray-400" />
      </button>
    </div>

    <!-- Title -->
    <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-snug mb-1">
      {{ task.title }}
    </h4>

    <!-- Labels (if any) -->
    <div v-if="task.labels.length" class="mb-2 flex flex-wrap gap-1">
      <span
        v-for="label in task.labels.slice(0, 3)"
        :key="label"
        class="rounded-md bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 dark:text-gray-400"
      >
        {{ label }}
      </span>
      <span v-if="task.labels.length > 3" class="rounded-md bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 text-[10px] font-medium text-gray-400">
        +{{ task.labels.length - 3 }}
      </span>
    </div>

    <!-- Due Date -->
    <div v-if="task.dueDate" class="flex items-center gap-1.5 mb-3">
      <Calendar class="h-3.5 w-3.5" :class="isOverdue ? 'text-red-500' : 'text-gray-400'" />
      <span class="text-xs" :class="isOverdue ? 'text-red-500 font-medium' : 'text-gray-400 dark:text-gray-500'">
        {{ formattedDueDate }}
      </span>
    </div>

    <!-- Priority -->
    <div class="flex items-center gap-1.5 mb-3">
      <Flag class="h-3.5 w-3.5" :class="priorityStyles[task.priority]?.text" />
      <span :class="['text-xs font-medium', priorityStyles[task.priority]?.text]">
        {{ priorityStyles[task.priority]?.label }}
      </span>
    </div>

    <!-- Bottom: Assignees + Meta -->
    <div class="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-gray-800">
      <!-- Assignees -->
      <div class="flex -space-x-1.5">
        <div
          v-for="(assignee, idx) in task.assignees.slice(0, 3)"
          :key="assignee.id"
          :class="['flex h-7 w-7 items-center justify-center rounded-full border-2 border-white dark:border-gray-900 text-[10px] font-bold text-white', avatarColors[idx % avatarColors.length]]"
          :title="assignee.name"
        >
          {{ assignee.name.charAt(0).toUpperCase() }}
        </div>
        <div
          v-if="task.assignees.length > 3"
          class="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white dark:border-gray-900 bg-gray-200 dark:bg-gray-700 text-[10px] font-bold text-gray-600 dark:text-gray-400"
        >
          +{{ task.assignees.length - 3 }}
        </div>
        <div v-if="task.assignees.length === 0" class="text-xs text-gray-400 dark:text-gray-500">
          No assignee
        </div>
      </div>

      <!-- Meta icons -->
      <div class="flex items-center gap-2.5 text-gray-400 dark:text-gray-500">
        <div v-if="task.commentsCount" class="flex items-center gap-1">
          <MessageSquare class="h-3.5 w-3.5" />
          <span class="text-[11px] font-medium">{{ task.commentsCount }}</span>
        </div>
        <div v-if="task.attachmentsCount" class="flex items-center gap-1">
          <Paperclip class="h-3.5 w-3.5" />
          <span class="text-[11px] font-medium">{{ task.attachmentsCount }}</span>
        </div>
      </div>
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
