<script setup lang="ts">
import { Calendar, Tag, Users, Flag, MessageSquare } from 'lucide-vue-next'
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

const handleSave = () => {
  kanbanStore.updateTask(props.task.id, {
    title: editForm.title,
    description: editForm.description,
    priority: editForm.priority,
    dueDate: editForm.dueDate,
  })
  emit('update:open', false)
}

const handleDelete = () => {
  kanbanStore.deleteTask(props.task.id)
  emit('update:open', false)
}

const priorityOptions = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Urgent', value: 'urgent' },
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
            class="w-full text-lg font-semibold text-gray-900 dark:text-white border-none outline-none focus:ring-0 p-0 bg-transparent"
            placeholder="Task title"
          />
        </div>

        <!-- Meta row -->
        <div class="flex flex-wrap gap-4 text-sm">
          <!-- Priority -->
          <div class="flex items-center gap-2">
            <Flag :class="['h-4 w-4', priorityColors[editForm.priority]]" />
            <select
              v-model="editForm.priority"
              class="rounded border-none bg-gray-50 dark:bg-gray-800 px-2 py-1 text-sm dark:text-gray-200 focus:ring-1 focus:ring-lime-500"
            >
              <option v-for="opt in priorityOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>

          <!-- Due Date -->
          <div class="flex items-center gap-2">
            <Calendar class="h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              v-model="editForm.dueDate"
              type="date"
              class="rounded border-none bg-gray-50 dark:bg-gray-800 px-2 py-1 text-sm dark:text-gray-200 focus:ring-1 focus:ring-lime-500"
            />
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
              v-for="(assignee, idx) in task.assignees"
              :key="assignee.id"
              class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white dark:border-gray-800 bg-lime-500 text-xs font-bold text-gray-900"
              :title="assignee.name"
            >
              {{ assignee.name.charAt(0) }}
            </div>
            <button class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 hover:border-lime-400 hover:text-lime-500">
              +
            </button>
          </div>
        </div>

        <!-- Labels -->
        <div>
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
        <div class="flex justify-between pt-2 border-t">
          <UiButton variant="destructive" size="sm" @click="handleDelete">
            Delete Task
          </UiButton>
          <div class="flex gap-2">
            <UiButton variant="outline" size="sm" @click="close">Cancel</UiButton>
            <UiButton variant="success" size="sm" @click="handleSave">Save Changes</UiButton>
          </div>
        </div>
      </div>
    </template>
  </UiDialog>
</template>
