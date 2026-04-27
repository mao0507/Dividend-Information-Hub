import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import RankingPage from './RankingPage.vue'

const { pushMock, getRankingMock, getRankingPresetsMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  getRankingMock: vi.fn(),
  getRankingPresetsMock: vi.fn(),
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}))

vi.mock('@/api/stock', () => ({
  stockApi: {
    getRanking: getRankingMock,
    getRankingPresets: getRankingPresetsMock,
  },
}))

const flushAll = async (): Promise<void> => {
  await Promise.resolve()
  await Promise.resolve()
  await nextTick()
}

const mountPage = () =>
  mount(RankingPage, {
    global: {
      stubs: {
        AppLayout: { template: '<div><slot /></div>' },
        USelect: { template: '<div />' },
        UButton: { template: '<button><slot /></button>' },
        UChip: { template: '<span><slot /></span>' },
      },
    },
  })

describe('RankingPage resilience', () => {
  beforeEach(() => {
    pushMock.mockReset()
    getRankingMock.mockReset()
    getRankingPresetsMock.mockReset()
    getRankingPresetsMock.mockResolvedValue({ data: [] })
  })

  it('shows empty state when api returns no rows', async () => {
    getRankingMock.mockResolvedValue({ data: { data: [], total: 0 } })
    const wrapper = mountPage()
    await flushAll()
    expect(wrapper.text()).toContain('目前沒有符合條件的項目')
  })

  it('shows error state and retry button when api fails', async () => {
    getRankingMock.mockRejectedValue(new Error('network down'))
    const wrapper = mountPage()
    await flushAll()
    expect(wrapper.text()).toContain('排行榜載入失敗')
    expect(wrapper.text()).toContain('network down')
    expect(wrapper.text()).toContain('重新載入')
  })

  it('normalizes malformed ranking rows without runtime crash', async () => {
    getRankingMock.mockResolvedValue({
      data: {
        data: [
          {
            rank: NaN,
            code: undefined,
            name: undefined,
            sector: undefined,
            freq: undefined,
            yield: NaN,
            cash: NaN,
            price: NaN,
            changePct: NaN,
            fillRate: undefined,
            isEtf: undefined,
          },
        ],
        total: 1,
      },
    })
    const wrapper = mountPage()
    await flushAll()
    expect(wrapper.text()).toContain('----')
    expect(wrapper.text()).toContain('未知名稱')
  })
})
