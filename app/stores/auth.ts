import { defineStore } from 'pinia'
import { authApi } from '~/features/auth/services/auth.api'
import type { User, LoginPayload, RegisterPayload } from '~/features/auth/types'

export const useAuthStore = defineStore('auth', () => {
  // Use cookies instead of localStorage so SSR middleware can read auth state
  const accessToken = useCookie<string | null>('access_token', {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
    sameSite: 'lax',
  })
  const refreshToken = useCookie<string | null>('refresh_token', {
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
    sameSite: 'lax',
  })

  const user = ref<User | null>(null)
  const isLoading = ref(false)

  // Reactive: true whenever the cookie token exists
  const isAuthenticated = computed(() => !!accessToken.value)
  const currentUser = computed(() => user.value)
  const isLoggedIn = computed(() => isAuthenticated.value)

  /** Restore user object from token (works on both SSR and client) */
  async function initAuth() {
    if (accessToken.value && !user.value) {
      try {
        const { data } = await authApi.getProfile()
        user.value = data as User
      } catch {
        // Token invalid – clear
        accessToken.value = null
        refreshToken.value = null
      }
    }
  }

  async function login(payload: LoginPayload) {
    isLoading.value = true
    try {
      const { data } = await authApi.login(payload)
      const res = data as any
      user.value = res.user
      accessToken.value = res.accessToken
      refreshToken.value = res.refreshToken

      return { success: true }
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Invalid email or password'
      return { success: false, error: message }
    } finally {
      isLoading.value = false
    }
  }

  async function register(payload: RegisterPayload) {
    isLoading.value = true
    try {
      const { data } = await authApi.register(payload)
      const res = data as any
      user.value = res.user
      accessToken.value = res.accessToken
      refreshToken.value = res.refreshToken

      return { success: true }
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Registration failed'
      return { success: false, error: message }
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    user.value = null
    accessToken.value = null
    refreshToken.value = null

    // Clear all other stores to prevent data leaking between users
    try {
      useProjectStore().$reset()
      useWorkspaceStore().$reset()
      useKanbanStore().$reset()
      useAnalyticsStore().$reset()
    } catch {
      // Stores may not be initialized yet
    }
  }

  return {
    user,
    accessToken,
    refreshToken,
    isLoading,
    isAuthenticated,
    currentUser,
    isLoggedIn,
    initAuth,
    login,
    register,
    logout,
  }
})
