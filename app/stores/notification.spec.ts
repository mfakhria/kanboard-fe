import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import type { NotificationItem, NotificationPreferences } from '~/features/notification/types'

const notificationApiMocks = vi.hoisted(() => ({
  listMock: vi.fn(),
  markAsReadMock: vi.fn(),
  markAllAsReadMock: vi.fn(),
  getPreferencesMock: vi.fn(),
  updatePreferencesMock: vi.fn(),
}))

vi.mock('~/features/notification/services/notification.api', () => ({
  notificationApi: {
    list: notificationApiMocks.listMock,
    markAsRead: notificationApiMocks.markAsReadMock,
    markAllAsRead: notificationApiMocks.markAllAsReadMock,
    getPreferences: notificationApiMocks.getPreferencesMock,
    updatePreferences: notificationApiMocks.updatePreferencesMock,
  },
}))

import { useNotificationStore } from './notification'

describe('useNotificationStore', () => {
  const baseNotification: NotificationItem = {
    id: 'notif-1',
    type: 'GENERAL',
    title: 'Welcome',
    message: 'Hello',
    readAt: null,
    createdAt: '2026-03-31T10:00:00.000Z',
    updatedAt: '2026-03-31T10:00:00.000Z',
    actor: null,
  }

  const basePreferences: NotificationPreferences = {
    id: 'pref-1',
    emailEnabled: true,
    pushEnabled: true,
    taskAssigned: true,
    taskCompleted: true,
    taskOverdue: false,
    projectUpdates: true,
    teamActivity: false,
    weeklyDigest: true,
    createdAt: '2026-03-31T10:00:00.000Z',
    updatedAt: '2026-03-31T10:00:00.000Z',
    userId: 'user-1',
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('fetches notifications and updates unread count', async () => {
    notificationApiMocks.listMock.mockResolvedValue({
      data: [
        baseNotification,
        { ...baseNotification, id: 'notif-2', readAt: '2026-03-31T10:05:00.000Z' },
      ],
    })

    const store = useNotificationStore()
    await store.fetchNotifications()

    expect(store.items).toHaveLength(2)
    expect(store.unreadCount).toBe(1)
    expect(store.isLoading).toBe(false)
  })

  it('marks all notifications as read locally after successful API call', async () => {
    notificationApiMocks.markAllAsReadMock.mockResolvedValue({})

    const store = useNotificationStore()
    store.items = [
      baseNotification,
      { ...baseNotification, id: 'notif-2', readAt: '2026-03-31T10:05:00.000Z' },
    ]

    await store.markAllAsRead()

    expect(notificationApiMocks.markAllAsReadMock).toHaveBeenCalled()
    expect(store.items.every(item => item.readAt)).toBe(true)
    expect(store.unreadCount).toBe(0)
  })

  it('updates preferences and clears saving state', async () => {
    notificationApiMocks.updatePreferencesMock.mockResolvedValue({
      data: {
        ...basePreferences,
        weeklyDigest: false,
      },
    })

    const store = useNotificationStore()

    await store.updatePreference('weeklyDigest', false)

    expect(notificationApiMocks.updatePreferencesMock).toHaveBeenCalledWith({ weeklyDigest: false })
    expect(store.preferences?.weeklyDigest).toBe(false)
    expect(store.isSavingPreferenceKey).toBe(null)
  })
})
