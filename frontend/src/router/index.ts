import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    public?: boolean
  }
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/Login.vue'),
      meta: { public: true },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/dashboard/Dashboard.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/calendar',
      name: 'calendar',
      component: () => import('@/views/calendar/Calendar.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/stock/:code',
      name: 'stock-detail',
      component: () => import('@/views/stock/StockDetail.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/ranking',
      name: 'ranking',
      component: () => import('@/views/ranking/Ranking.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/watchlist',
      name: 'watchlist',
      component: () => import('@/views/watchlist/Watchlist.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/holdings',
      name: 'holdings',
      component: () => import('@/views/holdings/Holdings.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/drip',
      name: 'drip',
      component: () => import('@/views/drip/Drip.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/alerts',
      name: 'alerts',
      component: () => import('@/views/alerts/Alerts.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/viz',
      name: 'viz',
      component: () => import('@/views/viz/Viz.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/settings/Settings.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/401',
      name: 'unauthorized',
      component: () => import('@/views/auth/Unauthorized.vue'),
      meta: { public: true },
    },
    {
      path: '/403',
      name: 'forbidden',
      component: () => import('@/views/auth/Forbidden.vue'),
      meta: { public: true },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/auth/NotFound.vue'),
      meta: { public: true },
    },
  ],
})

/**
 * 路由守衛：根據登入狀態決定導向。
 * - 公開頁面（meta.public）直接放行，不打 /auth/me 避免攔截器與守衛交互產生競態。
 * - 已登入訪問 /login → 導向首頁。
 * - 未登入訪問需驗證頁（meta.requiresAuth） → 導向 /login。
 * @param to 目標路由
 * @returns 重導路徑或 undefined（放行）
 */
router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (to.meta.public) {
    if (to.name === 'login' && auth.isLoggedIn()) {
      return '/'
    }
    return
  }

  if (!auth.user) {
    try {
      await auth.fetchMe()
    } catch {
      // 視為未登入，繼續 requiresAuth 判斷
    }
  }

  if (to.meta.requiresAuth && !auth.isLoggedIn()) {
    return '/login'
  }
})

export default router
