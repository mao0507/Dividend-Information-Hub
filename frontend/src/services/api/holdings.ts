import api from '../request'

export interface HoldingLotItem {
  id: string
  stockCode: string
  buyTimestamp: string
  buyPrice: number
  buyQuantity: number
}

export interface HoldingWithLots {
  id: string
  stockCode: string
  stockName: string
  shares: number
  avgCost: number
  boughtAt: string
  earnedDividend: number
  lots: HoldingLotItem[]
}

export interface AllocationItem {
  stockCode: string
  name: string
  totalCost: number
}

export interface CreateLotPayload {
  stockCode: string
  buyTimestamp: string
  buyPrice: number
  buyQuantity: number
}

export interface HoldingPnlItem {
  stockCode: string
  costBasis: number
  currentValue: number | null
  unrealizedGain: number | null
  unrealizedGainPct: number | null
  priceUnavailableReason: 'priceUnavailable' | null
}

export interface PnlTotal {
  totalCostBasis: number
  totalCurrentValue: number
  totalUnrealizedGain: number
  totalUnrealizedGainPct: number
}

export interface PnlResult {
  holdings: HoldingPnlItem[]
  total: PnlTotal
}

/**
 * 持股管理 API。
 */
export const holdingsApi = {
  /**
   * 新增買入批次。
   * @param payload 買入資料
   * @returns 建立完成的批次
   */
  createLot: (payload: CreateLotPayload) =>
    api.post<HoldingLotItem>('/holdings/lots', payload),

  /**
   * 刪除買入批次。
   * @param id 批次 ID
   */
  deleteLot: (id: string) =>
    api.delete(`/holdings/lots/${id}`),

  /**
   * 取得所有持股彙總與批次明細。
   * @returns 持股列表
   */
  getHoldings: () =>
    api.get<HoldingWithLots[]>('/holdings'),

  /**
   * 取得投資金額占比資料（百分比由前端計算）。
   * @returns 各股投資金額列表
   */
  getAllocation: () =>
    api.get<AllocationItem[]>('/holdings/allocation'),

  /**
   * 取得未實現損益（各檔持股與投資組合總計）。
   * @returns 未實現損益資料
   */
  getPnl: () =>
    api.get<PnlResult>('/holdings/pnl'),
}
