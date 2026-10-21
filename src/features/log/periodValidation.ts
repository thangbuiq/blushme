import { addDays, differenceInCalendarDays, formatISO, parseISO } from 'date-fns'
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

function dayBefore(date: ISODate): ISODate {
  return formatISO(addDays(parseISO(date), -1), { representation: 'date' })
}

// Whether the day before `date` was itself a logged period day, i.e. `date`
// would continue an existing streak rather than start a new one.
export function isContinuingPeriod(date: ISODate, logs: DailyLog[]): boolean {
  const previous = logs.find((log) => log.date === dayBefore(date))
  return Boolean(previous?.periodStart || (previous?.flow ?? 0) > 0)
}

// Which day of the period `date` would be, counting back through
// consecutive logged period days ending at `date` (inclusive).
export function periodDayNumber(date: ISODate, logs: DailyLog[]): number {
  let count = 1
  let cursor = date
  while (isContinuingPeriod(cursor, logs)) {
    cursor = dayBefore(cursor)
    count++
  }
  return count
}
