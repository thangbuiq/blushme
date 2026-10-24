import type { TFunction } from 'i18next'
import type { CycleState } from '@/engine/types'

export function statusLineKey(state: CycleState): {
  key: string
  options?: Record<string, unknown>
} {
  if (state.paused) return { key: 'today.statusPaused' }
  if (state.isLate) return { key: 'today.statusLate' }
  if (state.daysUntilNextPeriod <= 0) return { key: 'today.statusToday' }
  if (state.daysUntilNextPeriod === 1) return { key: 'today.statusNextOne' }
  return { key: 'today.statusNext', options: { days: state.daysUntilNextPeriod } }
}

export function statusLineText(t: TFunction, state: CycleState): string {
  const { key, options } = statusLineKey(state)
  return t(key, options)
}
