import { describe, expect, it } from 'vitest'
import { computeCycle } from '../index'
import type { CycleSettings, DailyLog } from '../types'

const settings: CycleSettings = {
  statedCycleLength: 28,
  statedPeriodLength: 5,
  statedConfidenceLow: false,
  predictionsPaused: false,
}

// Four cycles, all within the valid [21, 45] range individually, but swinging
// widely in length (21/35/22/38 days) — a real pattern, just an irregular one.
const periodStarts = ['2026-01-01', '2026-01-22', '2026-02-26', '2026-03-20', '2026-04-27']

const logs: DailyLog[] = periodStarts.map((date) => ({ date, periodStart: true }))

describe('irregular cycle', () => {
  it('computes a weighted mean/stdDev that matches the documented formula', () => {
    const state = computeCycle(logs, settings, '2026-05-01')

    const lengths = [21, 35, 22, 38] // chronological, most recent last
    const weights = [0.8 ** 3, 0.8 ** 2, 0.8 ** 1, 0.8 ** 0]
    const totalWeight = weights.reduce((a, b) => a + b, 0)
    const expectedMean = lengths.reduce((sum, len, i) => sum + len * weights[i], 0) / totalWeight
    const expectedVariance =
      lengths.reduce((sum, len, i) => sum + weights[i] * (len - expectedMean) ** 2, 0) / totalWeight
    const expectedStdDev = Math.sqrt(expectedVariance)

    expect(state.math.coldStart).toBe(false)
    expect(state.math.weightedMean).toBeCloseTo(expectedMean, 6)
    expect(state.math.weightedStdDev).toBeCloseTo(expectedStdDev, 6)
  })

  it('widens the range and drops confidence to low when stdDev exceeds 7 days', () => {
    const state = computeCycle(logs, settings, '2026-05-01')

    expect(state.math.weightedStdDev as number).toBeGreaterThan(7)
    expect(state.predictedNextPeriod.rangeDays).toBeGreaterThan(1)
    expect(state.confidence).toBe('low')
  })
})
