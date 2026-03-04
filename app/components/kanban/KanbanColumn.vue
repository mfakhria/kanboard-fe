<script setup lang="ts">
import { MoreHorizontal, Plus, Trash2, Edit3 } from 'lucide-vue-next'
import type { Column } from '~/features/kanban/types'

const props = defineProps<{
  column: Column
  dragOverColumn: string | null
  dragOverPosition: number
}>()

const emit = defineEmits<{
  dragStart: [taskId: string]
  dragOver: [e: DragEvent, columnId: string, position: number]
  drop: [columnId: string, position: number]
  dragEnd: []
}>()

const kanbanStore = useKanbanStore()

const showAddTask = ref(false)
const newTaskTitle = ref('')
const showColumnMenu = ref(false)
const isEditing = ref(false)
const editTitle = ref(props.column.title)

const columnColorMap: Record<string, string> = {
  '#6b7280': 'bg-gray-400',
  '#3b82f6': 'bg-blue-500',
  '#f59e0b': 'bg-amber-500',
  '#16a34a': 'bg-lime-500',
}

const columnColor = computed(() => columnColorMap[props.column.color || '#6b7280'] || 'bg-gray-400')

const isDragOver = computed(() => props.dragOverColumn === props.column.id)

const handleAddTask = () => {
  if (newTaskTitle.value.trim()) {
    kanbanStore.addTask(props.column.id, {
      columnId: props.column.id,
      title: newTaskTitle.value.trim(),
    })
    newTaskTitle.value = ''
    showAddTask.value = false
  }
}

const handleDeleteColumn = () => {
  kanbanStore.deleteColumn(props.column.id)
  showColumnMenu.value = false
}

const handleSaveTitle = () => {
  if (editTitle.value.trim()) {
    kanbanStore.updateColumn(props.column.id, editTitle.value.trim())
  }
  isEditing.value = false
}

const handleDropOnColumn = (e: DragEvent) => {
  e.preventDefault()
  emit('drop', props.column.id, props.column.tasks.length)
}
</script>

<template>
  <div
    :class="[
      'flex w-72 flex-shrink-0 flex-col rounded-xl transition-colors',
      isDragOver ? 'bg-lime-50/50 dark:bg-lime-900/20' : 'bg-gray-50/80 dark:bg-gray-800/50',
    ]"
    @dragover.prevent="emit('dragOver', $event, column.id, column.tasks.length)"
    @drop="handleDropOnColumn"
  >
    <!-- Column Header -->
    <div class="flex items-center justify-between px-3 py-3">
      <div class="flex items-center gap-2">
        <div :class="['h-2.5 w-2.5 rounded-full', columnColor]" />
        <template v-if="!isEditing">
          <h3
            class="text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer"
            @dblclick="isEditing = true"
          >
            {{ column.title }}
          </h3>
        </template>
        <template v-else>
          <input
            v-model="editTitle"
            class="rounded border dark:border-gray-600 dark:bg-gray-800 px-2 py-0.5 text-sm font-semibold dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-lime-500"
            @keydown.enter="handleSaveTitle"
            @keydown.escape="isEditing = false"
            @blur="handleSaveTitle"
          />
        </template>
        <span class="rounded-full bg-gray-200 dark:bg-gray-700 px-2 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-400">
          {{ column.tasks.length }}
        </span>
      </div>
      <UiDropdown>
        <template #trigger>
          <button class="rounded p-1 hover:bg-gray-200 dark:hover:bg-gray-700 transition">
            <MoreHorizontal class="h-4 w-4 text-gray-400 dark:text-gray-500" />
          </button>
        </template>
        <template #default="{ close }">
          <UiDropdownItem @click="isEditing = true; close()">
            <Edit3 class="h-3.5 w-3.5 mr-2" />
            Rename
          </UiDropdownItem>
          <UiDropdownItem @click="handleDeleteColumn">
            <Trash2 class="h-3.5 w-3.5 mr-2 text-red-500" />
            <span class="text-red-500">Delete</span>
          </UiDropdownItem>
        </template>
      </UiDropdown>
    </div>

    <!-- Tasks -->
    <div class="flex-1 space-y-2.5 px-2 pb-2 overflow-y-auto" style="max-height: calc(100vh - 320px);">
      <div
        v-for="(task, idx) in column.tasks"
        :key="task.id"
        @dragover.prevent="emit('dragOver', $event, column.id, idx)"
        @drop.stop="emit('drop', column.id, idx)"
      >
        <!-- Drop indicator -->
        <div
          v-if="isDragOver && dragOverPosition === idx"
          class="h-1 rounded-full bg-lime-500 mb-2"
        />
        <KanbanKanbanTask
          :task="task"
          @dragstart="emit('dragStart', task.id)"
          @dragend="emit('dragEnd')"
        />
      </div>
      <!-- Bottom drop indicator -->
      <div
        v-if="isDragOver && dragOverPosition >= column.tasks.length"
        class="h-1 rounded-full bg-lime-500"
      />
    </div>

    <!-- Add Task Button -->
    <div class="px-2 pb-3">
      <div v-if="!showAddTask">
        <button
          class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 dark:text-gray-500 hover:bg-white dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300 hover:shadow-sm transition"
          @click="showAddTask = true"
        >
          <Plus class="h-4 w-4" />
          Add Task
        </button>
      </div>
      <div v-else class="rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-900 p-3 shadow-sm">
        <input
          v-model="newTaskTitle"
          type="text"
          placeholder="Task title..."
          class="w-full rounded border border-gray-200 dark:border-gray-700 dark:bg-gray-800 px-3 py-2 text-sm dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-lime-500"
          @keydown.enter="handleAddTask"
          @keydown.escape="showAddTask = false"
        />
        <div class="mt-2 flex gap-2">
          <UiButton variant="success" size="sm" @click="handleAddTask">Add</UiButton>
          <UiButton variant="ghost" size="sm" @click="showAddTask = false">Cancel</UiButton>
        </div>
      </div>
    </div>
  </div>
</template>
