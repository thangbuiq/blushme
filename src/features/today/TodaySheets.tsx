import { useCycleState } from '@/store/cycleStore'
import { useUiStore } from '@/store/uiStore'
import { DetailsSheet } from './DetailsSheet'
import { PhaseSheet } from './PhaseSheet'

// Mounted at the app root, outside the scrolling screen container, so the
// sheet's backdrop anchors to the app frame instead of scrolling with content.
export function TodaySheets() {
  const state = useCycleState()
  const phase = useUiStore((s) => s.phaseSheet)
  const close = useUiStore((s) => s.closePhaseSheet)
  return (
    <>
      <DetailsSheet state={state} />
      <PhaseSheet initial={phase} current={state.phase} onClose={close} />
    </>
  )
}
