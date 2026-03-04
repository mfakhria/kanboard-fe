<script setup lang="ts">
// Redirect root to dashboard or login
definePageMeta({
  layout: false,
})

const authStore = useAuthStore()

onMounted(() => {
  authStore.initAuth()
  if (authStore.isAuthenticated) {
    navigateTo('/dashboard')
  } else {
    navigateTo('/auth/login')
  }
})
</script>

<template>
  <div class="flex h-screen items-center justify-center">
    <div class="h-8 w-8 animate-spin rounded-full border-4 border-lime-500 border-t-transparent" />
  </div>
</template>
