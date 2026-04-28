import axios, { type InternalAxiosRequestConfig } from 'axios'

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

interface PendingRequest {
  resolve: () => void
  reject: (err: unknown) => void
}

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

/** Auth 端點不走 refresh 流程，避免遞迴與錯誤頁干擾 */
const AUTH_BYPASS = ['/auth/refresh', '/auth/me', '/auth/login', '/auth/register', '/auth/logout']

let isRefreshing = false
let refreshQueue: PendingRequest[] = []

/**
 * 讓所有排隊等待 refresh 的請求重新執行。
 * @param original 原始請求設定（每個 caller 自己保留）
 */
const flushQueue = (): void => {
  refreshQueue.forEach(({ resolve }) => resolve())
  refreshQueue = []
}

/**
 * 拒絕所有排隊等待 refresh 的請求。
 * @param err 拒絕原因
 */
const rejectQueue = (err: unknown): void => {
  refreshQueue.forEach(({ reject }) => reject(err))
  refreshQueue = []
}

/**
 * Axios response 攔截器：
 * - 403 → 導向 /403 錯誤頁（auth 端點除外）
 * - 401 → 嘗試 refresh token，失敗後導向 /401（auth 端點除外）
 */
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config as RetriableConfig
    const url: string = original?.url ?? ''
    const isAuthEndpoint = AUTH_BYPASS.some((p) => url.endsWith(p))

    if (err.response?.status === 403 && !isAuthEndpoint) {
      const { default: router } = await import('@/router')
      if (!router.currentRoute.value.meta.public) {
        await router.push('/403')
      }
      return Promise.reject(err)
    }

    if (err.response?.status === 401 && !original._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({
            resolve: () => resolve(api(original)),
            reject,
          })
        })
      }

      original._retry = true
      isRefreshing = true

      try {
        await api.post('/auth/refresh')
        flushQueue()
        return api(original)
      } catch (refreshErr) {
        rejectQueue(refreshErr)
        // 清除 stale session，避免守衛誤判為已登入後把 /login 踢回首頁
        const { useAuthStore } = await import('@/stores/auth')
        useAuthStore().clearSession()
        const { default: router } = await import('@/router')
        // 已在公開頁面（/login、/401 等）時不再跳轉，避免頁面內的 API 呼叫觸發循環
        if (!router.currentRoute.value.meta.public) {
          await router.push('/401')
        }
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(err)
  },
)

export default api
