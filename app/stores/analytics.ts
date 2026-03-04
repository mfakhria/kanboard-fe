import { defineStore } from 'pinia'
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
      totalProjects: 24,
      endedProjects: 10,
      runningProjects: 12,
      pendingProjects: 2,
      totalProjectsChange: 12,
      endedProjectsChange: 8,
      runningProjectsChange: 5,
    },
    weeklyProductivity: {
      labels: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
      data: [20, 45, 60, 78, 55, 40, 30],
    },
    projectProgress: {
      completed: 41,
      inProgress: 35,
      pending: 24,
      total: 100,
    },
    recentActivities: [
      {
        id: '1',
        type: 'task_completed',
        description: 'Completed "Github Project Repository"',
        user: { name: 'Alexandra Deff' },
        timestamp: '2024-11-20T10:30:00Z',
      },
      {
        id: '2',
        type: 'task_moved',
        description: 'Moved "API Endpoints" to In Progress',
        user: { name: 'Edwin Adenike' },
        timestamp: '2024-11-20T09:15:00Z',
      },
      {
        id: '3',
        type: 'comment_added',
        description: 'Added comment on "Search and Filter"',
        user: { name: 'Isaac Oluwatemilorun' },
        timestamp: '2024-11-20T08:45:00Z',
      },
    ],
    teamMembers: [
      {
        id: '1',
        name: 'Alexandra Deff',
        avatar: '',
        task: 'Github Project Repository',
        status: 'completed',
      },
      {
        id: '2',
        name: 'Edwin Adenike',
        avatar: '',
        task: 'Integrate User Authentication System',
        status: 'in_progress',
      },
      {
        id: '3',
        name: 'Isaac Oluwatemilorun',
        avatar: '',
        task: 'Develop Search and Filter Functionality',
        status: 'pending',
      },
      {
        id: '4',
        name: 'David Oshodi',
        avatar: '',
        task: 'Responsive Layout for Homepage',
        status: 'in_progress',
      },
    ],
    reminders: [
      {
        id: '1',
        title: 'Meeting with Arc Company',
        time: '02.00 pm - 04.00 pm',
        type: 'meeting',
      },
    ],
    timeTracker: {
      isRunning: true,
      elapsed: 5048, // seconds (01:24:08)
      taskId: 'task-4',
      taskName: 'API endpoint development',
    },
    isLoading: false,
  }),

  getters: {
    completionRate: (state) => state.projectProgress.completed,
  },

  actions: {
    async fetchAnalytics() {
      this.isLoading = true
      try {
        await new Promise(resolve => setTimeout(resolve, 500))
        // Data already in state as mock
      } finally {
        this.isLoading = false
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
