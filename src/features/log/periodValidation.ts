import { differenceInCalendarDays, formatISO, parseISO, subDays } from 'date-fns'
import { isBleeding, periodStartDates } from '@/engine/cycleLengths'
import type { DailyLog, ISODate } from '@/engine/types'

const SUSPICIOUSLY_SHORT_GAP = 21 // matches the engine's own valid-cycle floor

// How many days before `date` the nearest other logged period start falls,
// excluding `date` itself (so re-saving the same day isn't flagged).
export function daysSincePreviousPeriodStart(date: ISODate, logs: DailyLog[]): number | null {
  const priorStarts = periodStartDates(logs).filter((start) => start < date)
  const previous = priorStarts[priorStarts.length - 1]
  if (!previous) return null
  return differenceInCalendarDays(parseISO(date), parseISO(previous))
}

export function isSuspiciouslyEarly(date: ISODate, logs: DailyLog[]): boolean {
  // Continuing a period that is already underway is never an early start.
  const previous = formatISO(subDays(parseISO(date), 1), { representation: 'date' })
  if (logs.some((log) => log.date === previous && isBleeding(log))) return false
  const gap = daysSincePreviousPeriodStart(date, logs)
  return gap !== null && gap < SUSPICIOUSLY_SHORT_GAP
}
