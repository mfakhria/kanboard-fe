import api from '~/utils/api'
import type { DashboardStats, WeeklyProductivity, ProjectProgress } from '~/features/analytics/types'

export const analyticsApi = {
  getStats() {
    return api.get<DashboardStats>('/analytics/stats')
  },

  getWeeklyProductivity() {
    return api.get<WeeklyProductivity>('/analytics/weekly')
  },

  getProjectProgress() {
    return api.get<ProjectProgress>('/analytics/progress')
  },
}
