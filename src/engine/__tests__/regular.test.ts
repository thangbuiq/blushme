import { describe, expect, it } from 'vitest'
import { computeCycle } from '../index'
import type { CycleSettings, DailyLog } from '../types'

const settings: CycleSettings = {
  statedCycleLength: 28,
  statedPeriodLength: 5,
  statedConfidenceLow: false,
  predictionsPaused: false,
}

// Six consecutive 28-day cycles: a textbook regular pattern.
const periodStarts = [
  '2026-01-01',
  '2026-01-29',
  '2026-02-26',
  '2026-03-26',
  '2026-04-23',
  '2026-05-21',
  '2026-06-18',
]

const logs: DailyLog[] = periodStarts.map((date) => ({ date, periodStart: true }))

describe('regular cycle', () => {
  it('predicts exactly one mean-length cycle ahead with a tight range', () => {
    const state = computeCycle(logs, settings, '2026-07-01')

    expect(state.math.coldStart).toBe(false)
    expect(state.math.weightedMean).toBeCloseTo(28, 5)
    expect(state.math.weightedStdDev).toBeCloseTo(0, 5)
    expect(state.predictedNextPeriod.date).toBe('2026-07-16')
    expect(state.predictedNextPeriod.rangeDays).toBe(1)
    expect(state.confidence).toBe('high')
    expect(state.math.excludedCycles).toHaveLength(0)
  })

  it('tracks day of cycle and menstrual phase from the most recent period start', () => {
    const state = computeCycle(logs, settings, '2026-06-20')
    expect(state.dayOfCycle).toBe(3)
    expect(state.phase).toBe('menstrual')
  })
})
