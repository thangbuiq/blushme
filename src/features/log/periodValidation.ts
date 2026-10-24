import { differenceInCalendarDays, parseISO } from 'date-fns'
import type { DailyLog, ISODate } from '@/engine/types'

const SUSPICIOUSLY_SHORT_GAP = 21 // matches the engine's own valid-cycle floor

// How many days before `date` the nearest other logged period start falls,
// excluding `date` itself (so re-saving the same day isn't flagged).
export function daysSincePreviousPeriodStart(date: ISODate, logs: DailyLog[]): number | null {
  const priorStarts = logs
    .filter((log) => log.periodStart && log.date < date)
    .map((log) => log.date)
    .sort()
  const previous = priorStarts[priorStarts.length - 1]
  if (!previous) return null
  return differenceInCalendarDays(parseISO(date), parseISO(previous))
}

export function isSuspiciouslyEarly(date: ISODate, logs: DailyLog[]): boolean {
  const gap = daysSincePreviousPeriodStart(date, logs)
  return gap !== null && gap < SUSPICIOUSLY_SHORT_GAP
}
