import { mount } from '@vue/test-utils'
import UButton from './UButton.vue'

describe('UButton', () => {
  it('renders slot and primary variant class', () => {
    const wrapper = mount(UButton, {
      props: {
        variant: 'primary',
      },
      slots: {
        default: '送出',
      },
    })

    expect(wrapper.text()).toContain('送出')
    expect(wrapper.classes()).toContain('bg-accent')
  })

  it('disables button while loading', () => {
    const wrapper = mount(UButton, {
      props: {
        loading: true,
      },
      slots: {
        default: '儲存',
      },
    })

    expect(wrapper.attributes('disabled')).toBeDefined()
    expect(wrapper.find('span.animate-spin').exists()).toBe(true)
  })
})
