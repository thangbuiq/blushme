import { formatISO } from 'date-fns'
import { motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Bloom } from '@/ui/art/Botanical'
import { Button } from '@/ui/Button'
import { formatShortDate } from '@/ui/dateFormat'
import { EASE, REVEAL } from '@/ui/motion'
import { useCycleState } from '@/store/cycleStore'
import { useLogStore } from '@/store/logStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useUiStore } from '@/store/uiStore'
import { AdvancedInsights } from './AdvancedInsights'
import {
  averagePeriodLength,
  regularityOf,
  tallyMoods,
  tallySymptoms,
  type Tally,
} from './insightsData'
import styles from './InsightsScreen.module.css'

const MIN_CYCLES = 2

function TallyList({
  items,
  namespace,
}: {
  items: Tally[]
  namespace: 'log.symptoms' | 'log.moods'
}) {
  const { t } = useTranslation()
  const reduceMotion = useReducedMotion()
  const max = Math.max(...items.map((i) => i.count), 1)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {items.map((item, i) => (
        <div key={item.key} className={styles.tallyRow}>
          <span>{t(`${namespace}.${item.key}`, { defaultValue: item.key })}</span>
          <span className={styles.tallyTrack}>
            <motion.span
              className={styles.tallyFill}
              initial={reduceMotion ? false : { width: 0 }}
              animate={{ width: `${(item.count / max) * 100}%` }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.1 * i }}
            />
          </span>
          <span className={styles.tallyCount}>{item.count}</span>
        </div>
      ))}
    </div>
  )
}

