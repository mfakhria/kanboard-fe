export const useAnalytics = () => {
  const analyticsStore = useAnalyticsStore()

  const loadAnalytics = async (workspaceId?: string) => {
    await analyticsStore.fetchAnalytics(workspaceId)
  }

  const loadProjectStats = async (projectId: string) => {
    await analyticsStore.fetchProjectStats(projectId)
  }

  return {
    stats: computed(() => analyticsStore.stats),
    weeklyProductivity: computed(() => analyticsStore.weeklyProductivity),
    projectProgress: computed(() => analyticsStore.projectProgress),
    recentActivities: computed(() => analyticsStore.recentActivities),
    teamMembers: computed(() => analyticsStore.teamMembers),
    reminders: computed(() => analyticsStore.reminders),
    timeTracker: computed(() => analyticsStore.timeTracker),
    completionRate: computed(() => analyticsStore.completionRate),
    isLoading: computed(() => analyticsStore.isLoading),
    loadAnalytics,
    loadProjectStats,
    toggleTimeTracker: analyticsStore.toggleTimeTracker,
    resetTimeTracker: analyticsStore.resetTimeTracker,
  }
}
