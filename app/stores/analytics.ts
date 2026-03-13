import { defineStore } from 'pinia'
import { analyticsApi } from '~/features/analytics/services/analytics.api'
import { kanbanApi } from '~/features/kanban/services/task.api'
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
  overviewStats: {
    taskStats: { total: number; completed: number; inProgress: number; overdue: number }
    taskDistribution: { label: string; count: number; percentage: number }[]
    tasksByPriority: { priority: string; count: number }[]
    weeklyTrend: { weekLabel: string; completed: number; created: number; overdue: number }[]
  } | null
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
    overviewStats: null,
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

        // Fetch workspace stats, weekly summary, and tasks in parallel
        const [wsStatsRes, weeklyRes, tasksRes] = await Promise.all([
          analyticsApi.getWorkspaceStats(wsId),
          analyticsApi.getWeeklySummary(wsId),
          kanbanApi.listTasks(wsId),
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

        // Build team members from real tasks (group by assignee, show latest task)
        const tasks = (tasksRes.data ?? []) as any[]
        const assigneeMap = new Map<string, { name: string; avatar?: string; task: string; status: 'completed' | 'in_progress' | 'pending' }>()
        for (const t of tasks) {
          if (!t.assignee) continue
          const uid = t.assignee.id
          if (!assigneeMap.has(uid)) {
            const colName = t.column?.name?.toLowerCase() ?? ''
            let status: 'completed' | 'in_progress' | 'pending' = 'pending'
            if (t.completed) status = 'completed'
            else if (colName.includes('progress') || colName.includes('review')) status = 'in_progress'
            assigneeMap.set(uid, {
              name: t.assignee.name,
              avatar: t.assignee.avatar,
              task: t.title,
              status,
            })
          }
        }
        this.teamMembers = Array.from(assigneeMap.entries()).slice(0, 5).map(([id, m]) => ({
          id,
          name: m.name,
          avatar: m.avatar,
          task: m.task,
          status: m.status,
        }))

        // Build reminders from upcoming task deadlines
        const now = new Date()
        const upcoming = tasks
          .filter((t: any) => t.dueDate && !t.completed && new Date(t.dueDate) >= now)
          .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
          .slice(0, 5)
        this.reminders = upcoming.map((t: any) => {
          const due = new Date(t.dueDate)
          const diffMs = due.getTime() - now.getTime()
          const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
          let timeLabel: string
          if (diffDays === 0) timeLabel = 'Today'
          else if (diffDays === 1) timeLabel = 'Tomorrow'
          else timeLabel = `${diffDays} days left`
          return {
            id: t.id,
            title: t.title,
            time: `${due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — ${timeLabel}`,
            type: 'deadline' as const,
          }
        })
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

    async fetchOverviewStats(workspaceId?: string) {
      try {
        const wsId = workspaceId || useWorkspaceStore().activeWorkspace?.id
        if (!wsId) return
        const { data } = await analyticsApi.getOverviewStats(wsId)
        this.overviewStats = data as any
      } catch (error) {
        console.error('Failed to fetch overview stats:', error)
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
