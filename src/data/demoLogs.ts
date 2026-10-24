import { addDays, formatISO, subDays } from 'date-fns'
import type { DailyLog, Flow } from '../engine/types'

// A deterministic, gently irregular 10-cycle history ending mid-cycle (day 12),
// so demo data shows a realistic mid-cycle Today screen rather than a
// cold start. Pure (no store or DOM imports) so scripts can reuse it.
const CYCLE_LENGTHS = [27, 29, 28, 30, 27, 28, 29, 28, 26, 28]
const PERIOD_LENGTH = 5
const FLOW_PATTERN: Flow[] = [3, 3, 2, 1, 1]
const SYMPTOM_DAYS: Record<number, string[]> = {
  0: ['cramps', 'fatigue'],
  1: ['cramps', 'backache'],
  2: ['bloating'],
}
const MOOD_DAYS: Record<number, string> = { 1: 'sad', 3: 'calm' }
const MID_CYCLE_MOODS = ['happy', 'energetic', 'calm']

export function buildDemoLogs(today: Date = new Date()): DailyLog[] {
  // Today lands on day 12 of the last cycle.
  const priorDays = CYCLE_LENGTHS.slice(0, -1).reduce((sum, l) => sum + l, 0)
  const logs: DailyLog[] = []
  let cursor = subDays(today, priorDays + 11)

  CYCLE_LENGTHS.forEach((length, cycle) => {
    for (let day = 0; day < PERIOD_LENGTH; day++) {
      logs.push({
        date: formatISO(addDays(cursor, day), { representation: 'date' }),
        periodStart: day === 0,
        flow: FLOW_PATTERN[day],
        symptoms: SYMPTOM_DAYS[day],
        mood: MOOD_DAYS[day],
      })
    }
    // A couple of mid-cycle mood entries so Insights has something to show.
    logs.push({
      date: formatISO(addDays(cursor, 13 + (cycle % 3)), { representation: 'date' }),
      mood: MID_CYCLE_MOODS[cycle % MID_CYCLE_MOODS.length],
    })
    // Biphasic temperature, mucus and an LH surge on the last three cycles so the
    // advanced charts have data. Ovulation sits around day length - 14.
    if (cycle >= CYCLE_LENGTHS.length - 3) {
      const ovDay = length - 14
      const lastDay = cycle === CYCLE_LENGTHS.length - 1 ? 12 : length
      for (let day = 0; day < lastDay; day++) {
        const date = formatISO(addDays(cursor, day), { representation: 'date' })
        const wobble = ((day * 7 + cycle * 3) % 5) / 100
        const bbt = Math.round((day < ovDay ? 36.3 + wobble : 36.7 + wobble) * 100) / 100
        const existing = logs.find((l) => l.date === date)
        const extra: Partial<DailyLog> = {
          bbt,
          cervicalMucus:
            day < PERIOD_LENGTH
              ? undefined
              : day < ovDay - 5
                ? 'dry'
                : day < ovDay - 2
                  ? 'creamy'
                  : day <= ovDay
                    ? 'eggWhite'
                    : 'sticky',
          lhPositive: day === ovDay - 1 ? true : undefined,
        }
        if (existing) Object.assign(existing, extra)
        else logs.push({ date, ...extra })
      }
    }
    cursor = addDays(cursor, length)
  })

  return logs
}
