import api from './index'
import type { AlertRule, Notification } from '@/types'

export type AlertNotificationsResponse = {
  data: Notification[]
  page: number
  limit: number
  total: number
  unread: number
  totalPages: number
}

export type CreateAlertRulePayload = {
  label: string
  type: string
  matchType?: string
  stockCode?: string
  channels?: string[]
  threshold?: number
  isOn?: boolean
}

export const alertsApi = {
  getNotifications: (params: { type?: string; page?: number }) =>
    api.get<AlertNotificationsResponse>('/alerts/notifications', { params }),

  readAllNotifications: () =>
    api.patch<{ ok: true; count: number }>('/alerts/notifications/read-all'),

  readNotification: (id: string) =>
    api.patch<{ ok: true }>(`/alerts/notifications/${id}/read`),

  getRules: () =>
    api.get<AlertRule[]>('/alerts/rules'),

  createRule: (payload: CreateAlertRulePayload) =>
    api.post<AlertRule>('/alerts/rules', payload),

  updateRule: (id: string, payload: Partial<CreateAlertRulePayload>) =>
    api.patch<AlertRule>(`/alerts/rules/${id}`, payload),

  deleteRule: (id: string) =>
    api.delete<{ ok: true }>(`/alerts/rules/${id}`),
}