export function InsightsScreen() {
  const { t, i18n } = useTranslation()
  const reduceMotion = useReducedMotion()
  const state = useCycleState()
  const logs = useLogStore((s) => s.logs)
  const setScreen = useUiStore((s) => s.setScreen)
  const openLogSheet = useUiStore((s) => s.openLogSheet)
  const advanced = useSettingsStore((s) => s.settings.advancedTracking)
  const imperial = useSettingsStore((s) => s.settings.units === 'imperial')

  const { math } = state
  const valid = math.validCycleLengths.length
  const reveal = (i: number) => ({
    variants: REVEAL,
    initial: reduceMotion ? 'show' : 'hidden',
    animate: 'show',
    custom: i,
  })

  if (valid < MIN_CYCLES) {
    return (
      <div className={styles.screen}>
        <motion.section className={styles.empty} {...reveal(0)}>
          <Bloom size={110} />
          <h1>{t('insights.emptyTitle')}</h1>
          <p className={styles.sub}>{t('insights.emptyBody')}</p>
          <span
            className={styles.progress}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={MIN_CYCLES}
            aria-valuenow={valid}
          >
            <motion.span
              className={styles.progressFill}
              initial={reduceMotion ? false : { width: 0 }}
              animate={{ width: `${(valid / MIN_CYCLES) * 100}%` }}
              transition={{ duration: 0.9, ease: EASE }}
            />
          </span>
          <p className={styles.legend}>
            {t('insights.progress', { done: valid, total: MIN_CYCLES })}
          </p>
          <Button onClick={() => setScreen('today')}>{t('insights.backToToday')}</Button>
        </motion.section>
      </div>
    )
  }

  const recent = math.allCycleLengths.slice(-6)
  const excludedLengths = new Set(math.excludedCycles.map((c) => c.index))
  const offset = math.allCycleLengths.length - recent.length
  const maxLen = Math.max(...recent, 1)
  const mean = math.weightedMean ?? 0
  const regularity = regularityOf(math.weightedStdDev)
  const periodAvg = averagePeriodLength(logs)
  const symptoms = tallySymptoms(logs)
  const moods = tallyMoods(logs)

  return (
    <div className={styles.screen}>
      <motion.header className={`${styles.head} ${styles.full}`} {...reveal(0)}>
        <h1>{t('insights.title')}</h1>
        <p className={styles.sub}>{t('insights.subtitle', { count: valid })}</p>
      </motion.header>

      <motion.div className={`${styles.grid} ${styles.full}`} {...reveal(1)}>
        <div className={`${styles.stat} ${styles.statWide}`}>
          <span className={styles.statLabel}>{t('insights.nextPeriod')}</span>
          <span className={styles.statValue}>
            {formatShortDate(state.predictedNextPeriod.date, i18n.language)}
          </span>
          <span className={styles.statLabel}>
            {t('insights.within', { days: state.predictedNextPeriod.rangeDays })} ·{' '}
            {t(`today.details.confidence.${state.confidence}`)}
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>{t('insights.avgCycle')}</span>
          <span className={styles.statValue}>
            {Math.round(mean)}
            <span className={styles.statUnit}>{t('common.days')}</span>
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>{t('insights.avgPeriod')}</span>
          <span className={styles.statValue}>
            {periodAvg ?? '-'}
            <span className={styles.statUnit}>{t('common.days')}</span>
          </span>
        </div>
        {regularity && (
          <div className={`${styles.stat} ${styles.statWide} ${styles.statFull}`}>
            <span className={styles.statLabel}>{t('insights.regularity')}</span>
            <span className={styles.statValue} style={{ fontSize: '1.5rem' }}>
              {t(`insights.regularityValue.${regularity}`)}
            </span>
            <span className={styles.statLabel}>{t(`insights.regularityHint.${regularity}`)}</span>
          </div>
        )}
      </motion.div>

      <motion.section className={styles.card} {...reveal(2)} aria-labelledby="hist">
        <h2 id="hist" className={styles.cardTitle}>
          {t('insights.history')}
        </h2>
        <div className={styles.bars}>
          {recent.map((len, i) => (
            <div key={offset + i} className={styles.barCol}>
              <span className={styles.barValue}>{len}</span>
              <motion.span
                className={[styles.bar, excludedLengths.has(offset + i) && styles.barExcluded]
                  .filter(Boolean)
                  .join(' ')}
                initial={reduceMotion ? false : { height: 0 }}
                animate={{ height: `${(len / maxLen) * 78}%` }}
                transition={{ duration: 0.8, ease: EASE, delay: 0.08 * i }}
              />
            </div>
          ))}
        </div>
        <p className={styles.legend}>{t('insights.historyLegend', { avg: Math.round(mean) })}</p>
      </motion.section>

      {symptoms.length > 0 && (
        <motion.section className={styles.card} {...reveal(3)}>
          <h2 className={styles.cardTitle}>{t('insights.symptoms')}</h2>
          <TallyList items={symptoms} namespace="log.symptoms" />
        </motion.section>
      )}

      {moods.length > 0 && (
        <motion.section className={styles.card} {...reveal(4)}>
          <h2 className={styles.cardTitle}>{t('insights.moods')}</h2>
          <TallyList items={moods} namespace="log.moods" />
        </motion.section>
      )}

      {symptoms.length === 0 && moods.length === 0 && (
        <motion.section className={styles.card} {...reveal(3)}>
          <h2 className={styles.cardTitle}>{t('insights.noMoodTitle')}</h2>
          <p className={styles.sub}>{t('insights.noMoodBody')}</p>
          <Button
            variant="secondary"
            onClick={() => openLogSheet(formatISO(new Date(), { representation: 'date' }))}
          >
            {t('today.logButton')}
          </Button>
        </motion.section>
      )}

      {advanced ? (
        <AdvancedInsights math={math} logs={logs} fahrenheit={imperial} reveal={reveal} />
      ) : (
        <motion.section className={`${styles.card} ${styles.full}`} {...reveal(5)}>
          <h2 className={styles.cardTitle}>{t('insights.advanced.teaserTitle')}</h2>
          <p className={styles.sub}>{t('insights.advanced.teaserBody')}</p>
          <Button variant="secondary" onClick={() => setScreen('settings')}>
            {t('insights.advanced.teaserAction')}
          </Button>
        </motion.section>
      )}
    </div>
  )
}
