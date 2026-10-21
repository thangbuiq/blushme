import { formatISO } from 'date-fns'
import { cycleLengths, periodStartDates } from './cycleLengths'
import { excludeOutliers } from './outliers'
import { weightCycles, weightedMean, weightedStdDev } from './weightedStats'
import { coldStartEstimate } from './coldStart'
import { daysUntil, predictionRange, predictNextPeriod } from './predict'
import {
  calendarOvulation,
  DEFAULT_LUTEAL_PHASE_LENGTH,
  detectBbtShift,
  ovulationFromBbt,
  ovulationFromLh,
  type BbtReading,
} from './ovulation'
import { fertileWindow } from './fertileWindow'
import { currentPhase, dayOfCycle } from './phases'
import { computeConfidence } from './confidence'
import type { CycleSettings, CycleState, DailyLog, ISODate } from './types'

const todayISO = () => formatISO(new Date(), { representation: 'date' })

export function computeCycle(
  logs: DailyLog[],
  settings: CycleSettings,
  today: ISODate = todayISO(),
): CycleState {
  const periodStarts = periodStartDates(logs)
  const lastPeriodStart = periodStarts[periodStarts.length - 1] ?? today
  const lutealPhaseLength = settings.lutealPhaseLength ?? DEFAULT_LUTEAL_PHASE_LENGTH

  if (settings.predictionsPaused) {
    return pausedState(today, lastPeriodStart, settings)
  }

  const allCycleLengths = cycleLengths(periodStarts)
  const { valid, excluded } = excludeOutliers(allCycleLengths)
  const coldStart = valid.length < 3

  let mean: number
  let stdDev: number
  let weighted: ReturnType<typeof weightCycles> = []

  if (coldStart) {
    const estimate = coldStartEstimate(valid, settings.statedCycleLength)
    mean = estimate.mean
    stdDev = estimate.stdDev
  } else {
    weighted = weightCycles(valid)
    mean = weightedMean(weighted) ?? settings.statedCycleLength
    stdDev = weightedStdDev(weighted, mean) ?? 0
  }

  const predictedNextPeriod = predictNextPeriod(lastPeriodStart, mean)
  predictedNextPeriod.rangeDays = predictionRange(stdDev)

  const ovulation = resolveOvulation(logs, lastPeriodStart, predictedNextPeriod.date, lutealPhaseLength)
  const window = fertileWindow(ovulation.date)

  const periodLength = settings.statedPeriodLength
  const phase = currentPhase({ today, lastPeriodStart, periodLength, ovulationDate: ovulation.date })
  const daysUntilNextPeriod = daysUntil(today, predictedNextPeriod.date)
  const isLate = daysUntilNextPeriod < -predictedNextPeriod.rangeDays

  const confidence = computeConfidence({
    validCycleCount: valid.length,
    stdDev,
    confirmedOvulation: ovulation.confirmed,
    coldStart,
  })

  return {
    today,
    dayOfCycle: dayOfCycle(today, lastPeriodStart),
    phase,
    lastPeriodStart,
    predictedNextPeriod,
    ovulation,
    fertileWindow: window,
    confidence,
    isLate,
    daysUntilNextPeriod,
    paused: false,
    math: {
      allCycleLengths,
      validCycleLengths: valid,
      excludedCycles: excluded,
      weightedCycles: weighted,
      weightedMean: coldStart ? null : mean,
      weightedStdDev: coldStart ? null : stdDev,
      coldStart,
    },
  }
}

function resolveOvulation(
  logs: DailyLog[],
  lastPeriodStart: ISODate,
  predictedNextPeriod: ISODate,
  lutealPhaseLength: number,
) {
  const sinceLastPeriod = logs.filter((log) => log.date >= lastPeriodStart)

  const bbtReadings: BbtReading[] = sinceLastPeriod
    .filter((log): log is DailyLog & { bbt: number } => typeof log.bbt === 'number')
    .map((log) => ({ date: log.date, bbt: log.bbt }))
  const shiftDate = detectBbtShift(bbtReadings)
  if (shiftDate) {
    return ovulationFromBbt(shiftDate, lutealPhaseLength)
  }

  const lhPositiveDates = sinceLastPeriod.filter((log) => log.lhPositive).map((log) => log.date)
  if (lhPositiveDates.length > 0) {
    return ovulationFromLh(lhPositiveDates[lhPositiveDates.length - 1], lutealPhaseLength)
  }

  return calendarOvulation(predictedNextPeriod, lutealPhaseLength)
}

function pausedState(today: ISODate, lastPeriodStart: ISODate, settings: CycleSettings): CycleState {
  const lutealPhaseLength = settings.lutealPhaseLength ?? DEFAULT_LUTEAL_PHASE_LENGTH
  const ovulation = calendarOvulation(lastPeriodStart, lutealPhaseLength)
  return {
    today,
    dayOfCycle: dayOfCycle(today, lastPeriodStart),
    phase: 'menstrual',
    lastPeriodStart,
    predictedNextPeriod: { date: lastPeriodStart, rangeDays: 0 },
    ovulation,
    fertileWindow: fertileWindow(ovulation.date),
    confidence: 'low',
    isLate: false,
    daysUntilNextPeriod: 0,
    paused: true,
    math: {
      allCycleLengths: [],
      validCycleLengths: [],
      excludedCycles: [],
      weightedCycles: [],
      weightedMean: null,
      weightedStdDev: null,
      coldStart: true,
    },
  }
}

export type {
  CycleSettings,
  CycleState,
  DailyLog,
  Confidence,
  Phase,
  OvulationEstimate,
  FertileWindow,
  PredictedPeriod,
  ExcludedCycle,
  WeightedCycle,
} from './types'
