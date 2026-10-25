import { describe, expect, it } from 'vitest'
import { periodReminderDays } from '../periodReminder'

const base = {
  today: '2026-10-25',
  predictedDate: '2026-10-27',
  paused: false,
  enabled: true,
  dismissedFor: null,
  lastShown: null,
}

describe('periodReminderDays', () => {
  it('is due inside the lead window', () => {
    expect(periodReminderDays(base)).toBe(2)
    expect(periodReminderDays({ ...base, predictedDate: '2026-10-25' })).toBe(0)
    expect(periodReminderDays({ ...base, predictedDate: '2026-10-28' })).toBe(3)
  })

  it('stays quiet outside the window', () => {
    expect(periodReminderDays({ ...base, predictedDate: '2026-10-29' })).toBeNull()
    expect(periodReminderDays({ ...base, predictedDate: '2026-10-24' })).toBeNull()
  })

  it('respects the toggle, paused predictions, dismissal and once-a-day', () => {
    expect(periodReminderDays({ ...base, enabled: false })).toBeNull()
    expect(periodReminderDays({ ...base, paused: true })).toBeNull()
    expect(periodReminderDays({ ...base, dismissedFor: '2026-10-27' })).toBeNull()
    expect(periodReminderDays({ ...base, lastShown: '2026-10-25' })).toBeNull()
  })

  it('reminds again for a new prediction after an old dismissal', () => {
    expect(periodReminderDays({ ...base, dismissedFor: '2026-09-29' })).toBe(2)
  })
})
