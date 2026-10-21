import { addDays, differenceInCalendarDays, formatISO, parseISO } from 'date-fns'
import type { ISODate, OvulationEstimate } from './types'

export const DEFAULT_LUTEAL_PHASE_LENGTH = 14
const BBT_SHIFT_MIN_DELTA = 0.2 // Celsius
const BBT_SHIFT_CONFIRM_DAYS = 3
const BBT_BASELINE_WINDOW = 6
const LH_SURGE_TO_OVULATION_HOURS = 30 // midpoint of the stated 24-36h window

export function calendarOvulation(
  predictedNextPeriod: ISODate,
  lutealPhaseLength: number,
): OvulationEstimate {
  const date = formatISO(addDays(parseISO(predictedNextPeriod), -lutealPhaseLength), {
    representation: 'date',
  })
  return { date, confirmed: false, method: 'calendar', lutealPhaseLength }
}

export interface BbtReading {
  date: ISODate
  bbt: number
}

// Finds the first day of a sustained 3-day rise of >=0.2C above the mean of
// the preceding 6 days; that rise's start day is treated as ovulation.
export function detectBbtShift(readings: BbtReading[]): ISODate | null {
  const sorted = [...readings].sort((a, b) => a.date.localeCompare(b.date))
  for (let i = BBT_BASELINE_WINDOW; i <= sorted.length - BBT_SHIFT_CONFIRM_DAYS; i++) {
    const baseline = sorted.slice(i - BBT_BASELINE_WINDOW, i)
    const baselineMean = baseline.reduce((sum, r) => sum + r.bbt, 0) / baseline.length
    const risingDays = sorted.slice(i, i + BBT_SHIFT_CONFIRM_DAYS)
    const allAboveThreshold = risingDays.every(
      (r) => r.bbt - baselineMean >= BBT_SHIFT_MIN_DELTA,
    )
    if (allAboveThreshold) {
      return sorted[i].date
    }
  }
  return null
}

// BBT/LH confirm the ovulation *date* directly for the current cycle; the
// luteal-phase length they carry is whatever was already in effect (true L,
// next-period-minus-ovulation, can only be known once that period arrives).
export function ovulationFromBbt(shiftDate: ISODate, currentLutealPhaseLength: number): OvulationEstimate {
  return { date: shiftDate, confirmed: true, method: 'bbt', lutealPhaseLength: currentLutealPhaseLength }
}

export function ovulationFromLh(
  lhPositiveDate: ISODate,
  currentLutealPhaseLength: number,
): OvulationEstimate {
  const date = formatISO(
    addDays(parseISO(lhPositiveDate), Math.round(LH_SURGE_TO_OVULATION_HOURS / 24)),
    { representation: 'date' },
  )
  return { date, confirmed: true, method: 'lh', lutealPhaseLength: currentLutealPhaseLength }
}

// Once a cycle completes, its confirmed ovulation date plus the period start
// that followed gives a true L to personalize future calendar predictions.
export function personalizeLutealPhaseLength(ovulationDate: ISODate, nextPeriodStart: ISODate): number {
  return differenceInCalendarDays(parseISO(nextPeriodStart), parseISO(ovulationDate))
}
