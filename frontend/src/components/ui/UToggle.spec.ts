import { mount } from '@vue/test-utils'
import UToggle from './UToggle.vue'

describe('UToggle', () => {
  it('emits update:modelValue on click', async () => {
    const wrapper = mount(UToggle, {
      props: {
        modelValue: false,
      },
    })

    await wrapper.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])
  })

  it('reflects aria-checked state', () => {
    const wrapper = mount(UToggle, {
      props: {
        modelValue: true,
      },
    })

    expect(wrapper.attributes('aria-checked')).toBe('true')
  })
})
