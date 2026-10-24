const COLD_START_TARGET_N = 3
// Wide default spread used only when fewer than 2 observed cycles exist to
// measure variability from; keeps the range honest rather than falsely tight.
const DEFAULT_COLD_START_STD_DEV = 4

export interface ColdStartResult {
  mean: number
  stdDev: number
}

// Ĉ = (n·mean_obs + (3-n)·stated) / 3, blending early observations with the
// cycle length the user stated during onboarding.
export function coldStartEstimate(
  validLengths: number[],
  statedCycleLength: number,
): ColdStartResult {
  const n = validLengths.length
  const meanObs = n > 0 ? validLengths.reduce((sum, l) => sum + l, 0) / n : 0
  const mean = (n * meanObs + (COLD_START_TARGET_N - n) * statedCycleLength) / COLD_START_TARGET_N

  if (n < 2) {
    return { mean, stdDev: DEFAULT_COLD_START_STD_DEV }
  }

  const variance = validLengths.reduce((sum, l) => sum + (l - meanObs) ** 2, 0) / n
  return { mean, stdDev: Math.sqrt(variance) }
}
