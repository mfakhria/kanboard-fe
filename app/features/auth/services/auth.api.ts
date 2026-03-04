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
    return api.post<AuthResponse>('/auth/refresh', { refreshToken })
  },

  getProfile() {
    return api.get<AuthResponse['user']>('/auth/profile')
  },
}
