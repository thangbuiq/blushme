import { useMemo } from 'react'
import { computeCycle } from '@/engine'
import type { CycleSettings } from '@/engine/types'
import { useLogStore } from './logStore'
import { useSettingsStore } from './settingsStore'

export function useCycleState(today?: string) {
  const logs = useLogStore((state) => state.logs)
  const settings = useSettingsStore((state) => state.settings)

  const cycleSettings: CycleSettings = useMemo(
    () => ({
      statedCycleLength: settings.statedCycleLength,
      statedPeriodLength: settings.statedPeriodLength,
      statedConfidenceLow: settings.statedConfidenceLow,
      lutealPhaseLength: settings.lutealPhaseLength ?? undefined,
      predictionsPaused: false,
    }),
    [
      settings.statedCycleLength,
      settings.statedPeriodLength,
      settings.statedConfidenceLow,
      settings.lutealPhaseLength,
    ],
  )

  return useMemo(() => computeCycle(logs, cycleSettings, today), [logs, cycleSettings, today])
}
