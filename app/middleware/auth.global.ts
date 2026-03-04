export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore()

  // Pages that don't require authentication
  const publicPages = ['/auth/login', '/auth/register', '/auth/forgot-password']
  const isPublicPage = publicPages.includes(to.path)

  // Initialize user object from cookie token (works on both SSR and client)
  await authStore.initAuth()

  // Redirect authenticated users away from auth pages
  if (isPublicPage && authStore.isAuthenticated) {
    return navigateTo('/dashboard')
  }

  // Redirect unauthenticated users to login
  if (!isPublicPage && !authStore.isAuthenticated && to.path !== '/') {
    return navigateTo('/auth/login')
  }
})
