/**
 * useLayoutState — persisted layout state across all pages
 * Uses useCookie so the sidebar collapsed state is available during SSR
 * and survives page refresh without hydration mismatch.
 */
export const useLayoutState = () => {
  const collapsedCookie = useCookie<boolean>('sidebar-collapsed', {
    default: () => false,
    watch: true,
  })
  const sidebarCollapsed = useState<boolean>('sidebar-collapsed', () => collapsedCookie.value)
  const mobileDrawerOpen = useState<boolean>('mobile-drawer-open', () => false)

  const toggleCollapse = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
    collapsedCookie.value = sidebarCollapsed.value
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
