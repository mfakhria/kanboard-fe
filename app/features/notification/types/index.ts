export type NotificationType =
  | 'WORKSPACE_INVITATION'
  | 'PROJECT_INVITATION'
  | 'TASK_ASSIGNED'
  | 'GENERAL'

export interface NotificationActor {
  id: string
  name: string
  email: string
  avatar?: string
}

export interface NotificationItem {
  id: string
  type: NotificationType
  title: string
  message: string
  metadata?: Record<string, any> | null
  readAt?: string | null
  createdAt: string
  updatedAt: string
  actor?: NotificationActor | null
}

export interface NotificationPreferences {
  id: string
  emailEnabled: boolean
  pushEnabled: boolean
  taskAssigned: boolean
  taskCompleted: boolean
  taskOverdue: boolean
  projectUpdates: boolean
  teamActivity: boolean
  weeklyDigest: boolean
  createdAt: string
  updatedAt: string
  userId: string
}

export interface NotificationUnreadCount {
  unreadCount: number
}
