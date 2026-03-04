export interface Board {
  id: string
  projectId: string
  name: string
  columns: Column[]
}

export interface Column {
  id: string
  boardId: string
  title: string
  position: number
  color?: string
  tasks: Task[]
}

export interface Task {
  id: string
  columnId: string
  title: string
  description?: string
  position: number
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'todo' | 'in_progress' | 'review' | 'done'
  dueDate?: string
  assignees: TaskAssignee[]
  labels: string[]
  commentsCount: number
  attachmentsCount: number
  createdAt: string
  updatedAt: string
}

export interface TaskAssignee {
  id: string
  name: string
  avatar?: string
}

export interface CreateColumnPayload {
  boardId: string
  title: string
  position?: number
  color?: string
}

export interface CreateTaskPayload {
  columnId: string
  title: string
  description?: string
  priority?: Task['priority']
  dueDate?: string
  assigneeIds?: string[]
  labels?: string[]
}

export interface UpdateTaskPayload {
  title?: string
  description?: string
  priority?: Task['priority']
  dueDate?: string
  assigneeIds?: string[]
  labels?: string[]
}

export interface MoveTaskPayload {
  taskId: string
  targetColumnId: string
  targetPosition: number
}
