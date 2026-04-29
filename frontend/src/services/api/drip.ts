import api from '../request'
import type { DripInput, DripResult } from '@/types'

export const dripApi = {
  calculate: (payload: DripInput) => api.post<DripResult>('/drip/calculate', payload),
}
