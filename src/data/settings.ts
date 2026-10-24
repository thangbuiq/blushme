export const NAME_MAX = 24

export type Goal = 'track' | 'ttc' | 'avoiding'
export type Units = 'metric' | 'imperial'
export type WeekStart = 'sunday' | 'monday'

export interface SettingsRecord {
  id: 'settings'
  onboardingComplete: boolean
  language: 'en' | 'vi' | null // null = Vietnamese (the default)
  goal: Goal
  displayName: string
  avatar: string
  statedCycleLength: number
  statedPeriodLength: number
  statedConfidenceLow: boolean
  lutealPhaseLength: number | null
  advancedTracking: boolean
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
  displayName: '',
  avatar: 'rose-6',
  statedCycleLength: 28,
  statedPeriodLength: 5,
  statedConfidenceLow: false,
  lutealPhaseLength: null,
  advancedTracking: false,
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
