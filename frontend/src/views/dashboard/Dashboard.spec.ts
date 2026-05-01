import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import DashboardPage from './Dashboard.vue'
import type { OhlcvPoint } from '@/types'

const {
  pushMock,
  getSummaryMock,
  getUpcomingMock,
  getAllMock,
  getPriceSeriesMock,
  getTwseClosedDatesMock,
} = vi.hoisted(() => ({
  pushMock: vi.fn(),
  getSummaryMock: vi.fn(),
  getUpcomingMock: vi.fn(),
  getAllMock: vi.fn(),
  getPriceSeriesMock: vi.fn(),
  getTwseClosedDatesMock: vi.fn(),
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: pushMock }),
  RouterLink: defineComponent({
    name: 'RouterLink',
    template: '<a><slot /></a>',
  }),
}))

vi.mock('@/services/api/dashboard', () => ({
  dashboardApi: {
    getSummary: getSummaryMock,
    getUpcoming: getUpcomingMock,
  },
}))

vi.mock('@/services/api/watchlist', () => ({
  watchlistApi: {
    getAll: getAllMock,
  },
}))

vi.mock('@/services/api/stock', () => ({
  stockApi: {
    getPriceSeries: getPriceSeriesMock,
    getTwseClosedDates: getTwseClosedDatesMock,
  },
}))

/**
 * 等待頁面初始化與資料載入完成
 * @returns Promise<void>
 */
const flushAll = async (): Promise<void> => {
  await Promise.resolve()
  await Promise.resolve()
  await nextTick()
}

const makeCandle = (date: string, close: number): OhlcvPoint => ({
  date,
  open: close - 1,
  high: close + 1,
  low: close - 2,
  close,
  volume: 1000,
})

const tvChartStub = defineComponent({
  name: 'TvChart',
  props: {
    candles: { type: Array, required: true },
  },
  template: '<div data-test="tvchart">{{ candles.length }}</div>',
})

