<script setup lang="ts">
import { Eye, EyeOff, Mail, Lock, UserPlus, User } from 'lucide-vue-next'

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

const showPassword = ref(false)
const showConfirmPassword = ref(false)
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
  } catch {
    error.value = 'Something went wrong. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <!-- Floating icon pill -->
  <div
    class="flex items-center justify-center rounded-2xl shadow-lg mb-5"
    style="width: 56px; height: 56px; background: rgba(255,255,255,0.92); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.8); box-shadow: 0 8px 32px rgba(71,143,200,0.20), 0 2px 8px rgba(0,0,0,0.08)"
  >
    <UserPlus class="text-[#478FC8]" :size="22" :stroke-width="2.2" />
  </div>

  <!-- Glass card -->
  <div
    class="w-full flex flex-col gap-5 px-8 py-8 rounded-3xl"
    style="background: rgba(255,255,255,0.72); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,0.85); box-shadow: 0 20px 60px rgba(71,143,200,0.12), 0 4px 20px rgba(0,0,0,0.06)"
  >
    <!-- Heading -->
    <div class="flex flex-col gap-1.5 text-center">
      <h1 class="text-gray-900" style="font-size: 22px; font-weight: 800; letter-spacing: -0.5px">
        Create your account
      </h1>
      <p class="text-gray-400" style="font-size: 13.5px; line-height: 1.6">
        Start organizing your work today.<br />Free forever for individuals.
      </p>
    </div>

    <!-- Error -->
    <div
      v-if="error"
      class="flex items-center gap-2 px-4 py-3 rounded-xl text-red-600"
      style="background: rgba(254,226,226,0.7); border: 1px solid rgba(252,165,165,0.4); font-size: 13px; font-weight: 500"
    >
      <svg class="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
      </svg>
      {{ error }}
    </div>

    <!-- Form -->
    <form class="flex flex-col gap-3" @submit.prevent="handleRegister">
      <!-- Full Name -->
      <div class="relative flex items-center">
        <User
          class="absolute left-3.5 z-10 text-gray-500 pointer-events-none"
          :size="16"
        />
        <input
          v-model="form.name"
          type="text"
          placeholder="Full name"
          required
          class="w-full pl-10 pr-4 py-3 rounded-xl outline-none text-gray-800 placeholder:text-gray-400 transition-all focus:bg-white focus:border-[#478FC8] focus:ring-[3px] focus:ring-[#478FC8]/15"
          style="font-size: 13.5px; background: rgba(243,244,246,0.8); border: 1px solid rgba(209,213,219,0.6)"
        />
      </div>

      <!-- Email -->
      <div class="relative flex items-center">
        <Mail
          class="absolute left-3.5 z-10 text-gray-500 pointer-events-none"
          :size="16"
        />
        <input
          v-model="form.email"
          type="email"
          placeholder="Email"
          required
          class="w-full pl-10 pr-4 py-3 rounded-xl outline-none text-gray-800 placeholder:text-gray-400 transition-all focus:bg-white focus:border-[#478FC8] focus:ring-[3px] focus:ring-[#478FC8]/15"
          style="font-size: 13.5px; background: rgba(243,244,246,0.8); border: 1px solid rgba(209,213,219,0.6)"
        />
      </div>

      <!-- Password -->
      <div class="relative flex items-center">
        <Lock
          class="absolute left-3.5 z-10 text-gray-500 pointer-events-none"
          :size="16"
        />
        <input
          v-model="form.password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Password"
          required
          class="w-full pl-10 pr-11 py-3 rounded-xl outline-none text-gray-800 placeholder:text-gray-400 transition-all focus:bg-white focus:border-[#478FC8] focus:ring-[3px] focus:ring-[#478FC8]/15"
          style="font-size: 13.5px; background: rgba(243,244,246,0.8); border: 1px solid rgba(209,213,219,0.6)"
        />
        <button
          type="button"
          class="absolute right-3.5 z-10 text-gray-500 hover:text-gray-700 transition-colors"
          @click="showPassword = !showPassword"
        >
          <EyeOff v-if="showPassword" :size="16" />
          <Eye v-else :size="16" />
        </button>
      </div>

      <!-- Confirm Password -->
      <div class="relative flex items-center">
        <Lock
          class="absolute left-3.5 z-10 text-gray-500 pointer-events-none"
          :size="16"
        />
        <input
          v-model="form.confirmPassword"
          :type="showConfirmPassword ? 'text' : 'password'"
          placeholder="Confirm password"
          required
          class="w-full pl-10 pr-11 py-3 rounded-xl outline-none text-gray-800 placeholder:text-gray-400 transition-all focus:bg-white focus:border-[#478FC8] focus:ring-[3px] focus:ring-[#478FC8]/15"
          style="font-size: 13.5px; background: rgba(243,244,246,0.8); border: 1px solid rgba(209,213,219,0.6)"
        />
        <button
          type="button"
          class="absolute right-3.5 z-10 text-gray-500 hover:text-gray-700 transition-colors"
          @click="showConfirmPassword = !showConfirmPassword"
        >
          <EyeOff v-if="showConfirmPassword" :size="16" />
          <Eye v-else :size="16" />
        </button>
      </div>

      <!-- Password hint -->
      <p class="text-gray-400 pl-1" style="font-size: 11.5px">
        Must be at least 6 characters
      </p>

      <!-- Submit -->
      <button
        type="submit"
        :disabled="isLoading || !form.name || !form.email || !form.password || !form.confirmPassword"
        :class="[
          'w-full py-3 rounded-xl text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98]',
          isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90',
        ]"
        style="font-size: 14.5px; font-weight: 700; background: linear-gradient(135deg, #3570A5 0%, #478FC8 50%, #5BA3D9 100%); box-shadow: 0 6px 24px rgba(71,143,200,0.40); letter-spacing: -0.2px"
      >
        <svg v-if="isLoading" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="white" stroke-width="4" />
          <path class="opacity-75" fill="white" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
        </svg>
        {{ isLoading ? 'Creating account...' : 'Create Account' }}
      </button>
    </form>

    <!-- Divider -->
    <div class="flex items-center gap-3">
      <div class="flex-1 h-px" style="background: rgba(209,213,219,0.6)" />
      <span class="text-gray-400" style="font-size: 12px">Or sign up with</span>
      <div class="flex-1 h-px" style="background: rgba(209,213,219,0.6)" />
    </div>

    <!-- Social icon buttons -->
    <div class="flex items-center justify-center gap-4">
      <!-- Google -->
      <button
        type="button"
        class="flex items-center justify-center rounded-2xl transition-all hover:scale-105 active:scale-95"
        style="width: 52px; height: 52px; background: rgba(255,255,255,0.85); border: 1px solid rgba(209,213,219,0.7); box-shadow: 0 2px 8px rgba(0,0,0,0.06); backdrop-filter: blur(8px)"
      >
        <svg viewBox="0 0 24 24" style="width: 20px; height: 20px">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
      </button>

      <!-- GitHub -->
      <button
        type="button"
        class="flex items-center justify-center rounded-2xl transition-all hover:scale-105 active:scale-95"
        style="width: 52px; height: 52px; background: rgba(255,255,255,0.85); border: 1px solid rgba(209,213,219,0.7); box-shadow: 0 2px 8px rgba(0,0,0,0.06); backdrop-filter: blur(8px)"
      >
        <svg viewBox="0 0 24 24" style="width: 20px; height: 20px" fill="#1f2937">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
        </svg>
      </button>

      <!-- Apple -->
      <button
        type="button"
        class="flex items-center justify-center rounded-2xl transition-all hover:scale-105 active:scale-95"
        style="width: 52px; height: 52px; background: rgba(255,255,255,0.85); border: 1px solid rgba(209,213,219,0.7); box-shadow: 0 2px 8px rgba(0,0,0,0.06); backdrop-filter: blur(8px)"
      >
        <svg viewBox="0 0 24 24" style="width: 20px; height: 20px" fill="#1f2937">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
        </svg>
      </button>
    </div>

    <!-- Sign in link -->
    <p class="text-center text-gray-400" style="font-size: 13px">
      Already have an account?
      <NuxtLink
        to="/auth/login"
        class="text-[#478FC8] hover:text-[#3570A5] transition-colors"
        style="font-weight: 600"
      >
        Sign in
      </NuxtLink>
    </p>
  </div>
</template>
