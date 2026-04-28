import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const authStoreMock = vi.hoisted(() => ({
  user: null as { id: string; email: string } | null,
  fetchMe: vi.fn(),
  isLoggedIn: vi.fn(() => false),
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => authStoreMock,
}))

import router from './index'

describe('router not-found behavior', () => {
  it('resolves unknown path to not-found route', () => {
    const resolved = router.resolve('/unknown-path-for-404')
    expect(resolved.name).toBe('not-found')
  })

  it('keeps existing known routes intact', () => {
    const dashboard = router.resolve('/dashboard')
    const watchlist = router.resolve('/watchlist')

    expect(dashboard.name).toBe('dashboard')
    expect(watchlist.name).toBe('watchlist')
  })
})

describe('route meta flags', () => {
  it('protected routes have requiresAuth: true', () => {
    const protectedPaths = [
      '/dashboard', '/calendar', '/ranking',
      '/watchlist', '/holdings', '/drip', '/alerts', '/viz', '/settings',
    ]
    for (const path of protectedPaths) {
      const route = router.resolve(path)
      expect(route.meta.requiresAuth, `${path} should have requiresAuth`).toBe(true)
    }
  })

  it('/login route is public and has no requiresAuth', () => {
    const route = router.resolve('/login')
    expect(route.meta.requiresAuth).toBeUndefined()
    expect(route.meta.public).toBe(true)
  })

  it('not-found route is public', () => {
    const route = router.resolve('/some-404-page')
    expect(route.meta.requiresAuth).toBeUndefined()
    expect(route.meta.public).toBe(true)
  })

  it('/401 route is public', () => {
    const route = router.resolve('/401')
    expect(route.meta.public).toBe(true)
    expect(route.meta.requiresAuth).toBeUndefined()
  })

  it('/403 route is public', () => {
    const route = router.resolve('/403')
    expect(route.meta.public).toBe(true)
    expect(route.meta.requiresAuth).toBeUndefined()
  })
})

describe('route guard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    authStoreMock.user = null
    authStoreMock.fetchMe.mockResolvedValue(undefined)
    authStoreMock.isLoggedIn.mockReturnValue(false)
    vi.clearAllMocks()
  })

  it('未登入時訪問受保護路由 → 重導向至 /login', async () => {
    authStoreMock.fetchMe.mockImplementation(() => {
      authStoreMock.user = null
      return Promise.resolve()
    })
    authStoreMock.isLoggedIn.mockReturnValue(false)

    await router.push('/dashboard')
    expect(router.currentRoute.value.path).toBe('/login')
  })

  it('已登入時訪問受保護路由 → 正常放行', async () => {
    authStoreMock.user = { id: 'u1', email: 'u1@example.com' }
    authStoreMock.isLoggedIn.mockReturnValue(true)

    await router.push('/dashboard')
    expect(router.currentRoute.value.path).toBe('/dashboard')
  })

  it('已登入時訪問 /login → 重導向至首頁 (/dashboard)', async () => {
    authStoreMock.user = { id: 'u1', email: 'u1@example.com' }
    authStoreMock.isLoggedIn.mockReturnValue(true)

    await router.push('/login')
    // '/' 被 redirect 設定導至 '/dashboard'
    expect(router.currentRoute.value.path).toBe('/dashboard')
  })

  it('未登入時訪問 /login → 正常放行', async () => {
    authStoreMock.user = null
    authStoreMock.isLoggedIn.mockReturnValue(false)

    await router.push('/login')
    expect(router.currentRoute.value.path).toBe('/login')
  })

  it('不會因 /login ↔ 受保護路由之間產生無限重導向', async () => {
    authStoreMock.user = null
    authStoreMock.isLoggedIn.mockReturnValue(false)

    await router.push('/dashboard')
    expect(router.currentRoute.value.path).toBe('/login')

    await router.push('/login')
    expect(router.currentRoute.value.path).toBe('/login')
  })

  it('公開路由 /401 未登入時可直接訪問，不呼叫 fetchMe', async () => {
    authStoreMock.user = null
    authStoreMock.isLoggedIn.mockReturnValue(false)

    await router.push('/401')
    expect(router.currentRoute.value.path).toBe('/401')
    expect(authStoreMock.fetchMe).not.toHaveBeenCalled()
  })

  it('公開路由 /403 未登入時可直接訪問，不呼叫 fetchMe', async () => {
    authStoreMock.user = null
    authStoreMock.isLoggedIn.mockReturnValue(false)

    await router.push('/403')
    expect(router.currentRoute.value.path).toBe('/403')
    expect(authStoreMock.fetchMe).not.toHaveBeenCalled()
  })

  it('auth.user 已存在時守衛不再呼叫 fetchMe', async () => {
    authStoreMock.user = { id: 'u1', email: 'u1@example.com' }
    authStoreMock.isLoggedIn.mockReturnValue(true)

    await router.push('/dashboard')
    expect(authStoreMock.fetchMe).not.toHaveBeenCalled()
  })

  it('fetchMe 拋例外時視為未登入並導向 /login', async () => {
    authStoreMock.user = null
    authStoreMock.fetchMe.mockRejectedValue(new Error('network error'))
    authStoreMock.isLoggedIn.mockReturnValue(false)

    // 使用與前一測試不同的路由，避免 duplicate navigation 跳過守衛
    await router.push('/settings')
    expect(router.currentRoute.value.path).toBe('/login')
  })
})
