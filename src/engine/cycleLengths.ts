import { differenceInCalendarDays, parseISO } from 'date-fns'
import type { DailyLog, ISODate } from './types'

export function periodStartDates(logs: DailyLog[]): ISODate[] {
  return logs
    .filter((log) => log.periodStart)
    .map((log) => log.date)
    .sort()
}

// C_i = P_{i+1} - P_i, in days, for consecutive period starts.
export function cycleLengths(periodStarts: ISODate[]): number[] {
  const lengths: number[] = []
  for (let i = 0; i < periodStarts.length - 1; i++) {
    const start = parseISO(periodStarts[i])
    const next = parseISO(periodStarts[i + 1])
    lengths.push(differenceInCalendarDays(next, start))
  }
  return lengths
}
