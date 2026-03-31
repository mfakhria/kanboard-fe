import api from '~/utils/api'
import type {
  NotificationItem,
  NotificationPreferences,
  NotificationUnreadCount,
} from '~/features/notification/types'

export const notificationApi = {
  list() {
    return api.get<NotificationItem[]>('/notifications')
  },

  getUnreadCount() {
    return api.get<NotificationUnreadCount>('/notifications/unread-count')
  },

  markAsRead(id: string) {
    return api.patch(`/notifications/${id}/read`)
  },

  markAllAsRead() {
    return api.patch('/notifications/read-all')
  },

  getPreferences() {
    return api.get<NotificationPreferences>('/notifications/preferences')
  },

  updatePreferences(payload: Partial<NotificationPreferences>) {
    return api.patch<NotificationPreferences>('/notifications/preferences', payload)
  },
}
