export interface Project {
  id: string
  name: string
  description?: string
  workspaceId: string
  status: 'ACTIVE' | 'ARCHIVED' | 'COMPLETED'
  visibility?: 'PRIVATE' | 'PUBLIC'
  color?: string
  icon?: string
  dueDate?: string
  picId?: string
  pic?: { id: string; name: string; email: string; avatar?: string }
  totalTasks?: number
  completedTasks?: number
  myRole?: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER' | null
  members?: ProjectMember[]
  createdAt: string
  updatedAt: string
}

export interface ProjectMember {
  id: string
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'
  joinedAt: string
  userId: string
  projectId: string
  user: { id: string; name: string; email: string; avatar?: string }
}

export interface ProjectInvitation {
  id: string
  email: string
  token: string
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED'
  expiresAt: string
  createdAt: string
  project: { id: string; name: string; icon?: string; color?: string }
  inviter: { id: string; name: string; email: string; avatar?: string }
}

export interface CreateProjectPayload {
  name: string
  description?: string
  workspaceId: string
  color?: string
  icon?: string
  dueDate?: string
  picId?: string
  visibility?: 'PUBLIC' | 'PRIVATE'
}

export interface UpdateProjectPayload {
  name?: string
  description?: string
  status?: Project['status']
  visibility?: 'PUBLIC' | 'PRIVATE'
  color?: string
  icon?: string
  dueDate?: string
  picId?: string
}

export interface InviteToProjectPayload {
  email: string
  role?: 'ADMIN' | 'MEMBER' | 'VIEWER'
}
