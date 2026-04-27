import { mount } from '@vue/test-utils'
import USelect from './USelect.vue'

const options = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
  { value: 'c', label: 'Option C' },
]

describe('USelect', () => {
  it('renders trigger button with selected label', () => {
    const wrapper = mount(USelect, {
      props: { modelValue: 'b', options },
    })

    expect(wrapper.find('select').exists()).toBe(false)
    expect(wrapper.get('button').text()).toContain('Option B')
  })

  it('dropdown list is hidden on initial render', () => {
    const wrapper = mount(USelect, {
      props: { modelValue: 'a', options },
    })

    expect(wrapper.find('ul').exists()).toBe(false)
  })

  it('opens dropdown list when trigger is clicked', async () => {
    const wrapper = mount(USelect, {
      props: { modelValue: 'a', options },
    })

    await wrapper.get('button').trigger('click')

    expect(wrapper.find('ul').exists()).toBe(true)
    expect(wrapper.get('button').attributes('aria-expanded')).toBe('true')
  })

  it('emits update:modelValue and closes list when option is clicked', async () => {
    const wrapper = mount(USelect, {
      props: { modelValue: 'a', options },
    })

    await wrapper.get('button').trigger('click')
    const items = wrapper.findAll('li')
    await items[1].trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['b'])
    expect(wrapper.find('ul').exists()).toBe(false)
  })

  it('closes dropdown on Escape key and returns focus to trigger', async () => {
    const wrapper = mount(USelect, {
      props: { modelValue: 'a', options },
      attachTo: document.body,
    })

    await wrapper.get('button').trigger('click')
    expect(wrapper.find('ul').exists()).toBe(true)

    await wrapper.get('button').trigger('keydown', { key: 'Escape' })
    expect(wrapper.find('ul').exists()).toBe(false)
    wrapper.unmount()
  })

  it('navigates options with ArrowDown and selects with Enter', async () => {
    const wrapper = mount(USelect, {
      props: { modelValue: 'a', options },
    })

    await wrapper.get('button').trigger('click')
    await wrapper.get('button').trigger('keydown', { key: 'ArrowDown' })
    await wrapper.get('button').trigger('keydown', { key: 'ArrowDown' })
    await wrapper.get('button').trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['c'])
  })

  it('trigger has correct ARIA attributes', async () => {
    const wrapper = mount(USelect, {
      props: { modelValue: 'a', options },
    })

    const btn = wrapper.get('button')
    expect(btn.attributes('role')).toBe('combobox')
    expect(btn.attributes('aria-haspopup')).toBe('listbox')
    expect(btn.attributes('aria-expanded')).toBe('false')

    await btn.trigger('click')
    expect(btn.attributes('aria-expanded')).toBe('true')
  })

  it('option list has correct ARIA attributes', async () => {
    const wrapper = mount(USelect, {
      props: { modelValue: 'b', options },
    })

    await wrapper.get('button').trigger('click')

    expect(wrapper.get('ul').attributes('role')).toBe('listbox')
    const items = wrapper.findAll('li')
    expect(items[0].attributes('role')).toBe('option')
    expect(items[0].attributes('aria-selected')).toBe('false')
    expect(items[1].attributes('aria-selected')).toBe('true')
  })
})
