<script setup lang="ts">
const mobileDrawerOpen = ref(false)
</script>

<template>
  <div class="min-h-screen bg-gray-50/50 dark:bg-gray-950">
    <!-- Desktop Sidebar -->
    <LayoutSidebar />

    <!-- Mobile Drawer -->
    <LayoutMobileDrawer v-model:open="mobileDrawerOpen" />

    <!-- Main Content -->
    <div class="lg:ml-[240px]">
      <LayoutHeader @toggle-sidebar="mobileDrawerOpen = !mobileDrawerOpen" />
      <main class="p-4 lg:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>
