import { useState } from 'react'
import { addDays, formatISO, parseISO } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { Sheet } from '@/ui/Sheet'
import { ChevronIcon, SigmaIcon } from '@/ui/Icon'
import { TermLabel } from '@/ui/TermHint'
import { Collapse } from '@/ui/Collapse'
import { formatShortDate } from '@/ui/dateFormat'
import { regularityOf } from '@/features/insights/insightsData'
import { DisclosurePanel } from '@/features/formulas/DisclosurePanel'
import { useUiStore } from '@/store/uiStore'
import type { CycleState } from '@/engine/types'
import { LearnContent } from './LearnContent'
import { CONFIDENCE_PERCENT } from './confidence'
import styles from './DetailsSheet.module.css'


interface DetailsSheetProps {
  state: CycleState
}

export function DetailsSheet({ state }: DetailsSheetProps) {
  const { t, i18n } = useTranslation()
  const open = useUiStore((s) => s.detailsSheetOpen)
  const close = useUiStore((s) => s.closeDetailsSheet)
  const [formulaOpen, setFormulaOpen] = useState(false)

  const predicted = parseISO(state.predictedNextPeriod.date)
  const rangeStart = formatShortDate(
    formatISO(addDays(predicted, -state.predictedNextPeriod.rangeDays), { representation: 'date' }),
    i18n.language,
  )
  const rangeEnd = formatShortDate(
    formatISO(addDays(predicted, state.predictedNextPeriod.rangeDays), { representation: 'date' }),
    i18n.language,
  )

  const stdDev = state.math.weightedStdDev
  const regularity = regularityOf(stdDev)
  const confidencePercent = CONFIDENCE_PERCENT[state.confidence]

  return (
    <Sheet open={open} onClose={close} title={t('today.details.title')}>
      <div className={styles.row}>
        <span className="label-caps">{t('today.details.rangeLabel')}</span>
        <span className="numeral">
          {t('today.details.rangeValue', { start: rangeStart, end: rangeEnd })}
        </span>
      </div>
      <div className={styles.row}>
        <TermLabel term="confidence">
          <span className="label-caps">{t('today.details.confidenceLabel')}</span>
        </TermLabel>
        <span className={styles.confidence} title={t(`today.details.confidence.${state.confidence}`)}>
          <span
            className={styles.miniRing}
            style={{ '--pct': `${confidencePercent}%` } as React.CSSProperties}
            aria-hidden="true"
          />
          <span className="numeral">{confidencePercent}%</span>
          <span className={styles.confidenceText}>
            {t(`today.details.confidence.${state.confidence}`)}
          </span>
        </span>
      </div>

      {stdDev !== null && regularity && (
        <div className={styles.row}>
          <TermLabel term="variation">
            <span className="label-caps">{t('engine.formula.stdDevLabel')}</span>
          </TermLabel>
          <span className="numeral">
            {t('today.details.variabilityValue', {
              days: stdDev.toFixed(1),
              label: t(`insights.regularityValue.${regularity}`),
            })}
          </span>
        </div>
      )}

      <LearnContent />

      <button
        type="button"
        className={styles.disclosureRow}
        aria-expanded={formulaOpen}
        onClick={() => setFormulaOpen((v) => !v)}
      >
        <span className={styles.disclosureLabel}>
          <SigmaIcon />
          {t('today.details.howCalculated')}
        </span>
        <ChevronIcon className={formulaOpen ? styles.chevronOpen : undefined} />
      </button>

      <Collapse open={formulaOpen}>
        <DisclosurePanel state={state} />
      </Collapse>
    </Sheet>
  )
}
