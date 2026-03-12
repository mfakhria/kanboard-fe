import api from '~/utils/api'

export const analyticsApi = {
  getWorkspaceStats(workspaceId: string) {
    return api.get(`/analytics/workspace/${workspaceId}`)
  },

  getProjectStats(projectId: string) {
    return api.get(`/analytics/project/${projectId}`)
  },

  getWeeklySummary(workspaceId: string) {
    return api.get('/analytics/weekly', { params: { workspaceId } })
  },

  getOverviewStats(workspaceId: string) {
    return api.get(`/analytics/overview/${workspaceId}`)
  },
}
