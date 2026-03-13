import api from '~/utils/api'
import type { Workspace, CreateWorkspacePayload, InviteMemberPayload } from '~/features/workspace/types'

export const workspaceApi = {
  list() {
    return api.get<Workspace[]>('/workspaces')
  },

  get(id: string) {
    return api.get<Workspace>(`/workspaces/${id}`)
  },

  create(payload: CreateWorkspacePayload) {
    return api.post<Workspace>('/workspaces', payload)
  },

  delete(id: string) {
    return api.delete(`/workspaces/${id}`)
  },

  inviteMember(workspaceId: string, payload: InviteMemberPayload) {
    return api.post(`/workspaces/${workspaceId}/members`, payload)
  },

  removeMember(workspaceId: string, memberId: string) {
    return api.delete(`/workspaces/${workspaceId}/members/${memberId}`)
  },

  assignRole(workspaceId: string, memberId: string, role: string) {
    return api.patch(`/workspaces/${workspaceId}/members/${memberId}/role`, { role })
  },
}
