import { differenceInCalendarDays, parseISO } from 'date-fns'
import type { ISODate } from '@/engine/types'

/** How many days before the predicted start the reminder begins to appear. */
export const REMINDER_LEAD_DAYS = 3

interface ReminderInput {
  today: ISODate
  predictedDate: ISODate
  paused: boolean
  enabled: boolean
  /** The predicted date the user already confirmed they are ready for. */
  dismissedFor: ISODate | null
  /** The last day the reminder was shown, so it appears at most once a day. */
  lastShown: ISODate | null
}

/**
 * Days until the predicted period (0 = today) when a gentle "get your pads ready"
 * reminder is due, otherwise null.
 */
export function periodReminderDays(input: ReminderInput): number | null {
  if (!input.enabled || input.paused) return null
  if (input.dismissedFor === input.predictedDate || input.lastShown === input.today) return null
  const days = differenceInCalendarDays(parseISO(input.predictedDate), parseISO(input.today))
  return days >= 0 && days <= REMINDER_LEAD_DAYS ? days : null
}
