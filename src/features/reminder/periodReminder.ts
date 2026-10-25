import { differenceInCalendarDays, parseISO } from 'date-fns'
import type { ISODate } from '@/engine/types'

/** How many days before the predicted start the reminder begins to appear. */
export const REMINDER_LEAD_DAYS = 3

interface ReminderInput {
  today: ISODate
  predictedDate: ISODate
  paused: boolean
  enabled: boolean
  /** True while today falls inside the period itself. */
  onPeriod: boolean
  /** The predicted date the user already confirmed they are ready for. */
  dismissedFor: ISODate | null
  /** The last day the reminder was shown, so it appears at most once a day. */
  lastShown: ISODate | null
}

export type Reminder = { kind: 'upcoming'; days: number } | { kind: 'during' }

/**
 * The gentle supplies reminder that is due today, if any: a heads-up in the days
 * before the predicted period (0 = today), or a care note while on the period.
 */
export function dueReminder(input: ReminderInput): Reminder | null {
  if (!input.enabled || input.paused || input.lastShown === input.today) return null
  if (input.onPeriod) return { kind: 'during' }
  if (input.dismissedFor === input.predictedDate) return null
  const days = differenceInCalendarDays(parseISO(input.predictedDate), parseISO(input.today))
  return days >= 0 && days <= REMINDER_LEAD_DAYS ? { kind: 'upcoming', days } : null
}
