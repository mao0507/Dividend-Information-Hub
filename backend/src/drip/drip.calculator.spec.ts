import { computeDripProjection } from './drip.calculator'

describe('computeDripProjection', () => {
  it('returns yearly series and summary fields', () => {
    const result = computeDripProjection({
      principal: 100000,
      monthlyAdd: 5000,
      dividendYieldPercent: 6,
      growthPercent: 2,
      years: 5,
      taxRatePercent: 28.6,
    })

    expect(result.series).toHaveLength(5)
    expect(result.series[0].year).toBe(1)
    expect(result.series[4].year).toBe(5)
    expect(result.finalYearAnnualDividend).toBe(result.series[4].annualDividendWithReinvest)
    expect(result.averageMonthlyIncome).toBeCloseTo(result.finalYearAnnualDividend / 12, 2)
  })

  it('with reinvest should not underperform without reinvest path', () => {
    const result = computeDripProjection({
      principal: 600000,
      monthlyAdd: 10000,
      dividendYieldPercent: 7,
      growthPercent: 3,
      years: 10,
      taxRatePercent: 10,
    })

    const last = result.series[result.series.length - 1]
    expect(last.assetsWithReinvest).toBeGreaterThanOrEqual(last.assetsWithoutReinvest)
  })

  it('returns null target year when principal is zero', () => {
    const result = computeDripProjection({
      principal: 0,
      monthlyAdd: 0,
      dividendYieldPercent: 5,
      growthPercent: 0,
      years: 3,
      taxRatePercent: 0,
    })

    expect(result.targetAchievementYear).toBeNull()
  })
})
