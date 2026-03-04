export interface Workspace {
  id: string
  name: string
  description?: string
  ownerId: string
  members: WorkspaceMember[]
  createdAt: string
  updatedAt: string
}

export interface WorkspaceMember {
  id: string
  userId: string
  workspaceId: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
  user: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  joinedAt: string
}

export interface CreateWorkspacePayload {
  name: string
  description?: string
}

export interface InviteMemberPayload {
  email: string
  role: 'admin' | 'member' | 'viewer'
}
