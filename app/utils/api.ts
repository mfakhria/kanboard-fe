import axios from 'axios'

function emitGlobalErrorAlert(message: string) {
  if (!import.meta.client) return
  window.dispatchEvent(new CustomEvent('app:error-alert', {
    detail: {
      message,
      at: Date.now(),
    },
  }))
}

function toErrorMessage(error: any): string {
  const status = error?.response?.status
  const responseMessage = error?.response?.data?.message

  if (Array.isArray(responseMessage) && responseMessage.length > 0) {
    return String(responseMessage[0])
  }

  if (typeof responseMessage === 'string' && responseMessage.trim()) {
    return responseMessage
  }

  if (!error?.response) {
    return 'Network error. Please check your connection and try again.'
  }

  if (status === 403) {
    return 'Anda tidak memiliki izin untuk melakukan aksi ini.'
  }

  if (status === 404) {
    return 'Data atau endpoint tidak ditemukan.'
  }

  if (status === 500) {
    return 'Terjadi kesalahan server. Silakan coba lagi.'
  }

  return 'Terjadi kesalahan. Silakan coba lagi.'
}

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export function setApiBaseUrl(url: string) {
  api.defaults.baseURL = url
}

// Module-level token that works on both SSR and client.
// Synced from useCookie via the api plugin (plugins/api.ts).
let _authToken: string | null = null

export function setAuthToken(token: string | null) {
  _authToken = token
}

/** Read a cookie value by name (client-side only fallback) */
function getCookie(name: string): string | null {
  if (!import.meta.client) return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1] ?? '') : null
}

// Request interceptor - attach JWT (prefers SSR-compatible _authToken, falls back to document.cookie)
api.interceptors.request.use(
  (config) => {
    const token = _authToken || getCookie('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor – unwrap {statusCode, message, data} envelope & handle 401 refresh
api.interceptors.response.use(
  (response) => {
    // Backend wraps all responses in { statusCode, message, data }
    // Unwrap so callers receive the inner `data` directly via response.data
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      response.data = response.data.data
    }
    return response
  },
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshTokenValue = getCookie('refresh_token')
        if (refreshTokenValue) {
          const { data } = await axios.post(
            `${api.defaults.baseURL}/auth/refresh`,
            { refreshToken: refreshTokenValue }
          )
          // The response from refresh is also wrapped in the envelope
          const tokens = data?.data ?? data
          // Persist new tokens via cookies
          if (import.meta.client) {
            const maxAge = 60 * 60 * 24 * 7
            document.cookie = `access_token=${encodeURIComponent(tokens.accessToken)};path=/;max-age=${maxAge};samesite=lax`
            document.cookie = `refresh_token=${encodeURIComponent(tokens.refreshToken)};path=/;max-age=${maxAge};samesite=lax`
          }
          originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`
          return api(originalRequest)
        }
      } catch {
        // Clear cookies and redirect to login
        if (import.meta.client) {
          emitGlobalErrorAlert('Sesi login berakhir. Silakan login kembali.')
          document.cookie = 'access_token=;path=/;max-age=0'
          document.cookie = 'refresh_token=;path=/;max-age=0'
          window.location.href = '/auth/login'
        }
      }
    }

    emitGlobalErrorAlert(toErrorMessage(error))

    return Promise.reject(error)
  }
)

export default api
