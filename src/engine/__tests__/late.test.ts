import { describe, expect, it } from 'vitest'
import { computeCycle } from '../index'
import type { CycleSettings, DailyLog } from '../types'

const settings: CycleSettings = {
  statedCycleLength: 28,
  statedPeriodLength: 5,
  statedConfidenceLow: false,
  predictionsPaused: false,
}

const periodStarts = [
  '2026-01-01',
  '2026-01-29',
  '2026-02-26',
  '2026-03-26',
  '2026-04-23',
  '2026-05-21',
]
const logs: DailyLog[] = periodStarts.map((date) => ({ date, periodStart: true }))
// Regular 28-day history -> predicted next period 2026-06-18, range +-1 day.

describe('late period', () => {
  it('is not late while still inside the predicted range', () => {
    const state = computeCycle(logs, settings, '2026-06-19')
    expect(state.daysUntilNextPeriod).toBe(-1)
    expect(state.isLate).toBe(false)
  })

  it('flags isLate once today is past the predicted date plus its range', () => {
    const state = computeCycle(logs, settings, '2026-06-25')
    expect(state.daysUntilNextPeriod).toBe(-7)
    expect(state.isLate).toBe(true)
    expect(state.phase).toBe('luteal')
  })
})
