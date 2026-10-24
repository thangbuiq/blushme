import { addDays, differenceInCalendarDays, formatISO, parseISO } from 'date-fns'
import type { CycleState, DailyLog, ISODate } from '@/engine/types'

export interface PeriodSummary {
  start: ISODate
  end: ISODate
  confirmed: boolean // false = end is a projection, not yet confirmed by logged days
}

// The last day of a consecutive run of logged flow starting at `start`.
function lastConsecutiveLoggedDay(start: ISODate, logs: DailyLog[]): ISODate {
  const loggedDates = new Set(
    logs.filter((l) => (l.flow ?? 0) > 0 || l.periodStart).map((l) => l.date),
  )
  let cursor = start
  while (loggedDates.has(formatISO(addDays(parseISO(cursor), 1), { representation: 'date' }))) {
    cursor = formatISO(addDays(parseISO(cursor), 1), { representation: 'date' })
  }
  return cursor
}

export function currentPeriodSummary(
  today: ISODate,
  logs: DailyLog[],
  cycleState: CycleState,
  periodLength: number,
): PeriodSummary | null {
  const start = cycleState.lastPeriodStart
  const hasActualLog = logs.some((l) => l.date === start && (l.periodStart || (l.flow ?? 0) > 0))
  if (!hasActualLog) return null // the engine's own "no data yet" fallback, nothing to summarize

  // A period recorded as just its start date has no logged end: project it from the stated length.
  const lastLoggedDay = lastConsecutiveLoggedDay(start, logs)
  const projectedEnd = formatISO(addDays(parseISO(start), periodLength - 1), {
    representation: 'date',
  })
  const stillOngoing =
    lastLoggedDay === today &&
    differenceInCalendarDays(parseISO(today), parseISO(start)) < periodLength

  if (lastLoggedDay > start && !stillOngoing) {
    return { start, end: lastLoggedDay, confirmed: true }
  }
  return { start, end: projectedEnd, confirmed: false }
}
