export const useKanban = () => {
  const kanbanStore = useKanbanStore()

  const loadBoard = async (projectId: string) => {
    await kanbanStore.fetchBoard(projectId)
  }

  const addColumn = (title: string) => {
    kanbanStore.addColumn(title)
  }

  const addTask = (columnId: string, title: string) => {
    kanbanStore.addTask(columnId, { columnId, title })
  }

  const moveTask = (taskId: string, targetColumnId: string, targetPosition: number) => {
    kanbanStore.moveTask({ taskId, targetColumnId, targetPosition })
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
  }
}
