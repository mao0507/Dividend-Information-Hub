import { mount } from '@vue/test-utils'
import ThemedIcon from './ThemedIcon.vue'
import type { ThemedIconName } from './ThemedIcon.vue'

const sampleNames: ThemedIconName[] = [
  'magnifying-glass',
  'bolt',
  'check',
  'cog-6-tooth',
  'chevron-down',
]

describe('ThemedIcon', () => {
  it.each(sampleNames)('為 %s 渲染可見 SVG path', (name) => {
    const wrapper = mount(ThemedIcon, {
      props: { name, sizeClass: 'w-4 h-4' },
    })
    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.findAll('path').length).toBeGreaterThanOrEqual(1)
  })
})
