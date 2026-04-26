import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/onboarding',
      name: 'onboarding',
      component: () => import('@/pages/OnboardingPage.vue'),
      meta: { public: true },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/pages/DashboardPage.vue'),
    },
    {
      path: '/calendar',
      name: 'calendar',
      component: () => import('@/pages/CalendarPage.vue'),
    },
    {
      path: '/stock/:code',
      name: 'stock-detail',
      component: () => import('@/pages/StockDetailPage.vue'),
    },
    {
      path: '/ranking',
      name: 'ranking',
      component: () => import('@/pages/RankingPage.vue'),
    },
    {
      path: '/watchlist',
      name: 'watchlist',
      component: () => import('@/pages/WatchlistPage.vue'),
    },
    {
      path: '/drip',
      name: 'drip',
      component: () => import('@/pages/DripPage.vue'),
    },
    {
      path: '/alerts',
      name: 'alerts',
      component: () => import('@/pages/AlertsPage.vue'),
    },
    {
      path: '/viz',
      name: 'viz',
      component: () => import('@/pages/VizPage.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/pages/SettingsPage.vue'),
    },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  if (!auth.user) {
    await auth.fetchMe()
  }
  if (!to.meta.public && !auth.isLoggedIn()) {
    return '/onboarding'
  }
})

export default router
