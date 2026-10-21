import type { WeightedCycle } from './types'

const WEIGHT_DECAY = 0.8
const MAX_CYCLES_USED = 6

// Most recent valid cycle gets k=0 (weight 1), older cycles decay by 0.8^k.
export function weightCycles(validLengthsChronological: number[]): WeightedCycle[] {
  const recent = validLengthsChronological.slice(-MAX_CYCLES_USED)
  const n = recent.length
  return recent.map((length, i) => {
    const k = n - 1 - i
    return { length, weight: WEIGHT_DECAY ** k }
  })
}

export function weightedMean(cycles: WeightedCycle[]): number | null {
  if (cycles.length === 0) return null
  const totalWeight = cycles.reduce((sum, c) => sum + c.weight, 0)
  const weightedSum = cycles.reduce((sum, c) => sum + c.weight * c.length, 0)
  return weightedSum / totalWeight
}

export function weightedStdDev(cycles: WeightedCycle[], mean: number): number | null {
  if (cycles.length === 0) return null
  const totalWeight = cycles.reduce((sum, c) => sum + c.weight, 0)
  const weightedVariance =
    cycles.reduce((sum, c) => sum + c.weight * (c.length - mean) ** 2, 0) / totalWeight
  return Math.sqrt(weightedVariance)
}
