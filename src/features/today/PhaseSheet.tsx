import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Sheet } from '@/ui/Sheet'
import type { Phase } from '@/engine/types'
import { PhaseIllustration } from './PhaseIllustration'
import { PHASE_COLOR, PHASE_TEXT_COLOR } from './phaseColors'
import styles from './PhaseSheet.module.css'

const PHASES: Phase[] = ['menstrual', 'follicular', 'ovulation', 'luteal']

/** Explains each cycle phase with a picture. Opens on `initial`, and lets the reader browse the others. */
export function PhaseSheet({
  initial,
  current,
  onClose,
}: {
  initial: Phase | null
  current: Phase
  onClose: () => void
}) {
  const { t } = useTranslation()
  return (
    <Sheet open={initial !== null} onClose={onClose} title={t('learn.phasesTitle')}>
      {initial && <PhaseSheetBody key={initial} initial={initial} current={current} />}
    </Sheet>
  )
}

function PhaseSheetBody({ initial, current }: { initial: Phase; current: Phase }) {
  const { t } = useTranslation()
  const [selected, setSelected] = useState<Phase>(initial)
  return (
    <div className={styles.body}>
      <div className={styles.tabs} role="tablist">
        {PHASES.map((phase) => {
          const on = phase === selected
          return (
            <button
              key={phase}
              type="button"
              role="tab"
              aria-selected={on}
              className={[styles.tab, on && styles.tabOn].filter(Boolean).join(' ')}
              style={on ? { borderColor: PHASE_COLOR[phase], color: PHASE_TEXT_COLOR[phase] } : undefined}
              onClick={() => setSelected(phase)}
            >
              {t(`today.phase.${phase}`)}
            </button>
          )
        })}
      </div>

      <div className={styles.art} style={{ backgroundColor: `${PHASE_COLOR[selected]}22` }}>
        <PhaseIllustration phase={selected} />
      </div>

      {/* All four texts share one grid cell, so the sheet keeps the height of the longest. */}
      <div className={styles.texts}>
        {PHASES.map((phase) => (
          <div
            key={phase}
            className={styles.textCell}
            style={{ visibility: phase === selected ? 'visible' : 'hidden' }}
            aria-hidden={phase !== selected}
          >
            <div className={styles.heading}>
              <h3 style={{ color: PHASE_TEXT_COLOR[phase] }}>{t(`today.phase.${phase}`)}</h3>
              {phase === current && <span className={styles.now}>{t('learn.current')}</span>}
            </div>
            <p className={styles.caption}>{t(`learn.phaseCaption.${phase}`)}</p>
            <p className={styles.text}>{t(`learn.phase.${phase}`)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
