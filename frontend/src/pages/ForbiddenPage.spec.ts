import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'
import ForbiddenPage from './ForbiddenPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/403', component: ForbiddenPage },
    { path: '/', component: { template: '<div />' } },
    { path: '/dashboard', component: { template: '<div />' } },
  ],
})

describe('ForbiddenPage', () => {
  it('顯示 403 錯誤碼', () => {
    const wrapper = mount(ForbiddenPage, { global: { plugins: [router] } })
    expect(wrapper.text()).toContain('403')
  })

  it('顯示正確標題', () => {
    const wrapper = mount(ForbiddenPage, { global: { plugins: [router] } })
    expect(wrapper.find('h1').text()).toBe('您沒有存取此頁面的權限')
  })

  it('點擊「回到首頁」導向 /', async () => {
    const pushSpy = vi.spyOn(router, 'push').mockResolvedValue(undefined as never)
    const wrapper = mount(ForbiddenPage, { global: { plugins: [router] } })

    await wrapper.find('button[aria-label="回到首頁"]').trigger('click')

    expect(pushSpy).toHaveBeenCalledWith('/')
    pushSpy.mockRestore()
  })
})
