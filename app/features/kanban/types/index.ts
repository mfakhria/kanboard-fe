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
  approvalStatus?: 'NONE' | 'IN_REVIEW' | 'CHANGES_REQUESTED' | 'APPROVED'
  reviewSubmittedAt?: string
  reviewDueDate?: string
  assignees: TaskAssignee[]
  reviewer?: TaskReviewer
  labels: TaskLabel[]
  attachments?: TaskAttachment[]
  reviews?: TaskReview[]
  commentsCount: number
  attachmentsCount: number
  createdAt: string
  updatedAt: string
}

export interface TaskLabel {
  id?: string
  name: string
  color: string
}

export interface TaskAssignee {
  id: string
  name: string
  avatar?: string
}

export interface TaskReviewer {
  id: string
  name: string
  email: string
  avatar?: string
}

export interface TaskAttachment {
  id: string
  fileName: string
  originalName: string
  mimeType: string
  size: number
  url: string
  createdAt: string
  uploader?: {
    id: string
    name: string
    email: string
    avatar?: string
  }
}

export interface TaskReview {
  id: string
  action: 'SUBMITTED' | 'APPROVED' | 'CHANGES_REQUESTED' | 'CANCELLED'
  comment?: string
  createdAt: string
  actor: TaskReviewer
  reviewer?: TaskReviewer
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
  labels?: TaskLabel[]
}

export interface UpdateTaskPayload {
  title?: string
  description?: string
  priority?: Task['priority']
  dueDate?: string
  assigneeIds?: string[]
  labels?: TaskLabel[]
}

export interface MoveTaskPayload {
  taskId: string
  targetColumnId: string
  targetPosition: number
}

export interface SubmitTaskReviewPayload {
  reviewerId?: string
  reviewDueDate?: string
  comment?: string
}

export interface DecideTaskReviewPayload {
  decision: 'APPROVED' | 'CHANGES_REQUESTED'
  comment?: string
}
