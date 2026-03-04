import api from '~/utils/api'
import type { Board, CreateColumnPayload, CreateTaskPayload, UpdateTaskPayload, MoveTaskPayload } from '~/features/kanban/types'

export const kanbanApi = {
  getBoard(projectId: string) {
    return api.get<Board>(`/projects/${projectId}/board`)
  },

  createColumn(payload: CreateColumnPayload) {
    return api.post(`/boards/${payload.boardId}/columns`, payload)
  },

  updateColumn(columnId: string, data: { title?: string; position?: number }) {
    return api.patch(`/columns/${columnId}`, data)
  },

  deleteColumn(columnId: string) {
    return api.delete(`/columns/${columnId}`)
  },

  createTask(payload: CreateTaskPayload) {
    return api.post(`/columns/${payload.columnId}/tasks`, payload)
  },

  updateTask(taskId: string, payload: UpdateTaskPayload) {
    return api.patch(`/tasks/${taskId}`, payload)
  },

  deleteTask(taskId: string) {
    return api.delete(`/tasks/${taskId}`)
  },

  moveTask(payload: MoveTaskPayload) {
    return api.post(`/tasks/${payload.taskId}/move`, {
      targetColumnId: payload.targetColumnId,
      targetPosition: payload.targetPosition,
    })
  },
}
