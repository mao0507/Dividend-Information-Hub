import api from '../request'
import type { BrokerLink, SyncPreference, UserSettings } from '@/types'

export const settingsApi = {
  getSettings: () =>
    api.get<UserSettings>('/settings'),

  patchSettings: (payload: Partial<{
    accent: string
    upRed: boolean
    density: string
    monoFont: string
    sansFont: string
    radius: number
  }>) => api.patch<UserSettings>('/settings', payload),

  getBrokers: () =>
    api.get<BrokerLink[]>('/settings/brokers'),

  linkBroker: (payload: { broker: string; account?: string }) =>
    api.post<BrokerLink>('/settings/brokers/link', payload),

  deleteBroker: (id: string) =>
    api.delete<{ ok: true }>(`/settings/brokers/${id}`),

  patchSync: (payload: Partial<SyncPreference>) =>
    api.patch<SyncPreference>('/settings/sync', payload),
}
