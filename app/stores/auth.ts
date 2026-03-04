import { defineStore } from 'pinia'
import type { AuthState, User, LoginPayload, RegisterPayload } from '~/features/auth/types'

// Mock user data
const mockUser: User = {
  id: '1',
  name: 'Totok Michael',
  email: 'tmichael20@mail.com',
  avatar: '/images/avatar.jpg',
  role: 'admin',
  createdAt: '2024-01-01T00:00:00Z',
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
  }),

  getters: {
    currentUser: (state) => state.user,
    isLoggedIn: (state) => state.isAuthenticated,
  },

  actions: {
    async login(payload: LoginPayload) {
      this.isLoading = true
      try {
        // Mock login - simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        this.user = mockUser
        this.accessToken = 'mock-access-token'
        this.refreshToken = 'mock-refresh-token'
        this.isAuthenticated = true

        if (import.meta.client) {
          localStorage.setItem('access_token', this.accessToken)
          localStorage.setItem('refresh_token', this.refreshToken)
        }

        return { success: true }
      } catch (error) {
        return { success: false, error }
      } finally {
        this.isLoading = false
      }
    },

    async register(payload: RegisterPayload) {
      this.isLoading = true
      try {
        // Mock register
        await new Promise(resolve => setTimeout(resolve, 1000))
        this.user = { ...mockUser, name: payload.name, email: payload.email }
        this.accessToken = 'mock-access-token'
        this.refreshToken = 'mock-refresh-token'
        this.isAuthenticated = true

        if (import.meta.client) {
          localStorage.setItem('access_token', this.accessToken)
          localStorage.setItem('refresh_token', this.refreshToken)
        }

        return { success: true }
      } catch (error) {
        return { success: false, error }
      } finally {
        this.isLoading = false
      }
    },

    async logout() {
      this.user = null
      this.accessToken = null
      this.refreshToken = null
      this.isAuthenticated = false

      if (import.meta.client) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
      }
    },

    async initAuth() {
      if (import.meta.client) {
        const token = localStorage.getItem('access_token')
        if (token) {
          this.accessToken = token
          this.refreshToken = localStorage.getItem('refresh_token')
          this.user = mockUser
          this.isAuthenticated = true
        }
      }
    },
  },
})
