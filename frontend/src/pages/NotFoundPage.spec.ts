import { mount } from '@vue/test-utils'
import NotFoundPage from './NotFoundPage.vue'

const pushMock = vi.fn<Promise<void>, [string]>()
const backMock = vi.fn<void, []>()

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: pushMock,
    back: backMock,
  }),
}))

describe('NotFoundPage', () => {
  beforeEach(() => {
    pushMock.mockReset()
    backMock.mockReset()
  })

  it('navigates to dashboard when click dashboard button', async () => {
    const wrapper = mount(NotFoundPage)
    await wrapper.get('[aria-label="回到儀表板"]').trigger('click')
    expect(pushMock).toHaveBeenCalledWith('/dashboard')
  })

  it('goes back when browser has history', async () => {
    vi.spyOn(window.history, 'length', 'get').mockReturnValue(2)
    const wrapper = mount(NotFoundPage)
    await wrapper.get('[aria-label="返回上一頁"]').trigger('click')
    expect(backMock).toHaveBeenCalledTimes(1)
    expect(pushMock).not.toHaveBeenCalled()
  })

  it('falls back to dashboard when no history', async () => {
    vi.spyOn(window.history, 'length', 'get').mockReturnValue(1)
    const wrapper = mount(NotFoundPage)
    await wrapper.get('[aria-label="返回上一頁"]').trigger('click')
    expect(pushMock).toHaveBeenCalledWith('/dashboard')
  })
})
