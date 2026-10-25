export type ISODate = string // YYYY-MM-DD

export type Flow = 0 | 1 | 2 | 3

export type CervicalMucus = 'dry' | 'sticky' | 'creamy' | 'eggWhite'

export interface DailyLog {
  date: ISODate
  /** Legacy: the first day of a period. New logs mark each bleeding day with `periodDay`. */
  periodStart?: boolean
  /** Bleeding on this day. A period start is the first bleeding day after a gap. */
  periodDay?: boolean
  spotting?: boolean
  flow?: Flow
  symptoms?: string[]
  moods?: string[]
  /** Legacy single mood from older logs; read through moodsOf(). */
  mood?: string
  note?: string
  bbt?: number // Celsius
  cervicalMucus?: CervicalMucus
  lhPositive?: boolean
  intimacy?: boolean
}

export interface CycleSettings {
  statedCycleLength: number // from onboarding, used for cold start + fallback
  statedPeriodLength: number
  statedConfidenceLow: boolean // true when onboarding used "I'm not sure"
  lutealPhaseLength?: number // personalized L, default 14
  predictionsPaused: boolean
}

export type Phase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal'

export type Confidence = 'low' | 'medium' | 'high'

export type ExclusionReason = 'range' | 'outlier'

export interface ExcludedCycle {
  index: number
  length: number
  reason: ExclusionReason
}

export interface WeightedCycle {
  length: number
  weight: number
}

export interface OvulationEstimate {
  date: ISODate
  confirmed: boolean
  method: 'calendar' | 'bbt' | 'lh'
  lutealPhaseLength: number
}

export interface FertileWindow {
  start: ISODate
  end: ISODate
  peakStart: ISODate
  peakEnd: ISODate
}

export interface PredictedPeriod {
  date: ISODate
  rangeDays: number
}

export interface CycleMath {
  allCycleLengths: number[]
  validCycleLengths: number[]
  excludedCycles: ExcludedCycle[]
  weightedCycles: WeightedCycle[]
  weightedMean: number | null
  weightedStdDev: number | null
  coldStart: boolean
}

export interface CycleState {
  today: ISODate
  dayOfCycle: number
  phase: Phase
  lastPeriodStart: ISODate
  predictedNextPeriod: PredictedPeriod
  ovulation: OvulationEstimate
  fertileWindow: FertileWindow
  confidence: Confidence
  isLate: boolean
  daysUntilNextPeriod: number
  paused: boolean
  math: CycleMath
}
