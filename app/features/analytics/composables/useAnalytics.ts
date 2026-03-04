export const useAnalytics = () => {
  const analyticsStore = useAnalyticsStore()

  const loadAnalytics = async () => {
    await analyticsStore.fetchAnalytics()
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
    toggleTimeTracker: analyticsStore.toggleTimeTracker,
    resetTimeTracker: analyticsStore.resetTimeTracker,
  }
}
