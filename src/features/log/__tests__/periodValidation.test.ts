import { describe, expect, it } from 'vitest'
import type { DailyLog } from '@/engine/types'
import { isContinuingPeriod, isSuspiciouslyEarly, periodDayNumber } from '../periodValidation'

describe('isContinuingPeriod', () => {
  it('is false when the day before has no logged flow', () => {
    const logs: DailyLog[] = []
    expect(isContinuingPeriod('2026-03-05', logs)).toBe(false)
  })

  it('is true when the day before has flow logged', () => {
    const logs: DailyLog[] = [{ date: '2026-03-04', flow: 2 }]
    expect(isContinuingPeriod('2026-03-05', logs)).toBe(true)
  })

  it('is true when the day before is flagged as a period start', () => {
    const logs: DailyLog[] = [{ date: '2026-03-04', periodStart: true }]
    expect(isContinuingPeriod('2026-03-05', logs)).toBe(true)
  })

  it('is false when the day before has flow logged as zero', () => {
    const logs: DailyLog[] = [{ date: '2026-03-04', flow: 0 }]
    expect(isContinuingPeriod('2026-03-05', logs)).toBe(false)
  })
})

describe('periodDayNumber', () => {
  it('is day 1 when nothing precedes it', () => {
    const logs: DailyLog[] = []
    expect(periodDayNumber('2026-03-05', logs)).toBe(1)
  })

  it('counts back through a consecutive run of logged period days', () => {
    const logs: DailyLog[] = [
      { date: '2026-03-01', periodStart: true, flow: 2 },
      { date: '2026-03-02', flow: 3 },
      { date: '2026-03-03', flow: 2 },
    ]
    expect(periodDayNumber('2026-03-04', logs)).toBe(4)
  })

  it('stops counting at a gap day with no logged flow', () => {
    const logs: DailyLog[] = [
      { date: '2026-03-01', periodStart: true, flow: 2 },
      { date: '2026-03-02', flow: 0 },
    ]
    expect(periodDayNumber('2026-03-03', logs)).toBe(1)
  })
})

describe('isSuspiciouslyEarly', () => {
  it('is false with no prior period starts', () => {
    expect(isSuspiciouslyEarly('2026-03-05', [])).toBe(false)
  })

  it('is true when fewer than 21 days since the previous period start', () => {
    const logs: DailyLog[] = [{ date: '2026-03-01', periodStart: true }]
    expect(isSuspiciouslyEarly('2026-03-15', logs)).toBe(true)
  })

  it('is false when 21 or more days since the previous period start', () => {
    const logs: DailyLog[] = [{ date: '2026-03-01', periodStart: true }]
    expect(isSuspiciouslyEarly('2026-03-22', logs)).toBe(false)
  })
})
