import api from '~/utils/api'
import type {
  Board,
  CreateColumnPayload,
  CreateTaskPayload,
  UpdateTaskPayload,
  MoveTaskPayload,
  SubmitTaskReviewPayload,
  DecideTaskReviewPayload,
} from '~/features/kanban/types'

export const kanbanApi = {
  // Board
  getBoard(projectId: string) {
    return api.get<Board>('/boards', { params: { projectId } })
  },

  getBoardById(boardId: string) {
    return api.get<Board>(`/boards/${boardId}`)
  },

  getTask(taskId: string) {
    return api.get(`/tasks/${taskId}`)
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
      labels: payload.labels?.map(label => ({
        name: label.name,
        color: label.color,
      })),
    })
  },

  updateTask(taskId: string, payload: UpdateTaskPayload) {
    const body: Record<string, any> = { ...payload }
    if (body.priority) body.priority = body.priority.toUpperCase()
    if (body.labels) {
      body.labels = body.labels.map((label: { name: string; color: string }) => ({
        name: label.name,
        color: label.color,
      }))
    }
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

  submitTaskReview(taskId: string, payload: SubmitTaskReviewPayload) {
    return api.post(`/tasks/${taskId}/review/submit`, payload)
  },

  decideTaskReview(taskId: string, payload: DecideTaskReviewPayload) {
    return api.post(`/tasks/${taskId}/review/decision`, payload)
  },

  cancelTaskReview(taskId: string) {
    return api.post(`/tasks/${taskId}/review/cancel`)
  },

  uploadAttachment(taskId: string, file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/tasks/${taskId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  deleteAttachment(taskId: string, attachmentId: string) {
    return api.delete(`/tasks/${taskId}/attachments/${attachmentId}`)
  },

  listTasks(workspaceId: string) {
    return api.get('/tasks', { params: { workspaceId } })
  },
}
