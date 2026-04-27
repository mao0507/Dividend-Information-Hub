import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const authApiMock = vi.hoisted(() => ({
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  me: vi.fn(),
}))

vi.mock('@/api/auth', () => ({
  authApi: authApiMock,
}))

import { useAuthStore } from './auth'

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('login sets user and clears loading', async () => {
    authApiMock.login.mockResolvedValue({
      data: { user: { id: 'u1', email: 'u1@example.com' } },
    })

    const store = useAuthStore()
    await store.login('u1@example.com', 'password123')

    expect(store.user?.id).toBe('u1')
    expect(store.isLoading).toBe(false)
  })

  it('register sets user', async () => {
    authApiMock.register.mockResolvedValue({
      data: { user: { id: 'u2', email: 'u2@example.com', name: 'Neo' } },
    })

    const store = useAuthStore()
    await store.register('u2@example.com', 'password123', 'Neo')

    expect(store.user?.email).toBe('u2@example.com')
  })

  it('fetchMe assigns null when api fails', async () => {
    authApiMock.me.mockRejectedValue(new Error('401'))

    const store = useAuthStore()
    await store.fetchMe()

    expect(store.user).toBeNull()
  })
})
