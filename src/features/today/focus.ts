import { formatISO, parseISO, subDays } from 'date-fns'
import { isBleeding } from '@/engine/cycleLengths'
import type { CycleState, DailyLog } from '@/engine/types'

export type FocusAlertCode = 'veryLate' | 'late' | 'longPeriod' | 'cycleRange' | 'variable'
export interface FocusAlert {
  code: FocusAlertCode
  count?: number
}

/** Same bounds as the "when to see a doctor" list in the Learn content. */
const NORMAL_CYCLE = { min: 24, max: 38 }
const LONG_PERIOD_DAYS = 8
const VERY_LATE_DAYS = 90
const HIGH_VARIABILITY = 7

/** Consecutive bleeding days ending on `today` (0 when not bleeding today). */
function bleedingStreak(today: string, logs: DailyLog[]): number {
  const bleeding = new Set(logs.filter(isBleeding).map((l) => l.date))
  let streak = 0
  let day = parseISO(today)
  while (bleeding.has(formatISO(day, { representation: 'date' }))) {
    streak += 1
    day = subDays(day, 1)
  }
  return streak
}

/**
 * The single most important "worth a word with a doctor" note, or null. Only
 * patterns (not one odd cycle) trigger it, so it stays rare and calm.
 */
export function focusAlert(state: CycleState, logs: DailyLog[]): FocusAlert | null {
  if (state.paused) return null
  const daysLate = -state.daysUntilNextPeriod
  if (daysLate >= VERY_LATE_DAYS) return { code: 'veryLate' }
  if (state.isLate) return { code: 'late', count: daysLate }
  if (bleedingStreak(state.today, logs) > LONG_PERIOD_DAYS) return { code: 'longPeriod' }
  const recent = state.math.allCycleLengths.slice(-3)
  const outside = recent.filter((n) => n < NORMAL_CYCLE.min || n > NORMAL_CYCLE.max).length
  if (outside >= 2) return { code: 'cycleRange' }
  const { validCycleLengths, weightedStdDev } = state.math
  if (validCycleLengths.length >= 4 && (weightedStdDev ?? 0) > HIGH_VARIABILITY) {
    return { code: 'variable' }
  }
  return null
}

export type FocusPrepKey = 'supplies' | 'logSymptoms' | 'protect' | 'plan' | 'rest'
export interface FocusPrep {
  key: FocusPrepKey
  /** Days until the period, for the supplies note. */
  count?: number
}

/** One practical thing to do today, chosen from where the cycle is. */
export function focusPrep(state: CycleState): FocusPrep {
  if (state.phase === 'menstrual') return { key: 'logSymptoms' }
  const days = state.daysUntilNextPeriod
  if (!state.paused && days >= 0 && days <= 7) return { key: 'supplies', count: days }
  if (state.phase === 'ovulation') return { key: 'protect' }
  if (state.phase === 'follicular') return { key: 'plan' }
  return { key: 'rest' }
}
