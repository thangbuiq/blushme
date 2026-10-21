import { useState } from 'react'
import { addDays, formatISO, parseISO } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { Sheet } from '@/ui/Sheet'
import { ChevronIcon } from '@/ui/Icon'
import { Collapse } from '@/ui/Collapse'
import { formatShortDate } from '@/ui/dateFormat'
import { DisclosurePanel } from '@/features/formulas/DisclosurePanel'
import { useUiStore } from '@/store/uiStore'
import type { CycleState } from '@/engine/types'
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

  return (
    <Sheet open={open} onClose={close} title={t('today.details.title')}>
      <div className={styles.row}>
        <span className="label-caps">{t('today.details.rangeLabel')}</span>
        <span className="numeral">
          {t('today.details.rangeValue', { start: rangeStart, end: rangeEnd })}
        </span>
      </div>
      <div className={styles.row}>
        <span className="label-caps">{t('today.details.confidenceLabel')}</span>
        <span>{t(`today.details.confidence.${state.confidence}`)}</span>
      </div>

      <button
        type="button"
        className={styles.disclosureRow}
        aria-expanded={formulaOpen}
        onClick={() => setFormulaOpen((v) => !v)}
      >
        {t('today.details.howCalculated')}
        <ChevronIcon className={formulaOpen ? styles.chevronOpen : undefined} />
      </button>

      <Collapse open={formulaOpen}>
        <DisclosurePanel state={state} />
      </Collapse>
    </Sheet>
  )
}
