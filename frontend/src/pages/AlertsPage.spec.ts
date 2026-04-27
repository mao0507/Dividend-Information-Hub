import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import AlertsPage from './AlertsPage.vue'

const { getNotificationsMock, getRulesMock, createRuleMock } = vi.hoisted(() => ({
  getNotificationsMock: vi.fn(),
  getRulesMock: vi.fn(),
  createRuleMock: vi.fn(),
}))

vi.mock('@/api/alerts', () => ({
  alertsApi: {
    getNotifications: getNotificationsMock,
    getRules: getRulesMock,
    createRule: createRuleMock,
    readNotification: vi.fn(),
    readAllNotifications: vi.fn(),
    updateRule: vi.fn(),
    deleteRule: vi.fn(),
  },
}))

/**
 * 等待元件載入資料後的非同步更新。
 * @returns Promise<void>
 */
const flushAll = async (): Promise<void> => {
  await Promise.resolve()
  await Promise.resolve()
  await nextTick()
}

describe('AlertsPage themed select behavior', () => {
  beforeEach(() => {
    getNotificationsMock.mockResolvedValue({ data: { data: [] } })
    getRulesMock.mockResolvedValue({ data: [] })
    createRuleMock.mockResolvedValue({ data: { id: 'r-1', label: '測試', type: 'payment' } })
  })

  it('submits selected rule type from v-model', async () => {
    const wrapper = mount(AlertsPage, {
      global: {
        stubs: {
          AppLayout: { template: '<div><slot /></div>' },
        },
      },
    })
    await flushAll()

    await wrapper.get('input[placeholder="例如：台積電除息提醒"]').setValue('付款提醒')
    await wrapper.get('select').setValue('payment')
    await wrapper.get('button.w-full').trigger('click')

    expect(createRuleMock).toHaveBeenCalled()
    expect(createRuleMock.mock.calls[0][0].type).toBe('payment')
  })
})
