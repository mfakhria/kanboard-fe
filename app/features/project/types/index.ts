export interface Project {
  id: string
  name: string
  description?: string
  workspaceId: string
  status: 'ACTIVE' | 'ARCHIVED' | 'COMPLETED'
  color?: string
  icon?: string
  dueDate?: string
  picId?: string
  pic?: { id: string; name: string; email: string; avatar?: string }
  createdAt: string
  updatedAt: string
}

export interface CreateProjectPayload {
  name: string
  description?: string
  workspaceId: string
  color?: string
  dueDate?: string
  picId?: string
}

export interface UpdateProjectPayload {
  name?: string
  description?: string
  status?: Project['status']
  color?: string
  dueDate?: string
  picId?: string
}
