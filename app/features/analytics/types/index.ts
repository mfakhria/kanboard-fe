export interface DashboardStats {
  totalProjects: number
  endedProjects: number
  runningProjects: number
  pendingProjects: number
  totalProjectsChange: number
  endedProjectsChange: number
  runningProjectsChange: number
}

export interface WeeklyProductivity {
  labels: string[]
  data: number[]
}

export interface ProjectProgress {
  completed: number
  inProgress: number
  pending: number
  total: number
}

export interface RecentActivity {
  id: string
  type: 'task_created' | 'task_completed' | 'task_moved' | 'comment_added' | 'member_added'
  description: string
  user: {
    name: string
    avatar?: string
  }
  timestamp: string
}

export interface TeamMember {
  id: string
  name: string
  avatar?: string
  task: string
  status: 'completed' | 'in_progress' | 'pending'
}

export interface Reminder {
  id: string
  title: string
  time: string
  type: 'meeting' | 'deadline' | 'review'
}

export interface ProjectListItem {
  id: string
  name: string
  icon: string
  color: string
  dueDate: string
}

export interface TimeTracker {
  isRunning: boolean
  elapsed: number
  taskId?: string
  taskName?: string
}
