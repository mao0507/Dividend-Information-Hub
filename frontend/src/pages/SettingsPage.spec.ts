import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import SettingsPage from './SettingsPage.vue'

const { getSettingsMock, getBrokersMock, patchSyncMock, patchSettingsMock } = vi.hoisted(() => ({
  getSettingsMock: vi.fn(),
  getBrokersMock: vi.fn(),
  patchSyncMock: vi.fn(),
  patchSettingsMock: vi.fn(),
}))

vi.mock('@/api/settings', () => ({
  settingsApi: {
    getSettings: getSettingsMock,
    getBrokers: getBrokersMock,
    patchSync: patchSyncMock,
    patchSettings: patchSettingsMock,
    linkBroker: vi.fn(),
  },
}))

vi.mock('@/stores/tweaks', () => ({
  useTweaksStore: () => ({
    setAll: vi.fn(),
  }),
}))

/**
 * 等待元件掛載後的非同步初始化。
 * @returns Promise<void>
 */
const flushAll = async (): Promise<void> => {
  await Promise.resolve()
  await Promise.resolve()
  await nextTick()
}

describe('SettingsPage themed controls', () => {
  beforeEach(() => {
    patchSyncMock.mockReset()
    patchSettingsMock.mockReset()
    getSettingsMock.mockResolvedValue({
      data: {
        accent: '#22c55e',
        upRed: true,
        density: 'cozy',
        monoFont: 'JetBrains Mono',
        sansFont: 'Inter',
        radius: 10,
      },
    })
    getBrokersMock.mockResolvedValue({ data: [] })
    patchSyncMock.mockResolvedValue({
      data: {
        autoSync: false,
        positions: true,
        dividends: true,
        profile: false,
        notifications: true,
      },
    })
    patchSettingsMock.mockResolvedValue({
      data: {
        accent: '#22c55e',
        upRed: false,
        density: 'cozy',
        monoFont: 'JetBrains Mono',
        sansFont: 'Inter',
        radius: 10,
      },
    })
  })

  it('applies themed classes to select and checkbox controls', async () => {
    const wrapper = mount(SettingsPage, {
      global: {
        stubs: {
          AppLayout: { template: '<div><slot /></div>' },
        },
      },
    })
    await flushAll()

    const checkbox = wrapper.get('input[type="checkbox"]')
    expect(checkbox.classes()).toContain('appearance-none')
    expect(checkbox.classes()).toContain('checked:bg-accent')

    const appearanceButton = wrapper
      .findAll('button')
      .find((btn) => btn.text() === '外觀')
    expect(appearanceButton).toBeTruthy()
    await appearanceButton!.trigger('click')
    await nextTick()

    const select = wrapper.get('select')
    expect(select.classes()).toContain('focus-visible:ring-2')
    expect(select.classes()).toContain('disabled:cursor-not-allowed')
  })

  it('calls patchSync when checkbox toggles', async () => {
    const wrapper = mount(SettingsPage, {
      global: {
        stubs: {
          AppLayout: { template: '<div><slot /></div>' },
        },
      },
    })
    await flushAll()

    await wrapper.get('input[type="checkbox"]').setValue(false)
    expect(patchSyncMock).toHaveBeenCalledTimes(1)
  })

  it('keeps upRed as boolean when saving after select change', async () => {
    const wrapper = mount(SettingsPage, {
      global: {
        stubs: {
          AppLayout: { template: '<div><slot /></div>' },
        },
      },
    })
    await flushAll()

    const appearanceButton = wrapper
      .findAll('button')
      .find((btn) => btn.text() === '外觀')
    expect(appearanceButton).toBeTruthy()
    await appearanceButton!.trigger('click')
    await nextTick()

    const upColorSelect = wrapper.findAll('select')[0]
    await upColorSelect.setValue('false')

    const saveButton = wrapper.findAll('button').find((btn) => btn.text() === '儲存設定')
    expect(saveButton).toBeTruthy()
    await saveButton!.trigger('click')

    expect(patchSettingsMock).toHaveBeenCalled()
    expect(patchSettingsMock.mock.calls[0][0].upRed).toBe(false)
    expect(typeof patchSettingsMock.mock.calls[0][0].upRed).toBe('boolean')
  })
})
