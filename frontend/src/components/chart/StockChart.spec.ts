import { mount } from '@vue/test-utils'
import StockChart from './StockChart.vue'

describe('StockChart', () => {
  it('renders svg with given width and height props', () => {
    const wrapper = mount(StockChart, {
      props: {
        width: 640,
        height: 240,
        series: [100, 102, 101, 103, 104, 105],
      },
    })

    const svg = wrapper.find('svg')
    expect(svg.attributes('width')).toBe('640')
    expect(svg.attributes('height')).toBe('240')
  })

  it('renders line path and fill path', () => {
    const wrapper = mount(StockChart, {
      props: {
        series: [100, 101, 102, 103, 104],
        showGrid: false,
        showCrosshair: false,
      },
    })

    const paths = wrapper.findAll('path')
    expect(paths.length).toBeGreaterThanOrEqual(2)
    expect(paths[0].attributes('d')).toContain('M')
  })
})
