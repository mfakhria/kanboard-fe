<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

const authStore = useAuthStore()
const router = useRouter()

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const isLoading = ref(false)
const error = ref('')

const handleRegister = async () => {
  error.value = ''

  if (form.password !== form.confirmPassword) {
    error.value = 'Passwords do not match'
    return
  }

  if (form.password.length < 6) {
    error.value = 'Password must be at least 6 characters'
    return
  }

  isLoading.value = true

  try {
    const result = await authStore.register({
      name: form.name,
      email: form.email,
      password: form.password,
    })

    if (result.success) {
      router.push('/dashboard')
    } else {
      error.value = (result.error as string) || 'Registration failed. Please try again.'
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
      <div class="mb-4 flex items-center justify-center gap-2">
        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-lime-500">
          <svg viewBox="0 0 24 24" class="h-6 w-6 text-gray-900" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M9 12l2 2 4-4" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="12" r="10"/>
          </svg>
        </div>
        <span class="text-2xl font-bold text-gray-900 dark:text-white">Kanboard</span>
      </div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Create an account</h1>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Start managing your tasks today</p>
    </div>

    <!-- Register Form -->
    <UiCard class="p-6">
      <form @submit.prevent="handleRegister" class="space-y-4">
        <div v-if="error" class="rounded-lg bg-red-50 dark:bg-red-900/30 p-3 text-sm text-red-600 dark:text-red-400">
          {{ error }}
        </div>

        <div class="space-y-2">
          <UiLabel for="name">Full Name</UiLabel>
          <UiInput
            id="name"
            v-model="form.name"
            type="text"
            placeholder="John Doe"
            class="h-10"
          />
        </div>

        <div class="space-y-2">
          <UiLabel for="email">Email</UiLabel>
          <UiInput
            id="email"
            v-model="form.email"
            type="email"
            placeholder="name@example.com"
            class="h-10"
          />
        </div>

        <div class="space-y-2">
          <UiLabel for="password">Password</UiLabel>
          <UiInput
            id="password"
            v-model="form.password"
            type="password"
            placeholder="Create a password"
            class="h-10"
          />
        </div>

        <div class="space-y-2">
          <UiLabel for="confirmPassword">Confirm Password</UiLabel>
          <UiInput
            id="confirmPassword"
            v-model="form.confirmPassword"
            type="password"
            placeholder="Confirm your password"
            class="h-10"
          />
        </div>

        <UiButton
          variant="success"
          class="w-full h-10"
          :disabled="isLoading || !form.name || !form.email || !form.password || !form.confirmPassword"
          @click="handleRegister"
        >
          <svg v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          {{ isLoading ? 'Creating account...' : 'Create account' }}
        </UiButton>
      </form>
    </UiCard>

    <p class="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
      Already have an account?
      <NuxtLink to="/auth/login" class="font-medium text-lime-600 dark:text-lime-400 hover:underline">
        Sign in
      </NuxtLink>
    </p>
  </div>
</template>
