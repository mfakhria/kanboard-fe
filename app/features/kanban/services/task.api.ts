import api from '~/utils/api'
import type { Board, CreateColumnPayload, CreateTaskPayload, UpdateTaskPayload, MoveTaskPayload } from '~/features/kanban/types'

export const kanbanApi = {
  // Board
  getBoard(projectId: string) {
    return api.get<Board>('/boards', { params: { projectId } })
  },

  getBoardById(boardId: string) {
    return api.get<Board>(`/boards/${boardId}`)
  },

  // Columns
  createColumn(payload: CreateColumnPayload) {
    // Backend expects 'name' instead of 'title'
    return api.post('/columns', {
      name: payload.title,
      boardId: payload.boardId,
      position: payload.position,
      color: payload.color,
    })
  },

  updateColumn(columnId: string, data: { title?: string; color?: string }) {
    // Backend uses 'name' instead of 'title'
    const payload: Record<string, any> = {}
    if (data.title !== undefined) payload.name = data.title
    if (data.color !== undefined) payload.color = data.color
    return api.patch(`/columns/${columnId}`, payload)
  },

  deleteColumn(columnId: string) {
    return api.delete(`/columns/${columnId}`)
  },

  reorderColumns(columns: { id: string; position: number }[]) {
    return api.patch('/columns/reorder/batch', { columns })
  },

  // Tasks
  createTask(payload: CreateTaskPayload) {
    return api.post('/tasks', {
      ...payload,
      priority: payload.priority?.toUpperCase(),
    })
  },

  updateTask(taskId: string, payload: UpdateTaskPayload) {
    const body: Record<string, any> = { ...payload }
    if (body.priority) body.priority = body.priority.toUpperCase()
    return api.patch(`/tasks/${taskId}`, body)
  },

  deleteTask(taskId: string) {
    return api.delete(`/tasks/${taskId}`)
  },

  moveTask(payload: MoveTaskPayload) {
    return api.patch(`/tasks/${payload.taskId}/move`, {
      columnId: payload.targetColumnId,
      position: payload.targetPosition,
    })
  },

  assignTask(taskId: string, assigneeId: string | null) {
    return api.patch(`/tasks/${taskId}/assign`, { assigneeId })
  },

  addComment(taskId: string, content: string) {
    return api.post(`/tasks/${taskId}/comments`, { content })
  },

  listTasks(workspaceId: string) {
    return api.get('/tasks', { params: { workspaceId } })
  },
}
