import { useTranslation } from 'react-i18next'
import type { Phase } from '@/engine/types'
import { PHASE_COLOR, PHASE_ICON } from './phaseColors'
import styles from './PhaseTag.module.css'

interface PhaseTagProps {
  phase: Phase
  /** Show the gentle name next to the symbol. Defaults to true. */
  label?: boolean
  size?: number
}

/** A phase as the same coloured symbol the timeline uses, with its gentle name. */
export function PhaseTag({ phase, label = true, size = 16 }: PhaseTagProps) {
  const { t } = useTranslation()
  const Icon = PHASE_ICON[phase]
  const name = t(`today.phaseBadge.${phase}`)
  return (
    <span className={styles.tag} title={label ? undefined : name}>
      <span className={styles.symbol} style={{ color: PHASE_COLOR[phase] }}>
        <Icon size={size} />
      </span>
      {label ? name : <span className="visually-hidden">{name}</span>}
    </span>
  )
}
