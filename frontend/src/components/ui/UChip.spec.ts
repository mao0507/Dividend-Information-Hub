import { mount } from '@vue/test-utils'
import UChip from './UChip.vue'

describe('UChip', () => {
  it('renders slot content', () => {
    const wrapper = mount(UChip, {
      slots: {
        default: '高股息',
      },
    })

    expect(wrapper.text()).toContain('高股息')
  })

  it('applies color and background style props', () => {
    const wrapper = mount(UChip, {
      props: {
        color: '#111111',
        bg: 'rgba(1,2,3,0.5)',
      },
      slots: {
        default: 'Tag',
      },
    })

    const style = wrapper.attributes('style')
    expect(style).toContain('color: rgb(17, 17, 17)')
    expect(style).toContain('background: rgba(1, 2, 3, 0.5)')
  })
})
