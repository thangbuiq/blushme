import { describe, expect, it } from 'vitest'
import { computeCycle } from '../index'
import type { CycleSettings, DailyLog } from '../types'

const settings: CycleSettings = {
  statedCycleLength: 28,
  statedPeriodLength: 5,
  statedConfidenceLow: false,
  predictionsPaused: false,
}

describe('month, year and leap-year boundaries', () => {
  it('rolls a prediction over a year boundary', () => {
    const logs: DailyLog[] = [{ date: '2026-12-20', periodStart: true }]
    const state = computeCycle(logs, settings, '2026-12-21')
    expect(state.predictedNextPeriod.date).toBe('2027-01-17')
  })

  it('lands on February 29 in a leap year', () => {
    const logs: DailyLog[] = [{ date: '2028-02-01', periodStart: true }]
    const state = computeCycle(logs, settings, '2028-02-02')
    expect(state.predictedNextPeriod.date).toBe('2028-02-29')
  })

  it('does not land on February 29 the following (non-leap) year', () => {
    const logs: DailyLog[] = [{ date: '2029-02-01', periodStart: true }]
    const state = computeCycle(logs, settings, '2029-02-02')
    expect(state.predictedNextPeriod.date).toBe('2029-03-01')
  })
})
