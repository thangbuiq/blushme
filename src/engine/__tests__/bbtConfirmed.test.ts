import { describe, expect, it } from 'vitest'
import { computeCycle } from '../index'
import type { CycleSettings, DailyLog } from '../types'

const settings: CycleSettings = {
  statedCycleLength: 28,
  statedPeriodLength: 5,
  statedConfidenceLow: false,
  predictionsPaused: false,
}

function bbtLog(date: string, bbt: number): DailyLog {
  return { date, bbt }
}

describe('BBT-confirmed ovulation', () => {
  it('overrides the calendar estimate with the day the sustained rise begins', () => {
    const logs: DailyLog[] = [
      // three prior regular 28-day cycles, so this isn't a cold start
      { date: '2025-10-09', periodStart: true },
      { date: '2025-11-06', periodStart: true },
      { date: '2025-12-04', periodStart: true },
      { date: '2026-01-01', periodStart: true },
      // six-day low baseline
      bbtLog('2026-01-10', 36.4),
      bbtLog('2026-01-11', 36.5),
      bbtLog('2026-01-12', 36.4),
      bbtLog('2026-01-13', 36.5),
      bbtLog('2026-01-14', 36.4),
      bbtLog('2026-01-15', 36.5),
      // sustained rise of >=0.2C starting 2026-01-16
      bbtLog('2026-01-16', 36.7),
      bbtLog('2026-01-17', 36.8),
      bbtLog('2026-01-18', 36.7),
    ]

    const state = computeCycle(logs, settings, '2026-01-18')

    expect(state.ovulation.date).toBe('2026-01-16')
    expect(state.ovulation.confirmed).toBe(true)
    expect(state.ovulation.method).toBe('bbt')
    expect(state.fertileWindow.start).toBe('2026-01-11')
    expect(state.fertileWindow.end).toBe('2026-01-17')
    expect(state.confidence).not.toBe('low')
  })

  it('falls back to the calendar estimate when no BBT or LH data confirms ovulation', () => {
    const logs: DailyLog[] = [
      { date: '2026-01-01', periodStart: true },
      { date: '2026-01-29', periodStart: true },
      { date: '2026-02-26', periodStart: true },
      { date: '2026-03-26', periodStart: true },
    ]

    const state = computeCycle(logs, settings, '2026-04-01')
    expect(state.ovulation.method).toBe('calendar')
    expect(state.ovulation.confirmed).toBe(false)
  })
})
