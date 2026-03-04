export const useKanban = () => {
  const kanbanStore = useKanbanStore()

  const loadBoard = async (projectId: string) => {
    await kanbanStore.fetchBoard(projectId)
  }

  const addColumn = async (title: string) => {
    await kanbanStore.addColumn(title)
  }

  const addTask = async (columnId: string, title: string) => {
    await kanbanStore.addTask(columnId, { columnId, title })
  }

  const moveTask = async (taskId: string, targetColumnId: string, targetPosition: number) => {
    await kanbanStore.moveTask({ taskId, targetColumnId, targetPosition })
  }

  return {
    board: computed(() => kanbanStore.board),
    columns: computed(() => kanbanStore.columns),
    isLoading: computed(() => kanbanStore.isLoading),
    totalTasks: computed(() => kanbanStore.totalTasks),
    loadBoard,
    addColumn,
    addTask,
    moveTask,
    updateColumn: kanbanStore.updateColumn,
    deleteColumn: kanbanStore.deleteColumn,
    updateTask: kanbanStore.updateTask,
    deleteTask: kanbanStore.deleteTask,
    reorderColumns: kanbanStore.reorderColumns,
  }
}
