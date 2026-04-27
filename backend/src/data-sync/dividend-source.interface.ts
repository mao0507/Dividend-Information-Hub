export interface DividendRecord {
  stockCode: string
  year: number
  cash: number
  exDate: Date | null
  payDate?: Date | null
  freq?: string
}

export interface DividendSource {
  readonly name: string
  /**
   * 從此資料源取得最近配息記錄
   * @param trackedCodes DB 中已追蹤的股票代號集合
   * @returns 配息記錄陣列；失敗時 throw（由 DividendSyncService 處理 fallback）
   */
  sync(trackedCodes: Set<string>): Promise<DividendRecord[]>
}
