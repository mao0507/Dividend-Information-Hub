import { defineStore } from 'pinia'
import { ref } from 'vue'
import { authApi } from '@/services/api/auth'

interface User {
  id: string
  email: string
  name?: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isLoading = ref(false)

  async function fetchMe() {
    try {
      const res = await authApi.me()
      user.value = res.data
    } catch {
      user.value = null
    }
  }

  async function login(email: string, password: string) {
    isLoading.value = true
    try {
      const res = await authApi.login({ email, password })
      user.value = res.data.user
    } finally {
      isLoading.value = false
    }
  }

  async function register(email: string, password: string, name?: string) {
    isLoading.value = true
    try {
      const res = await authApi.register({ email, password, name })
      user.value = res.data.user
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    await authApi.logout()
    user.value = null
  }

  /** 清除本地 session 狀態，不發 API 請求（用於 token 失效的強制登出）。 */
  const clearSession = (): void => {
    user.value = null
  }

  const isLoggedIn = () => user.value !== null

  return { user, isLoading, fetchMe, login, register, logout, clearSession, isLoggedIn }
})
