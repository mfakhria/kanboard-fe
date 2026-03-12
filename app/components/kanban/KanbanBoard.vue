<script setup lang="ts">
import { Plus, Search } from 'lucide-vue-next'
import type { Column } from '~/features/kanban/types'

const kanbanStore = useKanbanStore()

const columns = computed(() => kanbanStore.columns)
const searchQuery = ref('')

const showAddColumn = ref(false)
const newColumnTitle = ref('')

const handleAddColumn = () => {
  if (newColumnTitle.value.trim()) {
    kanbanStore.addColumn(newColumnTitle.value.trim())
    newColumnTitle.value = ''
    showAddColumn.value = false
  }
}

// Drag state
const draggedTask = ref<string | null>(null)
const dragSourceColumnId = ref<string | null>(null)
const dragOverColumn = ref<string | null>(null)
const dragOverPosition = ref<number>(-1)

const handleDragStart = (taskId: string, sourceColumnId: string) => {
  draggedTask.value = taskId
  dragSourceColumnId.value = sourceColumnId
}

const handleDragOver = (e: DragEvent, columnId: string, position: number) => {
  e.preventDefault()
  dragOverColumn.value = columnId
  dragOverPosition.value = position
}

const handleDrop = (columnId: string, position: number) => {
  if (draggedTask.value) {
    kanbanStore.moveTask({
      taskId: draggedTask.value,
      targetColumnId: columnId,
      targetPosition: position,
    })
  }
  draggedTask.value = null
  dragSourceColumnId.value = null
  dragOverColumn.value = null
  dragOverPosition.value = -1
}

const handleDragEnd = () => {
  draggedTask.value = null
  dragSourceColumnId.value = null
  dragOverColumn.value = null
  dragOverPosition.value = -1
}
</script>

<template>
  <div>
    <!-- Board Header -->
    <div class="flex items-center justify-between mb-5">
      <h2 class="text-base font-semibold text-gray-800 dark:text-gray-200">Projects List</h2>
      <div class="flex items-center gap-3">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search here"
            class="h-9 w-48 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 pl-9 pr-3 text-sm text-gray-700 dark:text-gray-300 placeholder:text-gray-400 focus:border-[#478FC8] focus:outline-none focus:ring-1 focus:ring-[#478FC8]"
          />
        </div>
      </div>
    </div>

    <!-- Kanban Columns -->
    <div class="flex gap-5 overflow-x-auto pb-4" style="min-height: calc(100vh - 300px);">
      <KanbanColumn
        v-for="column in columns"
        :key="column.id"
        :column="column"
        :search-query="searchQuery"
        :drag-over-column="dragOverColumn"
        :drag-over-position="dragOverPosition"
        :dragged-task-id="draggedTask"
        @drag-start="handleDragStart"
        @drag-over="handleDragOver"
        @drop="handleDrop"
        @drag-end="handleDragEnd"
      />

      <!-- Add Column -->
      <div class="flex-shrink-0 w-[280px]">
        <div v-if="!showAddColumn">
          <button
            class="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-4 text-sm font-medium text-gray-400 dark:text-gray-500 hover:border-[#478FC8] dark:hover:border-[#478FC8] hover:text-[#478FC8] transition"
            @click="showAddColumn = true"
          >
            <Plus class="h-4 w-4" />
            Add Column
          </button>
        </div>
        <div v-else class="rounded-xl border dark:border-gray-700 bg-white dark:bg-gray-900 p-4 shadow-sm">
          <input
            v-model="newColumnTitle"
            type="text"
            placeholder="Column title..."
            class="w-full rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800 px-3 py-2 text-sm dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#478FC8]"
            @keydown.enter="handleAddColumn"
            @keydown.escape="showAddColumn = false"
          />
          <div class="mt-2 flex gap-2">
            <UiButton size="sm" class="bg-[#478FC8] hover:bg-[#3a7bb3] text-white" @click="handleAddColumn">Add</UiButton>
            <UiButton variant="ghost" size="sm" @click="showAddColumn = false">Cancel</UiButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
