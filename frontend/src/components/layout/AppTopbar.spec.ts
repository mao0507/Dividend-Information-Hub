import { mount } from '@vue/test-utils'
import AppTopbar from './AppTopbar.vue'

const pushMock = vi.fn<Promise<void>, [string]>()

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}))

describe('AppTopbar', () => {
  beforeEach(() => {
    pushMock.mockReset()
  })

  it('renders breadcrumb without affecting topbar content', () => {
    const wrapper = mount(AppTopbar, {
      props: {
        breadcrumbs: ['儀表板'],
      },
    })

    expect(wrapper.text()).toContain('儀表板')
    expect(wrapper.text()).toContain('台股即時')
  })

  it('routes to alerts when clicking alerts action', async () => {
    const wrapper = mount(AppTopbar)
    await wrapper.get('[aria-label="前往提醒中心"]').trigger('click')
    expect(pushMock).toHaveBeenCalledWith('/alerts')
  })

  it('routes to settings for export and settings actions', async () => {
    const wrapper = mount(AppTopbar)
    await wrapper.get('[aria-label="前往匯出設定"]').trigger('click')
    await wrapper.get('[aria-label="前往設定"]').trigger('click')

    expect(pushMock).toHaveBeenCalledWith('/settings')
    expect(pushMock).toHaveBeenCalledTimes(2)
  })
})
