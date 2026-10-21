import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Sheet } from '@/ui/Sheet'
import { ChevronIcon } from '@/ui/Icon'
import { Collapse } from '@/ui/Collapse'
import { useUiStore } from '@/store/uiStore'
import type { Phase } from '@/engine/types'
import styles from './LearnSheet.module.css'

const PHASES: Phase[] = ['menstrual', 'follicular', 'ovulation', 'luteal']

export function LearnSheet() {
  const { t } = useTranslation()
  const open = useUiStore((s) => s.learnSheetOpen)
  const close = useUiStore((s) => s.closeLearnSheet)
  const [openPhase, setOpenPhase] = useState<Phase | null>(null)

  return (
    <Sheet open={open} onClose={close} title={t('learn.title')}>
      <p className={styles.intro}>{t('learn.intro')}</p>

      <div className={styles.row}>
        <span className="label-caps">{t('learn.howCounted.title')}</span>
        <p className={styles.body}>{t('learn.howCounted.body')}</p>
      </div>

      <p className={styles.sectionTitle}>{t('learn.phasesTitle')}</p>
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
              {t(`today.phase.${phase}`)}
              <ChevronIcon className={expanded ? styles.chevronOpen : undefined} />
            </button>
            <Collapse open={expanded}>
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
    </Sheet>
  )
}
