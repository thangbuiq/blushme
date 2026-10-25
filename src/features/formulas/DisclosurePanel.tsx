import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { CycleState } from '@/engine/types'
import { ChevronIcon } from '@/ui/Icon'
import { Collapse } from '@/ui/Collapse'
import { TermHint } from '@/ui/TermHint'
import type { GlossaryKey } from '@/store/uiStore'
import { MathBlock } from './MathBlock'
import styles from './DisclosurePanel.module.css'

type OpenSection = 'math' | 'numbers' | null

interface DisclosurePanelProps {
  state: CycleState
}

const FORMULAS = [
  'C_i = P_{i+1} - P_i',
  String.raw`\hat{C} = \frac{\sum w_k C_k}{\sum w_k}, \quad w_k = 0.8^k`,
  String.raw`\sigma = \sqrt{\frac{\sum w_k (C_k - \hat{C})^2}{\sum w_k}}`,
  String.raw`\hat{P} = P_n + \mathrm{round}(\hat{C})`,
  'O = \\hat{P} - L',
]

// Real, independently verifiable sources for the three assumptions the
// engine makes — not guessed URLs. Each backs one "Learn more" line below.
const LEARN_MORE_SOURCES = [
  {
    key: 'lutealPhase',
    url: 'https://my.clevelandclinic.org/health/articles/24417-luteal-phase',
  },
  {
    key: 'fertileWindowStart',
    url: 'https://www.acog.org/womens-health/experts-and-stories/the-latest/trying-to-get-pregnant-heres-when-to-have-sex',
  },
  {
    key: 'limits',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9171018/',
  },
] as const

// Learn-more items that use a term worth explaining.
const LEARN_MORE_TERMS: Record<string, GlossaryKey | undefined> = {
  lutealPhase: 'corpusLuteum',
  fertileWindowStart: 'fertileWindow',
}

export function DisclosurePanel({ state }: DisclosurePanelProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState<OpenSection>(null)

  const toggle = (section: OpenSection) =>
    setOpen((current) => (current === section ? null : section))

  return (
    <div className={styles.panel}>
      <p className={styles.sentence}>{t('engine.formula.sentence')}</p>

      <div>
        <button
          type="button"
          className={styles.row}
          aria-expanded={open === 'math'}
          onClick={() => toggle('math')}
        >
          {t('engine.formula.showMath')}
          <ChevronIcon
            className={[styles.chevron, open === 'math' && styles.chevronOpen]
              .filter(Boolean)
              .join(' ')}
          />
        </button>
        <Collapse open={open === 'math'}>
          <div className={styles.content}>
            {FORMULAS.map((latex) => (
              <MathBlock key={latex} latex={latex} />
            ))}
            <p className="label-caps">{t('engine.formula.legend.title')}</p>
            <ul className={styles.legend}>
              <li>{t('engine.formula.legend.cycleLength')}</li>
              <li>{t('engine.formula.legend.periodStart')}</li>
              <li>{t('engine.formula.legend.weight')}</li>
              <li>{t('engine.formula.legend.predictedDate')}</li>
              <li>{t('engine.formula.legend.ovulationDate')}</li>
              <li>{t('engine.formula.legend.lutealLength')}</li>
            </ul>

            <p className="label-caps">{t('engine.formula.learnMore.title')}</p>
            <ul className={styles.legend}>
              {LEARN_MORE_SOURCES.map(({ key, url }) => (
                <li key={key}>
                  {t(`engine.formula.learnMore.${key}`)}
                  {LEARN_MORE_TERMS[key] && <TermHint term={LEARN_MORE_TERMS[key]} />}{' '}
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    {t('engine.formula.sourceLabel')}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </Collapse>
      </div>

      <div>
        <button
          type="button"
          className={styles.row}
          aria-expanded={open === 'numbers'}
          onClick={() => toggle('numbers')}
        >
          {t('engine.formula.withYourNumbers')}
          <ChevronIcon
            className={[styles.chevron, open === 'numbers' && styles.chevronOpen]
              .filter(Boolean)
              .join(' ')}
          />
        </button>
        <Collapse open={open === 'numbers'}>
          <div className={styles.content}>
            <p className="label-caps">{t('engine.formula.yourNumbers.cycleLengthsTitle')}</p>
            <ul className={styles.cycleList}>
              {state.math.weightedCycles.map((cycle, i) => (
                <li key={i} className="numeral">
                  {t('engine.formula.yourNumbers.cycleLengthWithWeight', {
                    length: cycle.length,
                    weight: cycle.weight.toFixed(2),
                  })}
                </li>
              ))}
            </ul>
            {state.math.weightedMean !== null && (
              <p className="numeral">
                {t('engine.formula.meanLabel')}: {state.math.weightedMean.toFixed(1)}
                <TermHint term="weightedAverage" />
              </p>
            )}
            {state.math.excludedCycles.length > 0 && (
              <>
                <p className="label-caps">{t('engine.formula.excludedLabel')}</p>
                <ul className={styles.cycleList}>
                  {state.math.excludedCycles.map((excluded, i) => (
                    <li key={i} className="numeral">
                      {excluded.length} ({t(`engine.formula.excludedReason.${excluded.reason}`)})
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </Collapse>
      </div>
    </div>
  )
}
