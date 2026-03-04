<script setup lang="ts">
const mobileDrawerOpen = ref(false)
const sidebarCollapsed = ref(false)

const toggleCollapse = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}
</script>

<template>
  <div class="min-h-screen bg-gray-50/50 dark:bg-gray-950">
    <!-- Desktop Sidebar -->
    <LayoutSidebar v-model:collapsed="sidebarCollapsed" />

    <!-- Mobile Drawer -->
    <LayoutMobileDrawer v-model:open="mobileDrawerOpen" />

    <!-- Main Content -->
    <div :class="['transition-all duration-300', sidebarCollapsed ? 'lg:ml-[68px]' : 'lg:ml-[240px]']">
      <LayoutHeader
        :sidebar-collapsed="sidebarCollapsed"
        @toggle-sidebar="mobileDrawerOpen = !mobileDrawerOpen"
        @toggle-collapse="toggleCollapse"
      />
      <main class="p-4 lg:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>
