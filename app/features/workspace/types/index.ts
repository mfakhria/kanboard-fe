export interface Workspace {
  id: string
  name: string
  description?: string
  ownerId: string
  members: WorkspaceMember[]
  _count?: { projects: number }
  createdAt: string
  updatedAt: string
}

export interface WorkspaceMember {
  id: string
  userId: string
  workspaceId: string
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'
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

export interface UpdateWorkspacePayload {
  name?: string
  description?: string
}

export interface InviteMemberPayload {
  email: string
  role: 'ADMIN' | 'MEMBER' | 'VIEWER'
}

export interface WorkspaceInvitation {
  id: string
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED'
  createdAt: string
  workspace: {
    id: string
    name: string
    slug: string
  }
  inviter: {
    id: string
    name: string
    email: string
    avatar?: string
  }
}

export type WorkspaceInvitationAction = 'accept' | 'decline'
