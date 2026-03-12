<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

const authStore = useAuthStore()
const router = useRouter()

const form = reactive({
  email: '',
  password: '',
})

const isLoading = ref(false)
const error = ref('')

const handleLogin = async () => {
  error.value = ''
  isLoading.value = true

  try {
    const result = await authStore.login({
      email: form.email,
      password: form.password,
    })

    if (result.success) {
      router.push('/dashboard')
    } else {
      error.value = (result.error as string) || 'Invalid email or password'
    }
  } catch (e) {
    error.value = 'Something went wrong. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div>
    <!-- Logo -->
    <div class="mb-8 text-center">
      <div class="mb-4 flex items-center justify-center">
        <img src="/kanzon.jpeg" alt="Kanzon" class="h-16 w-auto object-contain" />
      </div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Sign in to your account to continue</p>
    </div>

    <!-- Login Form -->
    <UiCard class="p-6">
      <form @submit.prevent="handleLogin" class="space-y-4">
        <!-- Error message -->
        <div v-if="error" class="rounded-lg bg-red-50 dark:bg-red-900/30 p-3 text-sm text-red-600 dark:text-red-400">
          {{ error }}
        </div>

        <!-- Email -->
        <div class="space-y-2">
          <UiLabel for="email">Email</UiLabel>
          <UiInput id="email" v-model="form.email" type="email" placeholder="name@example.com" class="h-10" />
        </div>

        <!-- Password -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <UiLabel for="password">Password</UiLabel>
            <span class="text-xs text-[#478FC8] hover:underline cursor-pointer">
              Forgot password?
            </span>
          </div>
          <UiInput id="password" v-model="form.password" type="password" placeholder="Enter your password"
            class="h-10" />
        </div>

        <!-- Submit -->
        <UiButton variant="success" class="w-full h-10" :disabled="isLoading || !form.email || !form.password"
          @click="handleLogin">
          <svg v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {{ isLoading ? 'Signing in...' : 'Sign in' }}
        </UiButton>

        <!-- Divider -->
        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <UiSeparator />
          </div>
          <div class="relative flex justify-center text-xs">
            <span class="bg-card px-2 text-gray-500 dark:text-gray-400">Or continue with</span>
          </div>
        </div>

        <!-- Social Buttons -->
        <div class="grid grid-cols-2 gap-3">
          <UiButton variant="outline" class="h-10">
            <svg class="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </UiButton>
          <UiButton variant="outline" class="h-10">
            <svg class="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            GitHub
          </UiButton>
        </div>
      </form>
    </UiCard>

    <!-- Sign up link -->
    <p class="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
      Don't have an account?
      <NuxtLink to="/auth/register" class="font-medium text-[#478FC8] hover:underline">
        Sign up
      </NuxtLink>
    </p>
  </div>
</template>
