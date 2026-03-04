import api from '~/utils/api'
import type { LoginPayload, RegisterPayload, AuthResponse } from '~/features/auth/types'

export const authApi = {
  login(payload: LoginPayload) {
    return api.post<AuthResponse>('/auth/login', payload)
  },

  register(payload: RegisterPayload) {
    return api.post<AuthResponse>('/auth/register', payload)
  },

  refresh(refreshToken: string) {
    return api.post<{ accessToken: string }>('/auth/refresh', { refreshToken })
  },

  me() {
    return api.get('/auth/me')
  },
}
