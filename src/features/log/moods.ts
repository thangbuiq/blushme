export const MOODS = ['calm', 'happy', 'irritable', 'sad', 'anxious', 'energetic'] as const
export type Mood = (typeof MOODS)[number]

/** Moods of a log, including the single `mood` written by older versions. */
export function moodsOf(log: { moods?: string[]; mood?: string }): string[] {
  if (log.moods) return log.moods
  return log.mood ? [log.mood] : []
}

/** The next `moods` value after toggling `mood`; undefined when none remain. */
export function toggleMood(current: string[], mood: string): string[] | undefined {
  const next = current.includes(mood) ? current.filter((m) => m !== mood) : [...current, mood]
  return next.length > 0 ? next : undefined
}
