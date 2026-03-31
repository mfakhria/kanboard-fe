import { defineStore } from 'pinia'
import { notificationApi } from '~/features/notification/services/notification.api'
import type {
  NotificationItem,
  NotificationPreferences,
} from '~/features/notification/types'

interface NotificationState {
  items: NotificationItem[]
  preferences: NotificationPreferences | null
  isLoading: boolean
  isSavingPreferenceKey: string | null
}

export const useNotificationStore = defineStore('notification', {
  state: (): NotificationState => ({
    items: [],
    preferences: null,
    isLoading: false,
    isSavingPreferenceKey: null,
  }),

  getters: {
    unreadCount: (state) => state.items.filter(item => !item.readAt).length,
  },

  actions: {
    async fetchNotifications() {
      this.isLoading = true
      try {
        const { data } = await notificationApi.list()
        this.items = data as NotificationItem[]
      } catch (error) {
        console.error('Failed to fetch notifications:', error)
      } finally {
        this.isLoading = false
      }
    },

    async markAsRead(id: string) {
      try {
        await notificationApi.markAsRead(id)
        const item = this.items.find(entry => entry.id === id)
        if (item && !item.readAt) {
          item.readAt = new Date().toISOString()
        }
      } catch (error) {
        console.error('Failed to mark notification as read:', error)
      }
    },

    async markAllAsRead() {
      try {
        await notificationApi.markAllAsRead()
        const now = new Date().toISOString()
        this.items = this.items.map(item => ({
          ...item,
          readAt: item.readAt || now,
        }))
      } catch (error) {
        console.error('Failed to mark all notifications as read:', error)
      }
    },

    async fetchPreferences() {
      try {
        const { data } = await notificationApi.getPreferences()
        this.preferences = data as NotificationPreferences
      } catch (error) {
        console.error('Failed to fetch notification preferences:', error)
      }
    },

    async updatePreference<K extends keyof NotificationPreferences>(
      key: K,
      value: NotificationPreferences[K],
    ) {
      this.isSavingPreferenceKey = String(key)
      try {
        const { data } = await notificationApi.updatePreferences({ [key]: value } as Partial<NotificationPreferences>)
        this.preferences = data as NotificationPreferences
      } catch (error) {
        console.error('Failed to update notification preference:', error)
        throw error
      } finally {
        this.isSavingPreferenceKey = null
      }
    },
  },
})
