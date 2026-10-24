import { useCycleState } from '@/store/cycleStore'
import { DetailsSheet } from './DetailsSheet'

// Mounted at the app root, outside the scrolling screen container, so the
// sheet's backdrop anchors to the app frame instead of scrolling with content.
export function TodaySheets() {
  const state = useCycleState()
  return <DetailsSheet state={state} />
}
