import { describe, expect, it } from 'vitest'
import type { DailyLog } from '@/engine/types'
import { isSuspiciouslyEarly } from '../periodValidation'

describe('isSuspiciouslyEarly', () => {
  it('is false with no prior period starts', () => {
    expect(isSuspiciouslyEarly('2026-03-05', [])).toBe(false)
  })

  it('is true when fewer than 21 days since the previous period start', () => {
    const logs: DailyLog[] = [{ date: '2026-03-01', periodStart: true }]
    expect(isSuspiciouslyEarly('2026-03-15', logs)).toBe(true)
  })

  it('is false when 21 or more days since the previous period start', () => {
    const logs: DailyLog[] = [{ date: '2026-03-01', periodStart: true }]
    expect(isSuspiciouslyEarly('2026-03-22', logs)).toBe(false)
  })
})
