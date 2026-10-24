import { addDays, differenceInCalendarDays, formatISO, parseISO } from 'date-fns'
import type { CycleState, DailyLog } from '@/engine/types'

export type FertileLevel = 'low' | 'fertile' | 'ovulation' | null

export interface DayState {
  logged: boolean
  predicted: boolean
  fertile: FertileLevel
}

const PROJECTED_CYCLES_AHEAD = 12 // about a year, so flipping forward never shows a blank month

// Every date gets a predicted-period placeholder, not just the very next
// one: we repeat the current estimated cycle length forward so any future
// month still shows where a period is expected.
function isWithinAnyProjectedPeriod(
  date: string,
  cycleState: CycleState,
  periodLength: number,
): boolean {
  const cycleLength = Math.max(
    21,
    differenceInCalendarDays(
      parseISO(cycleState.predictedNextPeriod.date),
      parseISO(cycleState.lastPeriodStart),
    ),
  )

  for (let cycle = 0; cycle <= PROJECTED_CYCLES_AHEAD; cycle++) {
    const start = addDays(parseISO(cycleState.predictedNextPeriod.date), cycle * cycleLength)
    const end = addDays(start, periodLength - 1)
    const startIso = formatISO(start, { representation: 'date' })
    const endIso = formatISO(end, { representation: 'date' })
    if (date >= startIso && date <= endIso) return true
  }
  return false
}

export function computeDayState(
  date: string,
  logs: DailyLog[],
  cycleState: CycleState,
  periodLength: number,
  fertilityLayerEnabled: boolean,
): DayState {
  const log = logs.find((l) => l.date === date)
  const logged = Boolean(log?.periodStart || (log?.flow ?? 0) > 0)

  const predicted =
    !logged && !cycleState.paused && isWithinAnyProjectedPeriod(date, cycleState, periodLength)

  let fertile: FertileLevel = null
  if (fertilityLayerEnabled && !cycleState.paused) {
    const { start, end, peakStart, peakEnd } = cycleState.fertileWindow
    if (date === cycleState.ovulation.date) {
      fertile = 'ovulation'
    } else if (date >= peakStart && date <= peakEnd) {
      fertile = 'fertile'
    } else if (date >= start && date <= end) {
      fertile = 'low'
    }
  }

  return { logged, predicted, fertile }
}
