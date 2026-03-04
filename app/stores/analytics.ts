import { defineStore } from 'pinia'
import { analyticsApi } from '~/features/analytics/services/analytics.api'
import type {
  DashboardStats,
  WeeklyProductivity,
  ProjectProgress,
  RecentActivity,
  TeamMember,
  Reminder,
  TimeTracker,
} from '~/features/analytics/types'

interface AnalyticsState {
  stats: DashboardStats
  weeklyProductivity: WeeklyProductivity
  projectProgress: ProjectProgress
  recentActivities: RecentActivity[]
  teamMembers: TeamMember[]
  reminders: Reminder[]
  timeTracker: TimeTracker
  isLoading: boolean
}

export const useAnalyticsStore = defineStore('analytics', {
  state: (): AnalyticsState => ({
    stats: {
      totalProjects: 0,
      endedProjects: 0,
      runningProjects: 0,
      pendingProjects: 0,
      totalProjectsChange: 0,
      endedProjectsChange: 0,
      runningProjectsChange: 0,
    },
    weeklyProductivity: {
      labels: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
      data: [0, 0, 0, 0, 0, 0, 0],
    },
    projectProgress: {
      completed: 0,
      inProgress: 0,
      pending: 0,
      total: 0,
    },
    recentActivities: [],
    teamMembers: [],
    reminders: [],
    timeTracker: {
      isRunning: false,
      elapsed: 0,
      taskId: undefined,
      taskName: undefined,
    },
    isLoading: false,
  }),

  getters: {
    completionRate: (state) => state.projectProgress.completed,
  },

  actions: {
    async fetchAnalytics(workspaceId?: string) {
      this.isLoading = true
      try {
        const wsId = workspaceId || useWorkspaceStore().activeWorkspace?.id
        if (!wsId) return

        // Fetch workspace stats and weekly summary in parallel
        const [wsStatsRes, weeklyRes] = await Promise.all([
          analyticsApi.getWorkspaceStats(wsId),
          analyticsApi.getWeeklySummary(wsId),
        ])

        const wsStats = wsStatsRes.data as any
        const weekly = weeklyRes.data as any

        // Map backend workspace stats → dashboard stats
        this.stats = {
          totalProjects: wsStats.totalProjects ?? 0,
          endedProjects: wsStats.completedProjects ?? 0,
          runningProjects: wsStats.activeProjects ?? 0,
          pendingProjects: wsStats.archivedProjects ?? 0,
          totalProjectsChange: 0,
          endedProjectsChange: 0,
          runningProjectsChange: 0,
        }

        // Map weekly daily stats → chart data
        if (weekly.dailyStats && Array.isArray(weekly.dailyStats)) {
          const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
          this.weeklyProductivity = {
            labels: weekly.dailyStats.map((d: any) => {
              const date = new Date(d.date)
              return dayLabels[date.getDay()] ?? ''
            }),
            data: weekly.dailyStats.map((d: any) => d.completed ?? 0),
          }
        }

        // Map project progress from total workspace stats
        const total = this.stats.totalProjects || 1
        this.projectProgress = {
          completed: Math.round((this.stats.endedProjects / total) * 100),
          inProgress: Math.round((this.stats.runningProjects / total) * 100),
          pending: Math.round(((total - this.stats.endedProjects - this.stats.runningProjects) / total) * 100),
          total: 100,
        }

        // Map recent activities
        if (weekly.recentActivities && Array.isArray(weekly.recentActivities)) {
          this.recentActivities = weekly.recentActivities.map((a: any) => ({
            id: a.id,
            type: a.action?.toLowerCase() ?? 'task_created',
            description: a.description ?? `${a.action} on ${a.entityType}`,
            user: {
              name: a.user?.name ?? 'Unknown',
              avatar: a.user?.avatar,
            },
            timestamp: a.createdAt,
          }))
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
      } finally {
        this.isLoading = false
      }
    },

    async fetchProjectStats(projectId: string) {
      try {
        const { data } = await analyticsApi.getProjectStats(projectId)
        const stats = data as any
        if (stats) {
          this.projectProgress = {
            completed: stats.completionRate ?? 0,
            inProgress: Math.round(((stats.totalTasks - stats.completedTasks) / (stats.totalTasks || 1)) * 100),
            pending: Math.round((stats.overdueTasks / (stats.totalTasks || 1)) * 100),
            total: 100,
          }
        }
      } catch (error) {
        console.error('Failed to fetch project stats:', error)
      }
    },

    toggleTimeTracker() {
      this.timeTracker.isRunning = !this.timeTracker.isRunning
    },

    resetTimeTracker() {
      this.timeTracker.isRunning = false
      this.timeTracker.elapsed = 0
    },

    incrementTimer() {
      if (this.timeTracker.isRunning) {
        this.timeTracker.elapsed++
      }
    },
  },
})
