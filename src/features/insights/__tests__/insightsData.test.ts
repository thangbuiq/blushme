import { describe, expect, it } from 'vitest'
import type { DailyLog } from '@/engine/types'
import { averagePeriodLength, regularityOf, tallyMoods, tallySymptoms } from '../insightsData'

describe('insightsData', () => {
  it('averages consecutive bleeding days per period', () => {
    const logs: DailyLog[] = [
      { date: '2026-01-01', periodStart: true, flow: 2 },
      { date: '2026-01-02', flow: 2 },
      { date: '2026-01-03', flow: 1 },
      { date: '2026-01-29', periodStart: true, flow: 3 },
      { date: '2026-01-30', flow: 1 },
    ]
    expect(averagePeriodLength(logs)).toBe(2.5)
  })

  it('skips periods recorded as a start date only', () => {
    expect(averagePeriodLength([{ date: '2026-01-01', periodStart: true }])).toBeNull()
  })

  it('counts every selected mood, including the legacy single mood', () => {
    const logs: DailyLog[] = [
      { date: '2026-01-01', moods: ['calm', 'happy'] },
      { date: '2026-01-02', mood: 'calm' },
    ]
    expect(tallyMoods(logs)).toEqual([
      { key: 'calm', count: 2 },
      { key: 'happy', count: 1 },
    ])
  })

  it('returns null when no period was logged', () => {
    expect(averagePeriodLength([{ date: '2026-01-01', mood: 'calm' }])).toBeNull()
  })

  it('ranks symptoms and moods by frequency', () => {
    const logs: DailyLog[] = [
      { date: '2026-01-01', symptoms: ['cramps', 'fatigue'], mood: 'sad' },
      { date: '2026-01-02', symptoms: ['cramps'], mood: 'sad' },
      { date: '2026-01-03', symptoms: ['acne'], mood: 'calm' },
    ]
    expect(tallySymptoms(logs, 2)).toEqual([
      { key: 'cramps', count: 2 },
      { key: 'acne', count: 1 },
    ])
    expect(tallyMoods(logs)[0]).toEqual({ key: 'sad', count: 2 })
  })

  it('classifies regularity from the standard deviation', () => {
    expect(regularityOf(null)).toBeNull()
    expect(regularityOf(1.2)).toBe('steady')
    expect(regularityOf(3)).toBe('fairlySteady')
    expect(regularityOf(6)).toBe('variable')
  })
})
