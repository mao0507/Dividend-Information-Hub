import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

let isRefreshing = false
let refreshQueue: Array<(token: string) => void> = []

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push(() => resolve(api(original)))
        })
      }
      original._retry = true
      isRefreshing = true
      try {
        await api.post('/auth/refresh')
        refreshQueue.forEach((cb) => cb(''))
        refreshQueue = []
        return api(original)
      } catch {
        refreshQueue = []
        window.location.href = '/onboarding'
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(err)
  },
)

export default api
