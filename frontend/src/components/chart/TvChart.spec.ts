import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import type { OhlcvPoint } from '@/types'

const {
  mockSetData,
  mockSetMarkers,
  mockApplyOptions,
  mockFitContent,
  mockRemove,
  mockAddCandlestickSeries,
  mockAddHistogramSeries,
  mockPriceScale,
  mockCreateChart,
} = vi.hoisted(() => {
  const mockSetData = vi.fn()
  const mockSetMarkers = vi.fn()
  const mockApplyOptions = vi.fn()
  const mockFitContent = vi.fn()
  const mockRemove = vi.fn()

  const mockAddCandlestickSeries = vi.fn(() => ({
    setData: mockSetData,
    setMarkers: mockSetMarkers,
    applyOptions: mockApplyOptions,
  }))
  const mockAddHistogramSeries = vi.fn(() => ({
    setData: mockSetData,
    applyOptions: mockApplyOptions,
  }))
  const mockPriceScale = vi.fn(() => ({ applyOptions: mockApplyOptions }))
  const mockCreateChart = vi.fn(() => ({
    applyOptions: mockApplyOptions,
    addCandlestickSeries: mockAddCandlestickSeries,
    addHistogramSeries: mockAddHistogramSeries,
    priceScale: mockPriceScale,
    timeScale: () => ({ fitContent: mockFitContent }),
    remove: mockRemove,
  }))

  return {
    mockSetData, mockSetMarkers, mockApplyOptions, mockFitContent, mockRemove,
    mockAddCandlestickSeries, mockAddHistogramSeries, mockPriceScale, mockCreateChart,
  }
})

vi.mock('lightweight-charts', () => ({ createChart: mockCreateChart }))

const makeCandles = (n = 5): OhlcvPoint[] =>
  ['2026-01-05', '2026-01-06', '2026-01-07', '2026-01-08', '2026-01-09']
    .slice(0, n)
    .map((date, i) => ({
      date,
      open: 100 + i,
      high: 102 + i,
      low: 99 + i,
      close: 101 + i,
      volume: 1000 + i * 100,
    }))

class MockResizeObserver {
  observe = vi.fn()
  disconnect = vi.fn()
  constructor(public cb?: ResizeObserverCallback) {}
}

