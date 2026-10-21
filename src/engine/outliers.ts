import type { ExcludedCycle } from './types'

const MIN_CYCLE = 21
const MAX_CYCLE = 45
const MAD_SCALE = 1.4826 // scales MAD to be comparable to a standard deviation
const MAD_THRESHOLD = 2.5
const MIN_CYCLES_FOR_MAD = 5

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
}

export interface OutlierResult {
  valid: number[]
  excluded: ExcludedCycle[]
}

export function excludeOutliers(lengths: number[]): OutlierResult {
  const excluded: ExcludedCycle[] = []
  const inRange: { index: number; length: number }[] = []

  lengths.forEach((length, index) => {
    if (length < MIN_CYCLE || length > MAX_CYCLE) {
      excluded.push({ index, length, reason: 'range' })
    } else {
      inRange.push({ index, length })
    }
  })

  if (inRange.length < MIN_CYCLES_FOR_MAD) {
    return { valid: inRange.map((c) => c.length), excluded }
  }

  const med = median(inRange.map((c) => c.length))
  const scaledMad = MAD_SCALE * median(inRange.map((c) => Math.abs(c.length - med)))
  const valid: number[] = []

  for (const { index, length } of inRange) {
    if (scaledMad > 0 && Math.abs(length - med) > MAD_THRESHOLD * scaledMad) {
      excluded.push({ index, length, reason: 'outlier' })
    } else {
      valid.push(length)
    }
  }

  return { valid, excluded: excluded.sort((a, b) => a.index - b.index) }
}
