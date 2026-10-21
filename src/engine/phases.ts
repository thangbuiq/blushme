import { differenceInCalendarDays, parseISO } from 'date-fns'
import type { ISODate, Phase } from './types'

export interface PhaseInput {
  today: ISODate
  lastPeriodStart: ISODate
  periodLength: number
  ovulationDate: ISODate
}

export function dayOfCycle(today: ISODate, lastPeriodStart: ISODate): number {
  return differenceInCalendarDays(parseISO(today), parseISO(lastPeriodStart)) + 1
}

export function currentPhase(input: PhaseInput): Phase {
  const day = dayOfCycle(input.today, input.lastPeriodStart)
  if (day <= input.periodLength) return 'menstrual'

  const daysFromOvulation = differenceInCalendarDays(
    parseISO(input.today),
    parseISO(input.ovulationDate),
  )
  if (Math.abs(daysFromOvulation) <= 1) return 'ovulation'
  if (daysFromOvulation < -1) return 'follicular'
  return 'luteal'
}
