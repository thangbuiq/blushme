import type { Confidence } from './types'

const IRREGULAR_STD_DEV = 7
const TIGHT_STD_DEV = 4
const HIGH_CONFIDENCE_MIN_CYCLES = 5
const MEDIUM_CONFIDENCE_MIN_CYCLES = 3

export interface ConfidenceInput {
  validCycleCount: number
  stdDev: number
  confirmedOvulation: boolean
  coldStart: boolean
}

export function computeConfidence(input: ConfidenceInput): Confidence {
  if (input.coldStart || input.stdDev > IRREGULAR_STD_DEV) return 'low'

  if (
    (input.validCycleCount >= HIGH_CONFIDENCE_MIN_CYCLES && input.stdDev <= TIGHT_STD_DEV) ||
    (input.confirmedOvulation && input.validCycleCount >= MEDIUM_CONFIDENCE_MIN_CYCLES)
  ) {
    return 'high'
  }

  if (input.validCycleCount >= MEDIUM_CONFIDENCE_MIN_CYCLES) return 'medium'

  return 'low'
}
