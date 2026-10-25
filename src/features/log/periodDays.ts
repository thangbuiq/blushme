import type { DailyLog } from '@/engine/types'

/** True when the log holds anything besides the period marker itself. */
export function hasLogContent(log: DailyLog): boolean {
  return Boolean(
    log.symptoms?.length ||
      log.moods?.length ||
      log.mood ||
      log.note ||
      log.bbt !== undefined ||
      log.cervicalMucus ||
      log.lhPositive ||
      log.intimacy ||
      (log.flow ?? 0) > 0 ||
      log.spotting,
  )
}

/** The log with its bleeding markers cleared (legacy start and flow included). */
export function withoutPeriod(log: DailyLog): DailyLog {
  return { ...log, periodDay: undefined, periodStart: undefined, flow: undefined }
}
