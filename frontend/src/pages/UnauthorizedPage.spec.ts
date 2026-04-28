import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'
import UnauthorizedPage from './UnauthorizedPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/401', component: UnauthorizedPage },
    { path: '/login', component: { template: '<div />' } },
  ],
})

describe('UnauthorizedPage', () => {
  it('顯示 401 錯誤碼', () => {
    const wrapper = mount(UnauthorizedPage, { global: { plugins: [router] } })
    expect(wrapper.text()).toContain('401')
  })

  it('顯示正確標題', () => {
    const wrapper = mount(UnauthorizedPage, { global: { plugins: [router] } })
    expect(wrapper.find('h1').text()).toBe('尚未登入或 Session 已過期')
  })

  it('點擊「回到登入頁」導向 /login', async () => {
    const pushSpy = vi.spyOn(router, 'push').mockResolvedValue(undefined as never)
    const wrapper = mount(UnauthorizedPage, { global: { plugins: [router] } })

    await wrapper.find('button[aria-label="回到登入頁"]').trigger('click')

    expect(pushSpy).toHaveBeenCalledWith('/login')
    pushSpy.mockRestore()
  })
})
