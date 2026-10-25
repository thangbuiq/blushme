import { differenceInCalendarDays, formatISO, parseISO, subDays } from 'date-fns'
import type { DailyLog, ISODate } from './types'

/** True when the log records bleeding (a period day, a legacy start, or any flow). */
export function isBleeding(log: DailyLog | undefined): boolean {
  return Boolean(log && (log.periodStart || log.periodDay || (log.flow ?? 0) > 0))
}

// A period starts on its first marked day after a gap, so periods can be
// recorded one day at a time and the start still follows from the days.
export function periodStartDates(logs: DailyLog[]): ISODate[] {
  const bleeding = new Set(logs.filter(isBleeding).map((log) => log.date))
  return logs
    .filter((log) => (log.periodStart || log.periodDay) && !bleeding.has(previousDay(log.date)))
    .map((log) => log.date)
    .sort()
}

function previousDay(date: ISODate): ISODate {
  return formatISO(subDays(parseISO(date), 1), { representation: 'date' })
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
