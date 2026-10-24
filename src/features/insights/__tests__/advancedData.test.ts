import { describe, expect, it } from 'vitest'
import type { DailyLog } from '@/engine/types'
import {
  advancedTotals,
  bbtSeries,
  cycleDayOfLogs,
  moodHeat,
  mucusTally,
  symptomHeat,
} from '../advancedData'

const logs: DailyLog[] = [
  { date: '2026-01-01', periodStart: true, symptoms: ['cramps'], mood: 'sad', bbt: 36.4 },
  { date: '2026-01-03', symptoms: ['cramps', 'fatigue'] },
  { date: '2026-01-10', cervicalMucus: 'eggWhite', lhPositive: true, bbt: 36.3 },
  { date: '2026-01-29', periodStart: true, symptoms: ['cramps'], intimacy: true },
]

describe('advancedData', () => {
  it('returns bbt readings oldest first, capped to the latest N', () => {
    expect(bbtSeries(logs).map((p) => p.value)).toEqual([36.4, 36.3])
    expect(bbtSeries(logs, 1).map((p) => p.date)).toEqual(['2026-01-10'])
  })

  it('tallies mucus in fixed order including zeros', () => {
    expect(mucusTally(logs).map((m) => m.count)).toEqual([0, 0, 0, 1])
  })

  it('numbers days from the latest period start and skips logs before any start', () => {
    const days = cycleDayOfLogs([{ date: '2025-12-30' }, ...logs]).map((d) => d.day)
    expect(days).toEqual([1, 3, 10, 1])
  })

  it('buckets symptoms and moods by cycle week', () => {
    expect(symptomHeat(logs)[0]).toEqual({ key: 'cramps', counts: [3, 0, 0, 0], total: 3 })
    expect(moodHeat(logs)).toEqual([{ key: 'sad', counts: [1, 0, 0, 0], total: 1 }])
  })

  it('totals advanced fields', () => {
    expect(advancedTotals(logs)).toEqual({
      lhPositives: 1,
      intimacyDays: 1,
      bbtReadings: 2,
      mucusEntries: 1,
    })
  })
})
