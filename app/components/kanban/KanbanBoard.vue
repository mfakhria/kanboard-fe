<script setup lang="ts">
import { Plus } from 'lucide-vue-next'
import type { Column } from '~/features/kanban/types'

const kanbanStore = useKanbanStore()

const columns = computed(() => kanbanStore.columns)

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
const dragOverColumn = ref<string | null>(null)
const dragOverPosition = ref<number>(-1)

const handleDragStart = (taskId: string) => {
  draggedTask.value = taskId
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
  dragOverColumn.value = null
  dragOverPosition.value = -1
}

const handleDragEnd = () => {
  draggedTask.value = null
  dragOverColumn.value = null
  dragOverPosition.value = -1
}
</script>

<template>
  <div class="flex gap-5 overflow-x-auto pb-4" style="min-height: calc(100vh - 200px);">
    <!-- Kanban Columns -->
    <KanbanKanbanColumn
      v-for="column in columns"
      :key="column.id"
      :column="column"
      :drag-over-column="dragOverColumn"
      :drag-over-position="dragOverPosition"
      @drag-start="handleDragStart"
      @drag-over="handleDragOver"
      @drop="handleDrop"
      @drag-end="handleDragEnd"
    />

    <!-- Add Column -->
    <div class="flex-shrink-0 w-72">
      <div v-if="!showAddColumn">
        <button
          class="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-4 text-sm font-medium text-gray-400 dark:text-gray-500 hover:border-lime-300 dark:hover:border-lime-500 hover:text-lime-600 dark:hover:text-lime-400 transition"
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
          class="w-full rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800 px-3 py-2 text-sm dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-lime-500"
          @keydown.enter="handleAddColumn"
          @keydown.escape="showAddColumn = false"
        />
        <div class="mt-2 flex gap-2">
          <UiButton variant="success" size="sm" @click="handleAddColumn">Add</UiButton>
          <UiButton variant="ghost" size="sm" @click="showAddColumn = false">Cancel</UiButton>
        </div>
      </div>
    </div>
  </div>
</template>
