import { flushPromises, mount } from '@vue/test-utils'
import HoldingsPage from './Holdings.vue'

const { getHoldingsMock, getAllocationMock, getPnlMock, createLotMock, deleteLotMock } = vi.hoisted(() => ({
  getHoldingsMock: vi.fn(),
  getAllocationMock: vi.fn(),
  getPnlMock: vi.fn(),
  createLotMock: vi.fn(),
  deleteLotMock: vi.fn(),
}))

vi.mock('@/services/api/holdings', () => ({
  holdingsApi: {
    getHoldings: getHoldingsMock,
    getAllocation: getAllocationMock,
    getPnl: getPnlMock,
    createLot: createLotMock,
    deleteLot: deleteLotMock,
  },
}))

vi.mock('@/components/layout/AppLayout.vue', () => ({
  default: { template: '<div><slot /></div>' },
}))

vi.mock('@/components/chart/DonutChart.vue', () => ({
  default: { template: '<div data-testid="donut-chart" />', props: ['segments'] },
}))

vi.mock('primevue/dialog', () => ({
  default: {
    template: '<div v-if="visible" data-testid="dialog"><slot /><slot name="footer" /></div>',
    props: ['visible'],
    emits: ['update:visible'],
  },
}))

const makeHolding = () => ({
  id: 'h-1',
  stockCode: '2330',
  stockName: '台積電',
  shares: 1000,
  avgCost: 600,
  boughtAt: '2024-01-01T00:00:00Z',
  earnedDividend: 2500,
  lots: [
    { id: 'lot-1', stockCode: '2330', buyTimestamp: '2024-01-01T00:00:00Z', buyPrice: 600, buyQuantity: 1000 },
  ],
})

const makeAllocation = (stockCode = '2330', totalCost = 600000) => ({
  stockCode,
  name: stockCode === '2330' ? '台積電' : '元大台灣50',
  totalCost,
})

beforeEach(() => {
  getHoldingsMock.mockResolvedValue({ data: [] })
  getAllocationMock.mockResolvedValue({ data: [] })
  getPnlMock.mockResolvedValue({
    data: { holdings: [], total: { totalCostBasis: 0, totalCurrentValue: 0, totalUnrealizedGain: 0, totalUnrealizedGainPct: 0 } },
  })
  createLotMock.mockResolvedValue({ data: {} })
  deleteLotMock.mockResolvedValue({ data: {} })
})

afterEach(() => vi.clearAllMocks())

describe('HoldingsPage', () => {
  it('初始載入時呼叫 getHoldings 與 getAllocation', async () => {
    mount(HoldingsPage)
    await flushPromises()
    expect(getHoldingsMock).toHaveBeenCalledTimes(1)
    expect(getAllocationMock).toHaveBeenCalledTimes(1)
  })

  it('無持股時顯示空狀態文字', async () => {
    const wrapper = mount(HoldingsPage)
    await flushPromises()
    expect(wrapper.text()).toContain('尚無持股記錄')
  })

  it('有持股時顯示彙總列', async () => {
    getHoldingsMock.mockResolvedValue({ data: [makeHolding()] })
    const wrapper = mount(HoldingsPage)
    await flushPromises()
    expect(wrapper.text()).toContain('2330')
    expect(wrapper.text()).toContain('台積電')
  })

  it('點擊彙總列後展開 lot 明細', async () => {
    getHoldingsMock.mockResolvedValue({ data: [makeHolding()] })
    const wrapper = mount(HoldingsPage)
    await flushPromises()
    // 找到彙總行按鈕（含股票代號文字）
    const expandBtn = wrapper.findAll('button').find((b) => b.text().includes('2330'))
    await expandBtn!.trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('刪除')
  })

  it('點擊刪除後需經確認對話框才呼叫 deleteLot 並重新整理', async () => {
    getHoldingsMock.mockResolvedValue({ data: [makeHolding()] })
    const wrapper = mount(HoldingsPage)
    await flushPromises()
    // 展開明細
    const expandBtn = wrapper.findAll('button').find((b) => b.text().includes('2330'))
    await expandBtn!.trigger('click')
    await flushPromises()
    // 點刪除 → 開啟確認對話框，尚未呼叫 API
    const deleteBtn = wrapper.findAll('button').find((b) => b.text() === '刪除')
    await deleteBtn!.trigger('click')
    await flushPromises()
    expect(deleteLotMock).not.toHaveBeenCalled()
    expect(wrapper.find('[data-testid="dialog"]').exists()).toBe(true)
    // 對話框內點「確定刪除」
    const confirmBtn = wrapper.findAll('[data-testid="dialog"] button').find((b) => b.text() === '確定刪除')
    await confirmBtn!.trigger('click')
    await flushPromises()
    expect(deleteLotMock).toHaveBeenCalledWith('lot-1')
  })

  it('表單驗證失敗時顯示錯誤訊息且不呼叫 API', async () => {
    const wrapper = mount(HoldingsPage)
    await flushPromises()
    const submitBtn = wrapper.findAll('button').find((b) => b.text().includes('新增持股'))
    await submitBtn!.trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('請完整填寫')
    expect(createLotMock).not.toHaveBeenCalled()
  })

  it('單檔配置時不顯示圓餅圖並顯示 100%', async () => {
    getAllocationMock.mockResolvedValue({ data: [makeAllocation()] })
    const wrapper = mount(HoldingsPage)
    await flushPromises()
    expect(wrapper.find('[data-testid="donut-chart"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('100%')
  })

  it('多檔配置時顯示 DonutChart', async () => {
    getAllocationMock.mockResolvedValue({
      data: [makeAllocation('2330', 600000), makeAllocation('0050', 300000)],
    })
    const wrapper = mount(HoldingsPage)
    await flushPromises()
    expect(wrapper.find('[data-testid="donut-chart"]').exists()).toBe(true)
  })
})
