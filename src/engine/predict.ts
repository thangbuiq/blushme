import { addDays, differenceInCalendarDays, formatISO, parseISO } from 'date-fns'
import type { ISODate, PredictedPeriod } from './types'

export function predictNextPeriod(
  lastPeriodStart: ISODate,
  meanCycleLength: number,
): PredictedPeriod {
  const date = formatISO(addDays(parseISO(lastPeriodStart), Math.round(meanCycleLength)), {
    representation: 'date',
  })
  return { date, rangeDays: 0 }
}

export function predictionRange(stdDev: number): number {
  return Math.max(1, Math.round(stdDev))
}

export function daysUntil(today: ISODate, target: ISODate): number {
  return differenceInCalendarDays(parseISO(target), parseISO(today))
}
