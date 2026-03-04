export interface Project {
  id: string
  name: string
  description?: string
  workspaceId: string
  status: 'running' | 'completed' | 'pending' | 'on_discuss'
  color: string
  icon: string
  dueDate?: string
  createdAt: string
  updatedAt: string
}

export interface CreateProjectPayload {
  name: string
  description?: string
  workspaceId: string
  color?: string
  dueDate?: string
}

export interface UpdateProjectPayload {
  name?: string
  description?: string
  status?: Project['status']
  color?: string
  dueDate?: string
}
