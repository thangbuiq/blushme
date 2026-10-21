import { addDays, formatISO, subDays } from 'date-fns'
import { db } from './db'
import { useSettingsStore } from '@/store/settingsStore'
import type { DailyLog, Flow } from '@/engine/types'

// A deterministic, gently irregular 10-cycle history ending a few days before
// today, so "Load demo data" shows a realistic mid-cycle Today screen rather
// than a cold start.
const CYCLE_LENGTHS = [27, 29, 28, 30, 27, 28, 29, 28, 26, 28]
const PERIOD_LENGTH = 5
const FLOW_PATTERN: Flow[] = [3, 3, 2, 1, 1]
const SYMPTOM_DAYS: Record<number, string[]> = {
  0: ['cramps', 'fatigue'],
  1: ['cramps'],
}

export async function loadDemoData(): Promise<void> {
  const totalDays = CYCLE_LENGTHS.reduce((sum, l) => sum + l, 0)
  const firstPeriodStart = subDays(new Date(), totalDays + 6)

  const logs: DailyLog[] = []
  const periodStartDates: string[] = []
  let cursor = firstPeriodStart

  for (const length of CYCLE_LENGTHS) {
    const startDate = cursor
    periodStartDates.push(formatISO(startDate, { representation: 'date' }))

    for (let day = 0; day < PERIOD_LENGTH; day++) {
      const date = formatISO(addDays(startDate, day), { representation: 'date' })
      logs.push({
        date,
        periodStart: day === 0,
        flow: FLOW_PATTERN[day],
        symptoms: SYMPTOM_DAYS[day],
      })
    }

    cursor = addDays(startDate, length)
  }

  await db.logs.bulkPut(logs)
  await useSettingsStore.getState().update({
    demoDataLoaded: true,
    demoLogDates: logs.map((l) => l.date),
  })
}

export async function removeDemoData(): Promise<void> {
  const { demoLogDates } = useSettingsStore.getState().settings
  await db.logs.bulkDelete(demoLogDates)
  await useSettingsStore.getState().update({ demoDataLoaded: false, demoLogDates: [] })
}