describe('TvChart', () => {
  let clientWidthSpy: ReturnType<typeof vi.spyOn>
  let clientHeightSpy: ReturnType<typeof vi.spyOn>

  beforeEach(async () => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver
    clientWidthSpy = vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(800)
    clientHeightSpy = vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(280)
  })

  afterEach(() => {
    clientWidthSpy.mockRestore()
    clientHeightSpy.mockRestore()
  })

  const importComponent = async () => (await import('./TvChart.vue')).default

  it('calls createChart on mount when candles are provided', async () => {
    const TvChart = await importComponent()
    mount(TvChart, { props: { candles: makeCandles() } })
    await flushPromises()
    expect(mockCreateChart).toHaveBeenCalledTimes(1)
  })

  it('does not call createChart when candles is empty', async () => {
    const TvChart = await importComponent()
    mount(TvChart, { props: { candles: [] } })
    await flushPromises()
    expect(mockCreateChart).not.toHaveBeenCalled()
  })

  it('calls setData with mapped candle data after createChart', async () => {
    const TvChart = await importComponent()
    const candles = makeCandles(3)
    mount(TvChart, { props: { candles } })
    await flushPromises()
    expect(mockSetData).toHaveBeenCalled()
    const firstCall = mockSetData.mock.calls[0][0] as unknown[]
    expect(firstCall).toHaveLength(3)
    expect(firstCall[0]).toMatchObject({ time: '2026-01-05', open: 100 })
  })

  it('passes red upColor when tweaks.upRed=true', async () => {
    const { useTweaksStore } = await import('@/stores/tweaks')
    const tweaks = useTweaksStore()
    tweaks.settings.upRed = true

    const TvChart = await importComponent()
    mount(TvChart, { props: { candles: makeCandles() } })
    await flushPromises()

    const opts = mockAddCandlestickSeries.mock.calls[0][0] as Record<string, string>
    expect(opts.upColor).toBe('#ef4444')
    expect(opts.downColor).toBe('#22c55e')
  })

  it('passes green upColor when tweaks.upRed=false', async () => {
    const { useTweaksStore } = await import('@/stores/tweaks')
    const tweaks = useTweaksStore()
    tweaks.settings.upRed = false

    const TvChart = await importComponent()
    mount(TvChart, { props: { candles: makeCandles() } })
    await flushPromises()

    const opts = mockAddCandlestickSeries.mock.calls[0][0] as Record<string, string>
    expect(opts.upColor).toBe('#22c55e')
    expect(opts.downColor).toBe('#ef4444')
  })

  it('calls chart.remove on unmount', async () => {
    const TvChart = await importComponent()
    const wrapper = mount(TvChart, { props: { candles: makeCandles() } })
    await flushPromises()
    wrapper.unmount()
    expect(mockRemove).toHaveBeenCalledTimes(1)
  })

  it('calls ResizeObserver.observe on mount and disconnect on unmount', async () => {
    let roInstance: MockResizeObserver | null = null
    class TrackingResizeObserver extends MockResizeObserver {
      constructor(cb?: ResizeObserverCallback) { super(cb); roInstance = this }
    }
    global.ResizeObserver = TrackingResizeObserver as unknown as typeof ResizeObserver

    const TvChart = await importComponent()
    const wrapper = mount(TvChart, { props: { candles: makeCandles() } })
    await flushPromises()
    expect(roInstance?.observe).toHaveBeenCalled()
    wrapper.unmount()
    expect(roInstance?.disconnect).toHaveBeenCalled()
  })

  it('passes autoSize to createChart for container-bound sizing', async () => {
    const TvChart = await importComponent()
    mount(TvChart, { props: { candles: makeCandles() } })
    await flushPromises()
    const opts = mockCreateChart.mock.calls[0][1] as Record<string, boolean>
    expect(opts.autoSize).toBe(true)
  })

  it('shows loading overlay when loading=true and candles empty', async () => {
    const TvChart = await importComponent()
    const wrapper = mount(TvChart, { props: { candles: [], loading: true } })
    await flushPromises()
    expect(wrapper.find('.animate-pulse').exists()).toBe(true)
  })

  it('shows empty message when candles empty and not loading', async () => {
    const TvChart = await importComponent()
    const wrapper = mount(TvChart, { props: { candles: [], loading: false } })
    await flushPromises()
    expect(wrapper.text()).toContain('尚無 K 線資料')
  })

  it('hides loading and empty overlays when candles are provided', async () => {
    const TvChart = await importComponent()
    const wrapper = mount(TvChart, { props: { candles: makeCandles() } })
    await flushPromises()
    expect(wrapper.find('.animate-pulse').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('尚無 K 線資料')
  })

  it('shows empty message when candles are all invalid', async () => {
    const TvChart = await importComponent()
    const wrapper = mount(TvChart, {
      props: { candles: [{ invalid: true }] as unknown as OhlcvPoint[] },
    })
    await flushPromises()
    expect(wrapper.text()).toContain('尚無 K 線資料')
  })

  it('renders only dates with valid candle data', async () => {
    const TvChart = await importComponent()
    const mixed = [
      { date: '2026-01-05', open: 100, high: 101, low: 99, close: 100, volume: 1 },
      { date: '2026-01-06', open: 100, high: 101, low: 99, close: 0, volume: 1 },
      { date: '2026-01-07', open: 101, high: 102, low: 100, close: 101, volume: 2 },
    ] as unknown as OhlcvPoint[]
    mount(TvChart, { props: { candles: mixed } })
    await flushPromises()
    const firstCall = mockSetData.mock.calls[0][0] as Array<{ time: string }>
    expect(firstCall.map((x) => x.time)).toEqual(['2026-01-05', '2026-01-07'])
  })

  it('keeps chart visible when dataset contains one bad candle', async () => {
    const TvChart = await importComponent()
    const mixed = [
      { date: '2026-01-05', open: 100, high: 101, low: 99, close: 100, volume: 1 },
      { date: '2026-01-06', open: 0, high: 0, low: 0, close: 0, volume: 0 },
      { date: '2026-01-07', open: 101, high: 102, low: 100, close: 101, volume: 2 },
    ] as unknown as OhlcvPoint[]
    const wrapper = mount(TvChart, { props: { candles: mixed } })
    await flushPromises()
    expect(wrapper.text()).not.toContain('尚無 K 線資料')
    expect(mockSetData).toHaveBeenCalled()
  })

  it('filters out dates in twseClosedDates prop', async () => {
    const TvChart = await importComponent()
    const candles = [
      { date: '2026-01-05', open: 100, high: 101, low: 99, close: 100, volume: 1 },
      { date: '2026-01-06', open: 101, high: 102, low: 100, close: 101, volume: 1 },
    ] as unknown as OhlcvPoint[]
    mount(TvChart, {
      props: { candles, twseClosedDates: ['2026-01-06'] },
    })
    await flushPromises()
    const firstCall = mockSetData.mock.calls[0][0] as Array<{ time: string }>
    expect(firstCall.map((x) => x.time)).toEqual(['2026-01-05'])
  })

  it('defers createChart until container has non-zero size', async () => {
    clientWidthSpy.mockReturnValue(0)
    const TvChart = await importComponent()
    let roInstance: MockResizeObserver | null = null
    class TrackingResizeObserver extends MockResizeObserver {
      constructor(cb?: ResizeObserverCallback) {
        super(cb)
        roInstance = this
      }
    }
    global.ResizeObserver = TrackingResizeObserver as unknown as typeof ResizeObserver

    mount(TvChart, { props: { candles: makeCandles() } })
    await flushPromises()
    expect(mockCreateChart).not.toHaveBeenCalled()

    clientWidthSpy.mockReturnValue(800)
    roInstance?.cb?.(
      [{ contentRect: { width: 800, height: 280 } } as ResizeObserverEntry],
      {} as ResizeObserver,
    )
    await flushPromises()
    expect(mockCreateChart).toHaveBeenCalledTimes(1)
  })
})
