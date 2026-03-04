/**
 * useLayoutState — persisted layout state across all pages
 * Uses Nuxt's useState so the sidebar collapsed state
 * survives navigation between pages without resetting.
 */
export const useLayoutState = () => {
  const sidebarCollapsed = useState<boolean>('sidebar-collapsed', () => false)
  const mobileDrawerOpen = useState<boolean>('mobile-drawer-open', () => false)

  const toggleCollapse = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  const toggleMobileDrawer = () => {
    mobileDrawerOpen.value = !mobileDrawerOpen.value
  }

  return {
    sidebarCollapsed,
    mobileDrawerOpen,
    toggleCollapse,
    toggleMobileDrawer,
  }
}
