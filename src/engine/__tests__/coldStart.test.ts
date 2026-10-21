import { describe, expect, it } from 'vitest'
import { coldStartEstimate } from '../coldStart'
import { computeCycle } from '../index'
import type { CycleSettings, DailyLog } from '../types'

const settings: CycleSettings = {
  statedCycleLength: 30,
  statedPeriodLength: 5,
  statedConfidenceLow: false,
  predictionsPaused: false,
}

describe('cold start blending', () => {
  it('with zero observed cycles, falls back entirely to the stated length', () => {
    const { mean } = coldStartEstimate([], 30)
    expect(mean).toBe(30)
  })

  it('blends one observed cycle with the stated length per (n*mean_obs + (3-n)*stated)/3', () => {
    const { mean } = coldStartEstimate([26], 30)
    expect(mean).toBeCloseTo((1 * 26 + 2 * 30) / 3, 6)
  })

  it('blends two observed cycles, weighting the stated length less', () => {
    const { mean, stdDev } = coldStartEstimate([26, 30], 30)
    expect(mean).toBeCloseTo((2 * 28 + 1 * 30) / 3, 6)
    expect(stdDev).toBeCloseTo(2, 6) // sample stdev of [26, 30] around mean 28
  })

  it('marks confidence low and uses the blended estimate end-to-end via computeCycle', () => {
    const logs: DailyLog[] = [
      { date: '2026-01-01', periodStart: true },
      { date: '2026-01-27', periodStart: true },
    ]
    const state = computeCycle(logs, settings, '2026-02-01')

    expect(state.math.coldStart).toBe(true)
    expect(state.confidence).toBe('low')
    // mean_obs=26 (one valid cycle), blended with stated=30: (1*26+2*30)/3
    expect(state.math.weightedMean).toBeNull()
    expect(state.predictedNextPeriod.date).toBe('2026-02-25') // last start + round(28.67) = 29 days
  })
})
