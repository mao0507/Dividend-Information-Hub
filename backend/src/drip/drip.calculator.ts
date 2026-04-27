/**
 * 單一年度列點（年底快照）
 */
export type DripYearPoint = {
  year: number
  assetsWithReinvest: number
  assetsWithoutReinvest: number
  annualDividendWithReinvest: number
  annualDividendWithoutReinvest: number
}

/**
 * DRIP 試算回應
 */
export type DripCalculateResult = {
  series: DripYearPoint[]
  /** 資產（含再投入）首次達初始本金 2 倍之年份；未達成則為 null */
  targetAchievementYear: number | null
  /** 最後一年度之稅後股息合計（再投入路徑） */
  finalYearAnnualDividend: number
  /** 最後一年月均稅後股息（finalYearAnnualDividend / 12） */
  averageMonthlyIncome: number
}

export type DripCalcParams = {
  principal: number
  monthlyAdd: number
  dividendYieldPercent: number
  growthPercent: number
  years: number
  taxRatePercent: number
}

const round2 = (n: number): number => Math.round(n * 100) / 100

/**
 * 月頻率模擬再投入與領出兩路徑，彙總為年度序列。
 * @param p 試算參數（百分比皆為 0–100）
 * @returns 年度資產、年息與摘要欄位
 */
export const computeDripProjection = (p: DripCalcParams): DripCalculateResult => {
  const { principal, monthlyAdd, dividendYieldPercent, growthPercent, years, taxRatePercent } = p
  let balanceWith = principal
  let balanceWithout = principal
  let cashWithdrawn = 0
  let yearDivWith = 0
  let yearDivWithout = 0
  const series: DripYearPoint[] = []
  const taxFactor = 1 - taxRatePercent / 100
  const milestone = principal > 0 ? principal * 2 : null

  for (let month = 0; month < years * 12; month++) {
    const yearIndex = Math.floor(month / 12)
    const monthlyRate =
      (dividendYieldPercent / 100) * Math.pow(1 + growthPercent / 100, yearIndex) / 12

    const divGrossWith = balanceWith * monthlyRate
    const divNetWith = divGrossWith * taxFactor
    yearDivWith += divNetWith
    balanceWith += monthlyAdd + divNetWith

    const divGrossWithout = balanceWithout * monthlyRate
    const divNetWithout = divGrossWithout * taxFactor
    yearDivWithout += divNetWithout
    cashWithdrawn += divNetWithout
    balanceWithout += monthlyAdd

    if ((month + 1) % 12 === 0) {
      series.push({
        year: yearIndex + 1,
        assetsWithReinvest: round2(balanceWith),
        assetsWithoutReinvest: round2(balanceWithout + cashWithdrawn),
        annualDividendWithReinvest: round2(yearDivWith),
        annualDividendWithoutReinvest: round2(yearDivWithout),
      })
      yearDivWith = 0
      yearDivWithout = 0
    }
  }

  const lastRow = series[series.length - 1]
  const finalYearAnnualDividend = lastRow?.annualDividendWithReinvest ?? 0
  const averageMonthlyIncome = round2(finalYearAnnualDividend / 12)

  let targetAchievementYear: number | null = null
  if (milestone != null) {
    const hit = series.find((row) => row.assetsWithReinvest >= milestone)
    targetAchievementYear = hit ? hit.year : null
  }

  return {
    series,
    targetAchievementYear,
    finalYearAnnualDividend,
    averageMonthlyIncome,
  }
}
