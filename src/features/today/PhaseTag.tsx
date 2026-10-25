import { useTranslation } from 'react-i18next'
import type { Phase } from '@/engine/types'
import { PHASE_TEXT_COLOR } from './phaseColors'

/** A phase's name, set in the phase's own colour. */
export function PhaseTag({ phase }: { phase: Phase }) {
  const { t } = useTranslation()
  return (
    <span style={{ color: PHASE_TEXT_COLOR[phase], fontWeight: 600 }}>
      {t(`today.phase.${phase}`)}
    </span>
  )
}
