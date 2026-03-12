import api from '~/utils/api'
import type { Project, CreateProjectPayload, UpdateProjectPayload, InviteToProjectPayload, ProjectMember, ProjectInvitation } from '~/features/project/types'

export const projectApi = {
  list(workspaceId: string) {
    return api.get<Project[]>('/projects', { params: { workspaceId } })
  },

  get(id: string) {
    return api.get<Project>(`/projects/${id}`)
  },

  create(payload: CreateProjectPayload) {
    return api.post<Project>('/projects', payload)
  },

  update(id: string, payload: UpdateProjectPayload) {
    return api.patch<Project>(`/projects/${id}`, payload)
  },

  delete(id: string) {
    return api.delete(`/projects/${id}`)
  },

  // ─── Members & Invitations ───────────────────────────────────────────

  invite(projectId: string, payload: InviteToProjectPayload) {
    return api.post<ProjectInvitation>(`/projects/${projectId}/invite`, payload)
  },

  getMembers(projectId: string) {
    return api.get<ProjectMember[]>(`/projects/${projectId}/members`)
  },

  getInvitations(projectId: string) {
    return api.get<ProjectInvitation[]>(`/projects/${projectId}/invitations`)
  },

  updateMemberRole(projectId: string, memberId: string, role: string) {
    return api.patch<ProjectMember>(`/projects/${projectId}/members/${memberId}`, { role })
  },

  removeMember(projectId: string, memberId: string) {
    return api.delete(`/projects/${projectId}/members/${memberId}`)
  },

  cancelInvitation(projectId: string, invitationId: string) {
    return api.delete(`/projects/${projectId}/invitations/${invitationId}`)
  },

  getPendingInvitations() {
    return api.get<ProjectInvitation[]>('/projects/invitations/pending')
  },

  acceptInvitation(token: string) {
    return api.post('/projects/invitations/accept', { token })
  },

  declineInvitation(token: string) {
    return api.post('/projects/invitations/decline', { token })
  },
}
