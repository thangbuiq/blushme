import { describe, expect, it } from 'vitest'
import { periodStartDates } from '../cycleLengths'
import type { DailyLog } from '../types'

const day = (date: string): DailyLog => ({ date, periodDay: true })

describe('periodStartDates with day-by-day logs', () => {
  it('treats the first marked day after a gap as the start', () => {
    const logs = [
      day('2026-09-01'),
      day('2026-09-02'),
      day('2026-09-03'),
      day('2026-09-29'),
      day('2026-09-30'),
    ]
    expect(periodStartDates(logs)).toEqual(['2026-09-01', '2026-09-29'])
  })

  it('moves the start back when an earlier day is filled in afterwards', () => {
    const logs = [day('2026-09-02'), day('2026-09-03'), day('2026-09-01')]
    expect(periodStartDates(logs)).toEqual(['2026-09-01'])
  })

  it('still reads legacy single-day period starts', () => {
    expect(periodStartDates([{ date: '2026-08-04', periodStart: true }])).toEqual(['2026-08-04'])
  })
})
