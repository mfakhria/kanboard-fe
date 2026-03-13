import { setAuthToken, setApiBaseUrl } from '~/utils/api'

export default defineNuxtPlugin(() => {
  // Sync API base URL from runtimeConfig
  const config = useRuntimeConfig()
  if (config.public.apiBaseUrl) {
    setApiBaseUrl(config.public.apiBaseUrl as string)
  }

  // useCookie works on both SSR (reads from request headers) and client (reads document.cookie)
  const accessToken = useCookie<string | null>('access_token')

  // Sync initial value
  setAuthToken(accessToken.value ?? null)

  // Keep in sync when cookie changes (client-side navigation, login, logout, refresh)
  watch(accessToken, (token) => {
    setAuthToken(token ?? null)
  })
})
