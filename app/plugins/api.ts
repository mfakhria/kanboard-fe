import { setAuthToken } from '~/utils/api'

export default defineNuxtPlugin(() => {
  // useCookie works on both SSR (reads from request headers) and client (reads document.cookie)
  const accessToken = useCookie<string | null>('access_token')

  // Sync initial value
  setAuthToken(accessToken.value ?? null)

  // Keep in sync when cookie changes (client-side navigation, login, logout, refresh)
  watch(accessToken, (token) => {
    setAuthToken(token ?? null)
  })
})
