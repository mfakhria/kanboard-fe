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
  auditLog: RecentActivity[]
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
    auditLog: [],
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
          this.recentActivities = weekly.recentActivities.map((a: any) => this.mapActivity(a))
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

    async fetchActivityLog(workspaceId?: string) {
      try {
        const wsId = workspaceId || useWorkspaceStore().activeWorkspace?.id
        if (!wsId) return
        const { data } = await analyticsApi.getActivityLog(wsId)
        this.auditLog = Array.isArray(data) ? data.map((activity: any) => this.mapActivity(activity)) : []
      } catch (error) {
        console.error('Failed to fetch activity log:', error)
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

    mapActivity(activity: any): RecentActivity {
      const metadata = activity.metadata ?? {}
      const action = String(activity.action ?? 'UPDATED')
      const entity = String(activity.entity ?? 'item')
      const projectName = activity.project?.name || metadata.projectName
      const taskTitle = metadata.taskTitle
      const memberName = metadata.memberName || metadata.invitedEmail || metadata.assigneeName
      const changedFields = Array.isArray(metadata.changedFields) ? metadata.changedFields : []
      const toColumnName = metadata.toColumnName
      const fromColumnName = metadata.fromColumnName
      const role = metadata.role

      let description = this.getActivityDescription({
        action,
        entity,
        taskTitle,
        projectName,
        memberName,
        changedFields,
        fromColumnName,
        toColumnName,
        role,
      })

      return {
        id: activity.id,
        type: `${entity}_${String(action).toLowerCase()}`,
        action,
        entity,
        description,
        user: {
          name: activity.user?.name ?? 'Unknown',
          avatar: activity.user?.avatar,
        },
        timestamp: activity.createdAt,
        project: activity.project
          ? {
              id: activity.project.id,
              name: activity.project.name,
              color: activity.project.color,
              icon: activity.project.icon,
            }
          : undefined,
        metadata,
      }
    },

    formatAction(action: string) {
      switch (action) {
        case 'CREATED':
          return 'Created'
        case 'UPDATED':
          return 'Updated'
        case 'DELETED':
          return 'Deleted'
        case 'MOVED':
          return 'Moved'
        case 'ASSIGNED':
          return 'Assigned'
        case 'COMMENTED':
          return 'Commented on'
        case 'COMPLETED':
          return 'Completed'
        default:
          return action
      }
    },

    getActivityDescription(params: {
      action: string
      entity: string
      taskTitle?: string
      projectName?: string
      memberName?: string
      changedFields: string[]
      fromColumnName?: string
      toColumnName?: string
      role?: string
    }) {
      const {
        action,
        entity,
        taskTitle,
        projectName,
        memberName,
        changedFields,
        fromColumnName,
        toColumnName,
        role,
      } = params

      if (entity === 'task') {
        if (action === 'CREATED' && taskTitle) {
          return `created the task "${taskTitle}"`
        }
        if (action === 'COMPLETED' && taskTitle) {
          return `completed the task "${taskTitle}"`
        }
        if (action === 'ASSIGNED' && taskTitle && memberName) {
          return `assigned "${taskTitle}" to ${memberName}`
        }
        if (action === 'MOVED' && taskTitle && fromColumnName && toColumnName) {
          return `moved "${taskTitle}" from ${fromColumnName} to ${toColumnName}`
        }
        if (action === 'UPDATED' && taskTitle) {
          const fieldLabel = this.formatChangedFields(changedFields)
          return fieldLabel
            ? `updated ${fieldLabel} for "${taskTitle}"`
            : `updated the task "${taskTitle}"`
        }
        if (action === 'DELETED' && taskTitle) {
          return `deleted the task "${taskTitle}"`
        }
      }

      if (entity === 'comment' && taskTitle) {
        return `added a comment on "${taskTitle}"`
      }

      if (entity === 'project') {
        if (action === 'CREATED' && projectName) {
          return `created the project "${projectName}"`
        }
        if (action === 'UPDATED' && projectName) {
          const fieldLabel = this.formatChangedFields(changedFields)
          return fieldLabel
            ? `updated ${fieldLabel} in "${projectName}"`
            : `updated the project "${projectName}"`
        }
        if (action === 'DELETED' && projectName) {
          return `deleted the project "${projectName}"`
        }
      }

      if (entity === 'project_member') {
        if (action === 'UPDATED' && memberName && role) {
          return `changed ${memberName}'s role to ${role}`
        }
        if (action === 'UPDATED' && memberName) {
          return `updated access for ${memberName}`
        }
        if (action === 'DELETED' && memberName) {
          return `removed ${memberName} from the project`
        }
        if (action === 'DELETED') {
          return 'removed a member from the project'
        }
      }

      if (entity === 'project_invitation') {
        if (memberName && role) {
          return `invited ${memberName} as ${role}`
        }
        if (memberName) {
          return `sent an invitation to ${memberName}`
        }
      }

      return `${this.formatAction(action).toLowerCase()} ${entity.replaceAll('_', ' ')}`
    },

    formatChangedFields(fields: string[]) {
      if (!fields.length) return ''

      const labels = fields
        .map(field => {
          switch (field) {
            case 'name':
              return 'the name'
            case 'description':
              return 'the description'
            case 'status':
              return 'the status'
            case 'visibility':
              return 'visibility'
            case 'dueDate':
              return 'the deadline'
            case 'picId':
              return 'the project owner'
            case 'color':
              return 'the color'
            case 'icon':
              return 'the icon'
            case 'title':
              return 'the title'
            case 'priority':
              return 'the priority'
            case 'completed':
              return 'the completion status'
            case 'assigneeId':
              return 'the assignee'
            default:
              return field
          }
        })
        .filter(Boolean)

      if (labels.length === 1) return labels[0] ?? ''
      if (labels.length === 2) return `${labels[0]} and ${labels[1]}`
      return `${labels.slice(0, -1).join(', ')}, and ${labels[labels.length - 1]}`
    },
  },
})
