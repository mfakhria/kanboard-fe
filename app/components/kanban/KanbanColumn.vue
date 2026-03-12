<script setup lang="ts">
import { MoreHorizontal, Plus, Trash2, Edit3, GripVertical } from 'lucide-vue-next'
import type { Column } from '~/features/kanban/types'

const props = defineProps<{
  column: Column
  searchQuery?: string
  dragOverColumn: string | null
  dragOverPosition: number
  draggedTaskId: string | null
}>()

const emit = defineEmits<{
  dragStart: [taskId: string, sourceColumnId: string]
  dragOver: [e: DragEvent, columnId: string, position: number]
  drop: [columnId: string, position: number]
  dragEnd: []
}>()

const kanbanStore = useKanbanStore()

const readonly = inject('projectReadonly', ref(false))

const showAddTask = ref(false)
const newTaskTitle = ref('')
const showColumnMenu = ref(false)
const isEditing = ref(false)
const editTitle = ref(props.column.title)

// Column color config based on column name
const columnConfig = computed(() => {
  const name = props.column.title.toLowerCase()
  if (name.includes('to do') || name.includes('todo') || name.includes('backlog'))
    return { dot: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400', highlight: 'border-blue-200 dark:border-blue-800' }
  if (name.includes('progress') || name.includes('doing'))
    return { dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400', highlight: 'border-amber-200 dark:border-amber-800' }
  if (name.includes('review') || name.includes('testing'))
    return { dot: 'bg-purple-500', badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400', highlight: 'border-purple-200 dark:border-purple-800' }
  if (name.includes('done') || name.includes('complete'))
    return { dot: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400', highlight: 'border-emerald-200 dark:border-emerald-800' }
  return { dot: 'bg-gray-400', badge: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400', highlight: 'border-gray-200 dark:border-gray-700' }
})

const isDragOver = computed(() => props.dragOverColumn === props.column.id)

// Filter tasks by search
const filteredTasks = computed(() => {
  if (!props.searchQuery) return props.column.tasks
  const q = props.searchQuery.toLowerCase()
  return props.column.tasks.filter(t =>
    t.title.toLowerCase().includes(q) ||
    t.labels.some(l => l.toLowerCase().includes(q)) ||
    t.assignees.some(a => a.name.toLowerCase().includes(q))
  )
})

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
      'flex w-[280px] flex-shrink-0 flex-col rounded-2xl border transition-all duration-200',
      isDragOver
        ? `bg-blue-50/60 dark:bg-blue-900/10 ${columnConfig.highlight}`
        : 'bg-gray-50/80 dark:bg-gray-800/40 border-gray-100 dark:border-gray-800',
    ]"
    @dragover.prevent="emit('dragOver', $event, column.id, column.tasks.length)"
    @drop="handleDropOnColumn"
  >
    <!-- Column Header -->
    <div class="flex items-center justify-between px-4 py-3.5">
      <div class="flex items-center gap-2.5">
        <div :class="['h-2.5 w-2.5 rounded-full shrink-0', columnConfig.dot]" />
        <template v-if="!isEditing">
          <h3
            class="text-sm font-semibold text-gray-800 dark:text-gray-200 cursor-pointer select-none"
            @dblclick="isEditing = true; editTitle = column.title"
          >
            {{ column.title }}
          </h3>
        </template>
        <template v-else>
          <input
            v-model="editTitle"
            class="rounded-md border dark:border-gray-600 dark:bg-gray-800 px-2 py-0.5 text-sm font-semibold dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#478FC8] w-28"
            @keydown.enter="handleSaveTitle"
            @keydown.escape="isEditing = false"
            @blur="handleSaveTitle"
          />
        </template>
        <span
          :class="['inline-flex items-center justify-center min-w-[22px] h-[22px] rounded-full px-1.5 text-xs font-bold', columnConfig.badge]"
        >
          {{ filteredTasks.length }}
        </span>
      </div>
      <UiDropdown v-if="!readonly">
        <template #trigger>
          <button class="rounded-lg p-1 hover:bg-gray-200/70 dark:hover:bg-gray-700 transition">
            <MoreHorizontal class="h-4 w-4 text-gray-400 dark:text-gray-500" />
          </button>
        </template>
        <template #default="{ close }">
          <UiDropdownItem @click="isEditing = true; editTitle = column.title; close()">
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
    <div class="flex-1 space-y-3 px-3 pb-3 overflow-y-auto" style="max-height: calc(100vh - 360px);">
      <div
        v-for="(task, idx) in filteredTasks"
        :key="task.id"
        @dragover.prevent.stop="emit('dragOver', $event, column.id, idx)"
        @drop.stop="emit('drop', column.id, idx)"
      >
        <!-- Drop indicator -->
        <div
          v-if="isDragOver && dragOverPosition === idx"
          class="h-1 rounded-full bg-[#478FC8] mb-2 transition-all"
        />
        <KanbanTask
          :task="task"
          :column-title="column.title"
          :draggable="!readonly"
          :class="{ 'opacity-40': draggedTaskId === task.id }"
          @dragstart="!readonly && emit('dragStart', task.id, column.id)"
          @dragend="emit('dragEnd')"
        />
      </div>
      <!-- Bottom drop indicator -->
      <div
        v-if="isDragOver && dragOverPosition >= column.tasks.length"
        class="h-1 rounded-full bg-[#478FC8] transition-all"
      />

      <!-- Empty state -->
      <div
        v-if="filteredTasks.length === 0"
        class="flex flex-col items-center justify-center py-8 text-center"
      >
        <div class="rounded-full bg-gray-100 dark:bg-gray-800 p-3 mb-2">
          <Plus class="h-5 w-5 text-gray-400" />
        </div>
        <p class="text-xs text-gray-400 dark:text-gray-500">No tasks yet</p>
      </div>
    </div>

    <!-- Add Task Button -->
    <div v-if="!readonly" class="px-3 pb-3">
      <div v-if="!showAddTask">
        <button
          class="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 px-3 py-2.5 text-sm font-medium text-gray-400 dark:text-gray-500 hover:border-[#478FC8] hover:text-[#478FC8] hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all"
          @click="showAddTask = true"
        >
          <Plus class="h-4 w-4" />
          Add Task
        </button>
      </div>
      <div v-else class="rounded-xl border dark:border-gray-700 bg-white dark:bg-gray-900 p-3 shadow-sm">
        <input
          v-model="newTaskTitle"
          type="text"
          placeholder="Task title..."
          class="w-full rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800 px-3 py-2 text-sm dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#478FC8]"
          autofocus
          @keydown.enter="handleAddTask"
          @keydown.escape="showAddTask = false"
        />
        <div class="mt-2 flex gap-2">
          <UiButton size="sm" class="bg-[#478FC8] hover:bg-[#3a7bb3] text-white" @click="handleAddTask">Add</UiButton>
          <UiButton variant="ghost" size="sm" @click="showAddTask = false">Cancel</UiButton>
        </div>
      </div>
    </div>
  </div>
</template>