describe('DashboardPage range resilience', () => {
  beforeEach(() => {
    pushMock.mockReset()
    getSummaryMock.mockReset()
    getUpcomingMock.mockReset()
    getAllMock.mockReset()
    getPriceSeriesMock.mockReset()
    getTwseClosedDatesMock.mockReset()

    getSummaryMock.mockResolvedValue({
      data: {
        todayExDiv: { count: 0, codes: [] },
        weekExDiv: { count: 0, watchlistCount: 0 },
        pendingFill: { count: 0, maxDays: 0 },
        nextPayout: { date: '2026-05-01', estimatedAmount: 0 },
        accumulatedIncome: 0,
        accumulatedIncomeState: 'ready',
        yoyPct: 0,
        asOf: '2026-04-27T00:00:00.000Z',
        totalInvestedAmount: 0,
        portfolioAllocation: [],
        dividendIncomeSinceBuy: 0,
      },
    })
    getUpcomingMock.mockResolvedValue({ data: [] })
    getAllMock.mockResolvedValue({ data: [] })
    getTwseClosedDatesMock.mockResolvedValue([])

    const rangePayloads: Record<string, OhlcvPoint[]> = {
      '6M': [makeCandle('2026-04-25', 21000), makeCandle('2026-04-24', 20900)],
      '1W': [makeCandle('2026-04-27', 21200), makeCandle('2026-04-26', 21100)],
      '1M': [],
      '3M': [makeCandle('2026-03-01', 20500), makeCandle('2026-02-28', 20400)],
      '1Y': [],
      'MAX': [makeCandle('2025-01-02', 18000), makeCandle('2024-12-31', 17900)],
    }
    getPriceSeriesMock.mockImplementation(async (_code: string, range: string) => ({
      data: {
        data: rangePayloads[range] ?? [],
        diagnostics: {
          status: (rangePayloads[range]?.length ?? 0) > 0 ? 'AVAILABLE' : 'MISSING_IN_DB',
          reason: '資料庫已有可用價格資料',
          fallbackAttempted: false,
          lastSyncedTradingDate: '2026-04-25',
          syncUpdatedAt: '2026-04-25T15:00:00.000Z',
        },
      },
    }))
  })

  it('keeps chart component rendered across all range switches with partial data', async () => {
    const wrapper = mount(DashboardPage, {
      global: {
        stubs: {
          AppLayout: { template: '<div><slot /></div>' },
          TvChart: tvChartStub,
          SparkLine: { template: '<div />' },
          Chip: { template: '<span><slot /></span>' },
        },
      },
    })
    await flushAll()

    const ranges = ['1W', '1M', '3M', '6M', '1Y', 'MAX']
    for (const range of ranges) {
      const button = wrapper.findAll('button').find((node) => node.text() === range)
      expect(button).toBeTruthy()
      await button!.trigger('click')
      await flushAll()
      expect(wrapper.find('[data-test="tvchart"]').exists()).toBe(true)
    }

    expect(getPriceSeriesMock).toHaveBeenCalledWith('TAIEX', '1W')
    expect(getPriceSeriesMock).toHaveBeenCalledWith('TAIEX', '1M')
    expect(getPriceSeriesMock).toHaveBeenCalledWith('TAIEX', '3M')
    expect(getPriceSeriesMock).toHaveBeenCalledWith('TAIEX', '6M')
    expect(getPriceSeriesMock).toHaveBeenCalledWith('TAIEX', '1Y')
    expect(getPriceSeriesMock).toHaveBeenCalledWith('TAIEX', 'MAX')
  })

  it('shows TAIEX header label', async () => {
    const wrapper = mount(DashboardPage, {
      global: {
        stubs: {
          AppLayout: { template: '<div><slot /></div>' },
          TvChart: tvChartStub,
          SparkLine: { template: '<div />' },
          Chip: { template: '<span><slot /></span>' },
        },
      },
    })
    await flushAll()
    expect(wrapper.text()).toContain('台灣加權指數')
    expect(wrapper.text()).toContain('TAIEX')
  })

  it('renders accumulated income and total invested amount in one combined card', async () => {
    getSummaryMock.mockResolvedValue({
      data: {
        todayExDiv: { count: 1, codes: ['2330'] },
        weekExDiv: { count: 2, watchlistCount: 1 },
        pendingFill: { count: 0, maxDays: 0 },
        nextPayout: { date: '2026-05-01', estimatedAmount: 1000 },
        accumulatedIncome: 48260,
        accumulatedIncomeState: 'ready',
        yoyPct: 12.4,
        asOf: '2026-04-27T00:00:00.000Z',
        totalInvestedAmount: 300000,
        portfolioAllocation: [],
        dividendIncomeSinceBuy: 48260,
      },
    })
    const wrapper = mount(DashboardPage, {
      global: {
        stubs: {
          AppLayout: { template: '<div><slot /></div>' },
          TvChart: tvChartStub,
          SparkLine: { template: '<div />' },
          Chip: { template: '<span><slot /></span>' },
        },
      },
    })
    await flushAll()
    const combinedCard = wrapper.find('[data-test="combined-summary-card"]')
    expect(combinedCard.exists()).toBe(true)
    expect(combinedCard.text()).toContain('累積股息收入')
    expect(combinedCard.text()).toContain('NT$ 48,260')
    expect(combinedCard.text()).toContain('總投資金額')
    expect(combinedCard.text()).toContain('NT$ 300,000')
    expect(combinedCard.text()).toContain('前往持股管理')
  })

  it('keeps combined card visible with fallback text when summary request fails', async () => {
    getSummaryMock.mockRejectedValue(new Error('network'))
    const wrapper = mount(DashboardPage, {
      global: {
        stubs: {
          AppLayout: { template: '<div><slot /></div>' },
          TvChart: tvChartStub,
          SparkLine: { template: '<div />' },
          Chip: { template: '<span><slot /></span>' },
        },
      },
    })
    await flushAll()
    const combinedCard = wrapper.find('[data-test="combined-summary-card"]')
    expect(combinedCard.exists()).toBe(true)
    expect(combinedCard.text()).toContain('資料同步中')
    expect(combinedCard.text()).toContain('前往持股管理')
  })
})
