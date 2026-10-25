import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronIcon } from '@/ui/Icon'
import { Collapse } from '@/ui/Collapse'
import { useCycleState } from '@/store/cycleStore'
import { useSettingsStore } from '@/store/settingsStore'
import { PhaseTimeline } from './PhaseTimeline'
import { PhaseIllustration } from './PhaseIllustration'
import { PHASE_COLOR, PHASE_TEXT_COLOR, cycleGeometry } from './phaseColors'
import type { Phase } from '@/engine/types'
import styles from './LearnContent.module.css'

const PHASES: Phase[] = ['menstrual', 'follicular', 'ovulation', 'luteal']

/** Cycle education shown inside the prediction sheet: the four phases, a timeline and when to see a doctor. */
export function LearnContent() {
  const { t } = useTranslation()
  const [openPhase, setOpenPhase] = useState<Phase | null>(null)
  const state = useCycleState()
  const periodLength = useSettingsStore((s) => s.settings.statedPeriodLength)

  return (
    <>
      <h3 className={styles.learnTitle}>{t('learn.title')}</h3>
      <p className={styles.intro}>{t('learn.intro')}</p>

      <div className={styles.row}>
        <span className="label-caps">{t('learn.howCounted.title')}</span>
        <p className={styles.body}>{t('learn.howCounted.body')}</p>
      </div>

      <p className={styles.sectionTitle}>{t('learn.phasesTitle')}</p>
      <p className={styles.timelineHint}>{t('timeline.hint')}</p>
      <PhaseTimeline
        geometry={cycleGeometry(state, periodLength)}
        currentDay={state.dayOfCycle}
        currentPhase={state.phase}
        detailed
        onSelect={(phase) => setOpenPhase(phase)}
      />
      {PHASES.map((phase) => {
        const expanded = openPhase === phase
        return (
          <div key={phase}>
            <button
              type="button"
              className={styles.disclosureRow}
              aria-expanded={expanded}
              onClick={() => setOpenPhase(expanded ? null : phase)}
            >
              <span className={styles.phaseName}>
                <span style={{ color: PHASE_TEXT_COLOR[phase] }}>{t(`today.phase.${phase}`)}</span>
              </span>
              <ChevronIcon className={expanded ? styles.chevronOpen : undefined} />
            </button>
            <Collapse open={expanded}>
              <div
                className={styles.phaseArt}
                style={{ backgroundColor: `${PHASE_COLOR[phase]}22` }}
              >
                <PhaseIllustration phase={phase} />
              </div>
              <p className={styles.phaseBody}>{t(`learn.phase.${phase}`)}</p>
            </Collapse>
          </div>
        )
      })}

      <div className={styles.doctorSection}>
        <p className={styles.sectionTitle}>{t('learn.doctor.title')}</p>
        <p className={styles.body}>{t('learn.doctor.intro')}</p>
        <ul className={styles.doctorList}>
          <li>{t('learn.doctor.item1')}</li>
          <li>{t('learn.doctor.item2')}</li>
          <li>{t('learn.doctor.item3')}</li>
          <li>{t('learn.doctor.item4')}</li>
        </ul>
      </div>
    </>
  )
}
