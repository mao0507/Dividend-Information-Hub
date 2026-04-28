import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import DashboardPage from './DashboardPage.vue'
import type { OhlcvPoint } from '@/types'

const {
  pushMock,
  getSummaryMock,
  getUpcomingMock,
  getAllMock,
  getFeaturedMock,
  getPriceSeriesMock,
  getTwseClosedDatesMock,
} = vi.hoisted(() => ({
  pushMock: vi.fn(),
  getSummaryMock: vi.fn(),
  getUpcomingMock: vi.fn(),
  getAllMock: vi.fn(),
  getFeaturedMock: vi.fn(),
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

vi.mock('@/api/dashboard', () => ({
  dashboardApi: {
    getSummary: getSummaryMock,
    getUpcoming: getUpcomingMock,
  },
}))

vi.mock('@/api/watchlist', () => ({
  watchlistApi: {
    getAll: getAllMock,
  },
}))

vi.mock('@/api/stock', () => ({
  stockApi: {
    getFeatured: getFeaturedMock,
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

const kpiCardStub = defineComponent({
  name: 'KpiCard',
  props: {
    label: { type: String, required: true },
    value: { type: [String, Number], required: true },
    sub: { type: String, required: true },
  },
  template: '<div data-test="kpi-card">{{ label }}|{{ value }}|{{ sub }}</div>',
})

describe('DashboardPage range resilience', () => {
  beforeEach(() => {
    pushMock.mockReset()
    getSummaryMock.mockReset()
    getUpcomingMock.mockReset()
    getAllMock.mockReset()
    getFeaturedMock.mockReset()
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
    getFeaturedMock.mockResolvedValue({
      data: {
        featured: {
          code: '2330',
          name: '台積電',
          sector: '半導體',
          market: 'TWSE',
          isEtf: false,
          price: 100,
          change: 1,
          changePct: 1,
          volume: 100,
          updatedAt: '2026-04-27T00:00:00.000Z',
          streak: 1,
          annualCash: 1,
          yieldPct: 1,
        },
      },
    })
    getTwseClosedDatesMock.mockResolvedValue([])
    const rangePayloads: Record<string, { data: OhlcvPoint[]; reason: string }> = {
      '6M': { data: [makeCandle('2026-04-25', 101)], reason: '資料庫已有可用價格資料' },
      '1W': { data: [makeCandle('2026-04-27', 102)], reason: '資料庫已有可用價格資料' },
      '1M': { data: [], reason: '資料庫查無對應區間價格資料' },
      '3M': { data: [makeCandle('2026-03-01', 99)], reason: '資料庫已有可用價格資料' },
      '1Y': { data: [], reason: '查詢區間晚於最近同步交易日，請待排程完成' },
      'MAX': { data: [makeCandle('2025-01-02', 88)], reason: '資料庫已有可用價格資料' },
    }
    getPriceSeriesMock.mockImplementation(async (_code: string, range: string) => ({
      data: {
        data: rangePayloads[range]?.data ?? [],
        diagnostics: {
          status: rangePayloads[range]?.data.length ? 'AVAILABLE' : 'MISSING_IN_DB',
          reason: rangePayloads[range]?.reason ?? '資料庫查無對應區間價格資料',
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
          UChip: { template: '<span><slot /></span>' },
          KpiCard: kpiCardStub,
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

    expect(getPriceSeriesMock).toHaveBeenCalledWith('2330', '1W')
    expect(getPriceSeriesMock).toHaveBeenCalledWith('2330', '1M')
    expect(getPriceSeriesMock).toHaveBeenCalledWith('2330', '3M')
    expect(getPriceSeriesMock).toHaveBeenCalledWith('2330', '6M')
    expect(getPriceSeriesMock).toHaveBeenCalledWith('2330', '1Y')
    expect(getPriceSeriesMock).toHaveBeenCalledWith('2330', 'MAX')
  })

  it('downgrades top cards to neutral state when summary asOf is unavailable', async () => {
    getSummaryMock.mockResolvedValue({
      data: {
        todayExDiv: { count: 0, codes: [] },
        weekExDiv: { count: 0, watchlistCount: 0 },
        pendingFill: { count: 0, maxDays: 0 },
        nextPayout: { date: '2026-05-01', estimatedAmount: 0 },
        accumulatedIncome: null,
        accumulatedIncomeState: 'stale',
        yoyPct: null,
        asOf: null,
        totalInvestedAmount: 0,
        portfolioAllocation: [],
        dividendIncomeSinceBuy: 0,
      },
    })
    const wrapper = mount(DashboardPage, {
      global: {
        stubs: {
          AppLayout: { template: '<div><slot /></div>' },
          TvChart: tvChartStub,
          SparkLine: { template: '<div />' },
          UChip: { template: '<span><slot /></span>' },
          KpiCard: kpiCardStub,
        },
      },
    })
    await flushAll()

    const cards = wrapper.findAll('[data-test="kpi-card"]').map((n) => n.text())
    expect(cards).toHaveLength(4)
    expect(cards.every((text) => text.includes('|--|'))).toBe(true)
    expect(cards.every((text) => text.includes('資料同步中'))).toBe(true)
    expect(wrapper.find('[data-test="combined-summary-card"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('總投資金額')
    expect(wrapper.text()).toContain('NT$ 0')
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
          UChip: { template: '<span><slot /></span>' },
          KpiCard: kpiCardStub,
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
          UChip: { template: '<span><slot /></span>' },
          KpiCard: kpiCardStub,
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
