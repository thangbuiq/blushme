import { useTranslation } from 'react-i18next'
import { useCycleState } from '@/store/cycleStore'
import { useUiStore } from '@/store/uiStore'
import { Sheet } from '@/ui/Sheet'
import { DetailsSheet } from './DetailsSheet'
import styles from './TodaySheets.module.css'

// Mounted at the app root, outside the scrolling screen container, so the
// sheet's backdrop anchors to the app frame instead of scrolling with content.
export function TodaySheets() {
  const { t } = useTranslation()
  const state = useCycleState()
  const phase = useUiStore((s) => s.phaseSheet)
  const close = useUiStore((s) => s.closePhaseSheet)
  return (
    <>
      <DetailsSheet state={state} />
      <Sheet open={phase !== null} onClose={close} title={phase ? t(`today.phase.${phase}`) : ''}>
        {phase && <p className={styles.phaseBody}>{t(`learn.phase.${phase}`)}</p>}
      </Sheet>
    </>
  )
}
