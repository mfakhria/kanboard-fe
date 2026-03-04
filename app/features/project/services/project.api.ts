import api from '~/utils/api'
import type { Project, CreateProjectPayload, UpdateProjectPayload } from '~/features/project/types'

export const projectApi = {
  list(workspaceId: string) {
    return api.get<Project[]>(`/workspaces/${workspaceId}/projects`)
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
}
