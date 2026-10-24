import { differenceInCalendarDays, parseISO } from 'date-fns'
import type { CervicalMucus, DailyLog } from '@/engine/types'
import { moodsOf } from '@/features/log/moods'

export interface BbtPoint {
  date: string
  value: number
}

export interface CycleDayBucket {
  key: 'week1' | 'week2' | 'week3' | 'week4'
  from: number
  to: number
}

export const CYCLE_DAY_BUCKETS: CycleDayBucket[] = [
  { key: 'week1', from: 1, to: 7 },
  { key: 'week2', from: 8, to: 14 },
  { key: 'week3', from: 15, to: 21 },
  { key: 'week4', from: 22, to: Infinity },
]

export const MUCUS_ORDER: CervicalMucus[] = ['dry', 'sticky', 'creamy', 'eggWhite']

/** Most recent `days` basal temperature readings (Celsius), oldest first. */
export function bbtSeries(logs: DailyLog[], days = 40): BbtPoint[] {
  return logs
    .filter((l): l is DailyLog & { bbt: number } => typeof l.bbt === 'number' && l.bbt > 0)
    .map((l) => ({ date: l.date, value: l.bbt }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-days)
}

/** Counts of each cervical mucus type across all logs, in a fixed dry-to-fertile order. */
export function mucusTally(logs: DailyLog[]): { key: CervicalMucus; count: number }[] {
  const counts = new Map<CervicalMucus, number>()
  for (const log of logs)
    if (log.cervicalMucus) counts.set(log.cervicalMucus, (counts.get(log.cervicalMucus) ?? 0) + 1)
  return MUCUS_ORDER.map((key) => ({ key, count: counts.get(key) ?? 0 }))
}

/** Day of cycle (1-based) of every log, measured from the latest period start on or before it. */
export function cycleDayOfLogs(logs: DailyLog[]): { log: DailyLog; day: number }[] {
  const starts = logs
    .filter((l) => l.periodStart)
    .map((l) => l.date)
    .sort()
  if (starts.length === 0) return []
  const result: { log: DailyLog; day: number }[] = []
  for (const log of logs) {
    let start: string | undefined
    for (const s of starts) {
      if (s <= log.date) start = s
      else break
    }
    if (start)
      result.push({ log, day: differenceInCalendarDays(parseISO(log.date), parseISO(start)) + 1 })
  }
  return result
}

export interface HeatRow {
  key: string
  counts: number[] // one per CYCLE_DAY_BUCKETS entry
  total: number
}

function bucketIndex(day: number): number {
  return CYCLE_DAY_BUCKETS.findIndex((b) => day >= b.from && day <= b.to)
}

function heat(logs: DailyLog[], pick: (log: DailyLog) => string[], limit: number): HeatRow[] {
  const rows = new Map<string, number[]>()
  for (const { log, day } of cycleDayOfLogs(logs)) {
    const idx = bucketIndex(day)
    if (idx < 0) continue
    for (const key of pick(log)) {
      const counts = rows.get(key) ?? CYCLE_DAY_BUCKETS.map(() => 0)
      counts[idx] += 1
      rows.set(key, counts)
    }
  }
  return [...rows.entries()]
    .map(([key, counts]) => ({ key, counts, total: counts.reduce((a, b) => a + b, 0) }))
    .sort((a, b) => b.total - a.total || a.key.localeCompare(b.key))
    .slice(0, limit)
}

/** How often each symptom is logged in each week of the cycle. */
export function symptomHeat(logs: DailyLog[], limit = 5): HeatRow[] {
  return heat(logs, (l) => l.symptoms ?? [], limit)
}

/** How often each mood is logged in each week of the cycle. */
export function moodHeat(logs: DailyLog[], limit = 4): HeatRow[] {
  return heat(logs, moodsOf, limit)
}

export interface AdvancedTotals {
  lhPositives: number
  intimacyDays: number
  bbtReadings: number
  mucusEntries: number
}

export function advancedTotals(logs: DailyLog[]): AdvancedTotals {
  return {
    lhPositives: logs.filter((l) => l.lhPositive).length,
    intimacyDays: logs.filter((l) => l.intimacy).length,
    bbtReadings: logs.filter((l) => typeof l.bbt === 'number').length,
    mucusEntries: logs.filter((l) => l.cervicalMucus).length,
  }
}
