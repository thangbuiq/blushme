import { addDays, formatISO, parseISO } from 'date-fns'
import type { DailyLog } from '@/engine/types'
import { moodsOf } from '@/features/log/moods'

export interface Tally {
  key: string
  count: number
}

export type Regularity = 'steady' | 'fairlySteady' | 'variable'

/**
 * Average number of consecutive bleeding days per logged period. Periods recorded
 * as just a start date carry no length, so they are skipped; null when none do.
 */
export function averagePeriodLength(logs: DailyLog[]): number | null {
  const bleeding = new Set(
    logs.filter((l) => l.periodStart || (l.flow ?? 0) > 0).map((l) => l.date),
  )
  const lengths = logs
    .filter((l) => l.periodStart)
    .map((start) => {
      let days = 1
      let cursor = parseISO(start.date)
      for (;;) {
        cursor = addDays(cursor, 1)
        if (!bleeding.has(formatISO(cursor, { representation: 'date' }))) break
        days += 1
      }
      return days
    })
  const measured = lengths.filter((n) => n > 1)
  if (measured.length === 0) return null
  return Math.round((measured.reduce((a, b) => a + b, 0) / measured.length) * 10) / 10
}

/** Counts of symptoms or moods across all logs, most frequent first. */
export function tallySymptoms(logs: DailyLog[], limit = 4): Tally[] {
  const counts = new Map<string, number>()
  for (const log of logs)
    for (const s of log.symptoms ?? []) counts.set(s, (counts.get(s) ?? 0) + 1)
  return rank(counts, limit)
}

export function tallyMoods(logs: DailyLog[], limit = 3): Tally[] {
  const counts = new Map<string, number>()
  for (const log of logs) for (const m of moodsOf(log)) counts.set(m, (counts.get(m) ?? 0) + 1)
  return rank(counts, limit)
}

function rank(counts: Map<string, number>, limit: number): Tally[] {
  return [...counts.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key))
    .slice(0, limit)
}

/** Standard deviation of cycle length (days) mapped to a friendly label. */
export function regularityOf(stdDev: number | null): Regularity | null {
  if (stdDev === null) return null
  if (stdDev <= 2) return 'steady'
  if (stdDev <= 4) return 'fairlySteady'
  return 'variable'
}
