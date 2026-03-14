<script setup lang="ts">
const { sidebarCollapsed } = useLayoutState()
</script>

<template>
  <div class="min-h-screen bg-gray-50/50 dark:bg-gray-950">
    <!-- Desktop Sidebar -->
    <LayoutSidebar />

    <!-- Mobile Drawer -->
    <LayoutMobileDrawer />

    <!-- Main Content -->
    <div :class="['transition-all duration-300', sidebarCollapsed ? 'lg:ml-[70px]' : 'lg:ml-[230px]']">
      <LayoutHeader />
      <main class="px-4 py-6 lg:px-8 lg:py-8">
        <slot />
      </main>
    </div>
  </div>
</template>
