import Dexie, { type EntityTable } from 'dexie'
import type { DailyLog } from '@/engine/types'

export type Goal = 'track' | 'ttc' | 'avoiding'
export type Units = 'metric' | 'imperial'
export type WeekStart = 'sunday' | 'monday'

export interface SettingsRecord {
  id: 'settings'
  onboardingComplete: boolean
  language: 'en' | 'vi' | null // null = follow device language
  goal: Goal
  statedCycleLength: number
  statedPeriodLength: number
  statedConfidenceLow: boolean
  lutealPhaseLength: number | null
  predictionsPaused: boolean
  advancedTracking: boolean
  fertilityLayerEnabled: boolean
  fertilityDisclaimerShown: boolean
  units: Units
  weekStart: WeekStart
  lockEnabled: boolean
  pinHash: string | null
  lockOfferedAfterFirstLog: boolean
  remindersEnabled: boolean
  dismissedNoticeIds: string[]
  demoDataLoaded: boolean
  demoLogDates: string[]
}

export const DEFAULT_SETTINGS: SettingsRecord = {
  id: 'settings',
  onboardingComplete: false,
  language: null,
  goal: 'track',
  statedCycleLength: 28,
  statedPeriodLength: 5,
  statedConfidenceLow: false,
  lutealPhaseLength: null,
  predictionsPaused: false,
  advancedTracking: false,
  fertilityLayerEnabled: false,
  fertilityDisclaimerShown: false,
  units: 'metric',
  weekStart: 'monday',
  lockEnabled: false,
  pinHash: null,
  lockOfferedAfterFirstLog: false,
  remindersEnabled: false,
  dismissedNoticeIds: [],
  demoDataLoaded: false,
  demoLogDates: [],
}

class BlushDB extends Dexie {
  logs!: EntityTable<DailyLog, 'date'>
  settings!: EntityTable<SettingsRecord, 'id'>

  constructor() {
    super('blush')
    this.version(1).stores({
      logs: 'date',
      settings: 'id',
    })
  }
}

export const db = new BlushDB()

export async function getSettings(): Promise<SettingsRecord> {
  const existing = await db.settings.get('settings')
  if (existing) return existing
  await db.settings.put(DEFAULT_SETTINGS)
  return DEFAULT_SETTINGS
}
