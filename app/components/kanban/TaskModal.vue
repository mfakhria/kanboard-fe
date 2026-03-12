<script setup lang="ts">
import {
  Calendar,
  Tag,
  Users,
  Flag,
  MessageSquare,
  X,
  Columns3,
  Trash2,
  Save,
} from 'lucide-vue-next'
import type { Task } from '~/features/kanban/types'

const props = defineProps<{
  task: Task
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const kanbanStore = useKanbanStore()

const editForm = reactive({
  title: props.task.title,
  description: props.task.description || '',
  priority: props.task.priority,
  dueDate: props.task.dueDate || '',
})

// Available columns for moving tasks
const columns = computed(() => kanbanStore.columns)
const currentColumnId = computed(() => props.task.columnId)
const selectedColumnId = ref(props.task.columnId)

// Move task to another column
function handleMoveToColumn() {
  if (selectedColumnId.value !== currentColumnId.value) {
    const targetCol = columns.value.find(c => c.id === selectedColumnId.value)
    if (targetCol) {
      kanbanStore.moveTask({
        taskId: props.task.id,
        targetColumnId: selectedColumnId.value,
        targetPosition: targetCol.tasks.length,
      })
    }
  }
}

const handleSave = () => {
  kanbanStore.updateTask(props.task.id, {
    title: editForm.title,
    description: editForm.description,
    priority: editForm.priority,
    dueDate: editForm.dueDate,
  })
  // Move task if column changed
  handleMoveToColumn()
  emit('update:open', false)
}

const handleDelete = () => {
  kanbanStore.deleteTask(props.task.id)
  emit('update:open', false)
}

const priorityOptions = [
  { label: 'Low', value: 'low', color: 'text-gray-500' },
  { label: 'Medium', value: 'medium', color: 'text-blue-500' },
  { label: 'High', value: 'high', color: 'text-orange-500' },
  { label: 'Urgent', value: 'urgent', color: 'text-red-500' },
]

const priorityColors: Record<string, string> = {
  low: 'text-gray-500',
  medium: 'text-blue-500',
  high: 'text-orange-500',
  urgent: 'text-red-500',
}
</script>

<template>
  <UiDialog :open="open" @update:open="emit('update:open', $event)">
    <template #default="{ close }">
      <div class="space-y-5">
        <!-- Title -->
        <div>
          <input
            v-model="editForm.title"
            class="w-full text-lg font-bold text-gray-900 dark:text-white border-none outline-none focus:ring-0 p-0 bg-transparent placeholder:text-gray-400"
            placeholder="Task title"
          />
        </div>

        <!-- Meta row: Priority + Due Date + Status Column -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <!-- Priority -->
          <div>
            <label class="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              <Flag :class="['h-3.5 w-3.5', priorityColors[editForm.priority]]" />
              Priority
            </label>
            <select
              v-model="editForm.priority"
              class="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#478FC8] focus:border-transparent"
            >
              <option v-for="opt in priorityOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>

          <!-- Due Date -->
          <div>
            <label class="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              <Calendar class="h-3.5 w-3.5" />
              Due Date
            </label>
            <input
              v-model="editForm.dueDate"
              type="date"
              class="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#478FC8] focus:border-transparent"
            />
          </div>

          <!-- Move to Column -->
          <div>
            <label class="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
              <Columns3 class="h-3.5 w-3.5" />
              Status
            </label>
            <select
              v-model="selectedColumnId"
              class="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#478FC8] focus:border-transparent"
            >
              <option v-for="col in columns" :key="col.id" :value="col.id">
                {{ col.title }}
              </option>
            </select>
          </div>
        </div>

        <!-- Assignees -->
        <div>
          <div class="flex items-center gap-2 mb-2">
            <Users class="h-4 w-4 text-gray-400 dark:text-gray-500" />
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Assignees</span>
          </div>
          <div class="flex -space-x-1">
            <div
              v-for="assignee in task.assignees"
              :key="assignee.id"
              class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white dark:border-gray-800 bg-[#478FC8] text-xs font-bold text-white"
              :title="assignee.name"
            >
              {{ assignee.name.charAt(0).toUpperCase() }}
            </div>
            <button class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 hover:border-[#478FC8] hover:text-[#478FC8] transition">
              +
            </button>
          </div>
        </div>

        <!-- Labels -->
        <div v-if="task.labels.length">
          <div class="flex items-center gap-2 mb-2">
            <Tag class="h-4 w-4 text-gray-400 dark:text-gray-500" />
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Labels</span>
          </div>
          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="label in task.labels"
              :key="label"
              class="rounded-full bg-gray-100 dark:bg-gray-700 px-2.5 py-1 text-xs font-medium text-gray-600 dark:text-gray-300"
            >
              {{ label }}
            </span>
          </div>
        </div>

        <!-- Description -->
        <div>
          <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
          <UiTextarea
            v-model="editForm.description"
            placeholder="Add a description..."
            class="min-h-[100px]"
          />
        </div>

        <!-- Comments preview -->
        <div v-if="task.commentsCount > 0" class="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500">
          <MessageSquare class="h-4 w-4" />
          {{ task.commentsCount }} comments
        </div>

        <!-- Actions -->
        <div class="flex justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
          <UiButton variant="outline" size="sm" class="gap-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200 dark:border-red-800 dark:text-red-400" @click="handleDelete">
            <Trash2 class="h-3.5 w-3.5" />
            Delete
          </UiButton>
          <div class="flex gap-2">
            <UiButton variant="outline" size="sm" @click="close">Cancel</UiButton>
            <UiButton size="sm" class="gap-1.5 bg-[#478FC8] hover:bg-[#3a7bb3] text-white" @click="handleSave">
              <Save class="h-3.5 w-3.5" />
              Save Changes
            </UiButton>
          </div>
        </div>
      </div>
    </template>
  </UiDialog>
</template>
