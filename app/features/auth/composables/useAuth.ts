export const useAuth = () => {
  const authStore = useAuthStore()
  const router = useRouter()

  const login = async (email: string, password: string) => {
    const result = await authStore.login({ email, password })
    if (result.success) {
      await router.push('/dashboard')
    }
    return result
  }

  const register = async (name: string, email: string, password: string) => {
    const result = await authStore.register({ name, email, password })
    if (result.success) {
      await router.push('/dashboard')
    }
    return result
  }

  const logout = async () => {
    await authStore.logout()
    await router.push('/auth/login')
  }

  return {
    user: computed(() => authStore.currentUser),
    isAuthenticated: computed(() => authStore.isLoggedIn),
    isLoading: computed(() => authStore.isLoading),
    login,
    register,
    logout,
  }
}
