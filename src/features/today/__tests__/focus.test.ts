import { describe, expect, it } from 'vitest'
import type { CycleState, DailyLog } from '@/engine/types'
import { focusAlert, focusPrep } from '../focus'

function state(over: Partial<CycleState> = {}, math: Partial<CycleState['math']> = {}): CycleState {
  return {
    today: '2026-10-25',
    dayOfCycle: 10,
    phase: 'follicular',
    lastPeriodStart: '2026-10-16',
    predictedNextPeriod: { date: '2026-11-13', rangeDays: 2 },
    ovulation: { date: '2026-10-30', confirmed: false, method: 'calendar', lutealPhaseLength: 14 },
    fertileWindow: {
      start: '2026-10-25',
      end: '2026-10-30',
      peakStart: '2026-10-28',
      peakEnd: '2026-10-30',
    },
    confidence: 'high',
    isLate: false,
    daysUntilNextPeriod: 19,
    paused: false,
    math: {
      allCycleLengths: [28, 29, 28],
      validCycleLengths: [28, 29, 28],
      excludedCycles: [],
      weightedCycles: [],
      weightedMean: 28,
      weightedStdDev: 1,
      coldStart: false,
      ...math,
    },
    ...over,
  }
}

const bleed = (date: string): DailyLog => ({ date, periodDay: true })

describe('focusAlert', () => {
  it('is quiet for a regular cycle', () => {
    expect(focusAlert(state(), [])).toBeNull()
  })

  it('flags a late period and a very late one', () => {
    expect(focusAlert(state({ isLate: true, daysUntilNextPeriod: -6 }), [])).toEqual({
      code: 'late',
      count: 6,
    })
    expect(focusAlert(state({ isLate: true, daysUntilNextPeriod: -95 }), [])).toEqual({
      code: 'veryLate',
    })
  })

  it('flags a period longer than 8 days', () => {
    const days = Array.from({ length: 9 }, (_, i) =>
      bleed(`2026-10-${String(17 + i).padStart(2, '0')}`),
    )
    expect(focusAlert(state(), days)?.code).toBe('longPeriod')
    expect(focusAlert(state(), days.slice(2))).toBeNull()
  })

  it('needs two of the last three cycles out of range', () => {
    expect(focusAlert(state({}, { allCycleLengths: [28, 40, 28] }), [])).toBeNull()
    expect(focusAlert(state({}, { allCycleLengths: [28, 40, 22] }), [])?.code).toBe('cycleRange')
  })

  it('flags high variability only with enough cycles', () => {
    expect(focusAlert(state({}, { weightedStdDev: 8 }), [])).toBeNull()
    expect(
      focusAlert(state({}, { weightedStdDev: 8, validCycleLengths: [24, 36, 26, 38] }), [])?.code,
    ).toBe('variable')
  })

  it('stays quiet when predictions are paused', () => {
    expect(
      focusAlert(state({ paused: true, isLate: true, daysUntilNextPeriod: -10 }), []),
    ).toBeNull()
  })
})

describe('focusPrep', () => {
  it('asks to log symptoms on the period', () => {
    expect(focusPrep(state({ phase: 'menstrual' }))).toEqual({ key: 'logSymptoms' })
  })

  it('reminds about supplies in the week before the period', () => {
    expect(focusPrep(state({ phase: 'luteal', daysUntilNextPeriod: 3 }))).toEqual({
      key: 'supplies',
      count: 3,
    })
    expect(focusPrep(state({ phase: 'luteal', daysUntilNextPeriod: 8 }))).toEqual({ key: 'rest' })
  })

  it('suggests something fitting the other phases', () => {
    expect(focusPrep(state({ phase: 'ovulation', daysUntilNextPeriod: 14 })).key).toBe('protect')
    expect(focusPrep(state({ phase: 'follicular' })).key).toBe('plan')
  })
})
