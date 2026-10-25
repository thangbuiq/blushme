import { describe, expect, it } from 'vitest'
import { computeCycle } from '@/engine'
import { buildDemoLogs } from '@/data/demoLogs'
import { dueReminder } from '../periodReminder'

const base = {
  today: '2026-10-25',
  predictedDate: '2026-10-27',
  rangeDays: 2,
  paused: false,
  enabled: true,
  onPeriod: false,
  dismissedFor: null,
  lastShown: null,
}

describe('dueReminder', () => {
  it('is due inside the lead window', () => {
    expect(dueReminder(base)).toEqual({ kind: 'upcoming', days: 2 })
    expect(dueReminder({ ...base, predictedDate: '2026-10-25' })).toEqual({
      kind: 'upcoming',
      days: 0,
    })
    expect(dueReminder({ ...base, predictedDate: '2026-10-28' })).toEqual({
      kind: 'upcoming',
      days: 3,
    })
  })

  it('stays quiet outside the window', () => {
    expect(dueReminder({ ...base, predictedDate: '2026-10-29' })).toBeNull()
    expect(dueReminder({ ...base, predictedDate: '2026-10-22' })).toBeNull()
  })

  it('reminds inside the predicted range when no period is logged yet', () => {
    expect(dueReminder({ ...base, predictedDate: '2026-10-24' })).toEqual({ kind: 'inRange' })
    expect(dueReminder({ ...base, predictedDate: '2026-10-23' })).toEqual({ kind: 'inRange' })
  })

  it('respects the toggle, paused predictions and once-a-day', () => {
    expect(dueReminder({ ...base, enabled: false })).toBeNull()
    expect(dueReminder({ ...base, paused: true })).toBeNull()
    expect(dueReminder({ ...base, lastShown: '2026-10-25' })).toBeNull()
  })

  it('stops the heads-up once confirmed, but reminds again for a new prediction', () => {
    expect(dueReminder({ ...base, dismissedFor: '2026-10-27' })).toBeNull()
    expect(dueReminder({ ...base, dismissedFor: '2026-09-29' })).toEqual({
      kind: 'upcoming',
      days: 2,
    })
  })

  it('also reminds during the period, even after the heads-up was confirmed', () => {
    const during = { ...base, onPeriod: true, predictedDate: '2026-11-20' }
    expect(dueReminder(during)).toEqual({ kind: 'during' })
    expect(dueReminder({ ...during, dismissedFor: '2026-11-20' })).toEqual({ kind: 'during' })
    expect(dueReminder({ ...during, lastShown: '2026-10-25' })).toBeNull()
  })
})

describe('demo data', () => {
  it('lands inside the reminder window', () => {
    const today = new Date()
    const iso = (d: Date) => d.toLocaleDateString('sv-SE')
    const state = computeCycle(
      buildDemoLogs(today),
      {
        statedCycleLength: 28,
        statedPeriodLength: 5,
        statedConfidenceLow: false,
        predictionsPaused: false,
      },
      iso(today),
    )
    const reminder = dueReminder({
      today: iso(today),
      predictedDate: state.predictedNextPeriod.date,
      rangeDays: state.predictedNextPeriod.rangeDays,
      paused: state.paused,
      enabled: true,
      onPeriod: state.phase === 'menstrual',
      dismissedFor: null,
      lastShown: null,
    })
    expect(reminder?.kind).toBe('upcoming')
  })
})
