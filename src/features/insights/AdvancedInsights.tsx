import { motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import type { CycleMath, DailyLog } from '@/engine/types'
import { formatShortDate } from '@/ui/dateFormat'
import { EASE } from '@/ui/motion'
import {
  CYCLE_DAY_BUCKETS,
  advancedTotals,
  bbtSeries,
  moodHeat,
  mucusTally,
  symptomHeat,
  type HeatRow,
} from './advancedData'
import styles from './AdvancedInsights.module.css'

const W = 320
const H = 140
const PAD = { l: 30, r: 10, t: 10, b: 20 }

function scale(min: number, max: number, a: number, b: number) {
  const span = max - min || 1
  return (v: number) => a + ((v - min) / span) * (b - a)
}

function TrendChart({ math }: { math: CycleMath }) {
  const { t } = useTranslation()
  const lengths = math.allCycleLengths.slice(-12)
  const mean = math.weightedMean ?? 0
  const sd = math.weightedStdDev ?? 0
  const lo = Math.min(...lengths, mean - sd) - 2
  const hi = Math.max(...lengths, mean + sd) + 2
  const x = scale(0, Math.max(lengths.length - 1, 1), PAD.l, W - PAD.r)
  const y = scale(lo, hi, H - PAD.b, PAD.t)
  const points = lengths.map((len, i) => `${x(i)},${y(len)}`).join(' ')
  const ticks = [Math.ceil(lo), Math.round((lo + hi) / 2), Math.floor(hi)]
  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.svg} role="img" aria-label={t('insights.advanced.trendTitle')}>
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(tick)} y2={y(tick)} className={styles.grid} />
            <text x={PAD.l - 6} y={y(tick) + 3} className={styles.tick} textAnchor="end">
              {tick}
            </text>
          </g>
        ))}
        <rect
          x={PAD.l}
          width={W - PAD.l - PAD.r}
          y={y(mean + sd)}
          height={Math.max(y(mean - sd) - y(mean + sd), 0)}
          className={styles.band}
        />
        <line x1={PAD.l} x2={W - PAD.r} y1={y(mean)} y2={y(mean)} className={styles.meanLine} />
        <polyline points={points} className={styles.line} />
        {lengths.map((len, i) => (
          <circle key={i} cx={x(i)} cy={y(len)} r={3.5} className={styles.dot}>
            <title>{len}</title>
          </circle>
        ))}
      </svg>
      <p className={styles.legend}>{t('insights.advanced.trendLegend', { avg: Math.round(mean) })}</p>
    </>
  )
}

function BbtChart({ logs, fahrenheit }: { logs: DailyLog[]; fahrenheit: boolean }) {
  const { t, i18n } = useTranslation()
  const series = bbtSeries(logs)
  if (series.length < 2) return <p className={styles.legend}>{t('insights.advanced.bbtEmpty')}</p>
  const conv = (c: number) => (fahrenheit ? (c * 9) / 5 + 32 : c)
  const values = series.map((p) => conv(p.value))
  const pad = fahrenheit ? 0.3 : 0.15
  const lo = Math.min(...values) - pad
  const hi = Math.max(...values) + pad
  const x = scale(0, series.length - 1, PAD.l + 8, W - PAD.r)
  const y = scale(lo, hi, H - PAD.b, PAD.t)
  const points = values.map((v, i) => `${x(i)},${y(v)}`).join(' ')
  const ticks = [lo + pad, (lo + hi) / 2, hi - pad]
  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.svg} role="img" aria-label={t('insights.advanced.bbtTitle')}>
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(tick)} y2={y(tick)} className={styles.grid} />
            <text x={PAD.l - 6} y={y(tick) + 3} className={styles.tick} textAnchor="end">
              {tick.toFixed(1)}°
            </text>
          </g>
        ))}
        <polyline points={points} className={styles.line} />
        {values.map((v, i) => (
          <circle key={series[i].date} cx={x(i)} cy={y(v)} r={2.8} className={styles.dot}>
            <title>{`${formatShortDate(series[i].date, i18n.language)}: ${v.toFixed(2)}`}</title>
          </circle>
        ))}
      </svg>
      <p className={styles.legend}>{t('insights.advanced.bbtLegend', { count: series.length })}</p>
    </>
  )
}

function MucusBars({ logs }: { logs: DailyLog[] }) {
  const { t } = useTranslation()
  const reduceMotion = useReducedMotion()
  const items = mucusTally(logs)
  const max = Math.max(...items.map((i) => i.count), 0)
  if (max === 0) return <p className={styles.legend}>{t('insights.advanced.mucusEmpty')}</p>
  return (
    <div className={styles.rows}>
      {items.map((item, i) => (
        <div key={item.key} className={styles.row}>
          <span>{t(`log.advanced.cervicalMucus.${item.key}`)}</span>
          <span className={styles.track}>
            <motion.span
              className={styles.fill}
              initial={reduceMotion ? false : { width: 0 }}
              animate={{ width: `${(item.count / max) * 100}%` }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.08 * i }}
            />
          </span>
          <span className={styles.count}>{item.count}</span>
        </div>
      ))}
    </div>
  )
}

function Heatmap({ rows, namespace }: { rows: HeatRow[]; namespace: 'log.symptoms' | 'log.moods' }) {
  const { t } = useTranslation()
  if (rows.length === 0) return <p className={styles.legend}>{t('insights.advanced.heatEmpty')}</p>
  const max = Math.max(...rows.flatMap((r) => r.counts), 1)
  return (
    <div className={styles.heat} style={{ gridTemplateColumns: `minmax(80px, 1.4fr) repeat(${CYCLE_DAY_BUCKETS.length}, 1fr)` }}>
      <span />
      {CYCLE_DAY_BUCKETS.map((b) => (
        <span key={b.key} className={styles.heatHead}>
          {t(`insights.advanced.${b.key}`)}
        </span>
      ))}
      {rows.map((row) => (
        <HeatLine key={row.key} row={row} namespace={namespace} max={max} />
      ))}
    </div>
  )
}

function HeatLine({ row, namespace, max }: { row: HeatRow; namespace: string; max: number }) {
  const { t } = useTranslation()
  return (
    <>
      <span className={styles.heatLabel}>{t(`${namespace}.${row.key}`, { defaultValue: row.key })}</span>
      {row.counts.map((count, i) => (
        <span
          key={i}
          className={styles.heatCell}
          style={{ ['--heat' as string]: count / max }}
          title={String(count)}
        >
          {count > 0 ? count : ''}
        </span>
      ))}
    </>
  )
}

export function AdvancedInsights({
  math,
  logs,
  fahrenheit,
  reveal,
}: {
  math: CycleMath
  logs: DailyLog[]
  fahrenheit: boolean
  reveal: (i: number) => object
}) {
  const { t } = useTranslation()
  const totals = advancedTotals(logs)
  const totalItems: [string, number][] = [
    ['lhPositives', totals.lhPositives],
    ['intimacyDays', totals.intimacyDays],
    ['bbtReadings', totals.bbtReadings],
    ['mucusEntries', totals.mucusEntries],
  ]
  return (
    <>
      <motion.h2 className={styles.sectionHead} {...reveal(5)}>
        {t('insights.advanced.title')}
      </motion.h2>
      <motion.section className={styles.card} {...reveal(6)}>
        <h3 className={styles.title}>{t('insights.advanced.trendTitle')}</h3>
        <TrendChart math={math} />
      </motion.section>
      <motion.section className={styles.card} {...reveal(7)}>
        <h3 className={styles.title}>{t('insights.advanced.bbtTitle')}</h3>
        <BbtChart logs={logs} fahrenheit={fahrenheit} />
      </motion.section>
      <motion.section className={styles.card} {...reveal(8)}>
        <h3 className={styles.title}>{t('insights.advanced.mucusTitle')}</h3>
        <MucusBars logs={logs} />
      </motion.section>
      <motion.section className={styles.card} {...reveal(9)}>
        <h3 className={styles.title}>{t('insights.advanced.totalsTitle')}</h3>
        <div className={styles.totals}>
          {totalItems.map(([key, value]) => (
            <div key={key} className={styles.total}>
              <span className={styles.totalValue}>{value}</span>
              <span className={styles.legend}>{t(`insights.advanced.${key}`)}</span>
            </div>
          ))}
        </div>
      </motion.section>
      <motion.section className={`${styles.card} ${styles.wide}`} {...reveal(10)}>
        <h3 className={styles.title}>{t('insights.advanced.heatSymptoms')}</h3>
        <Heatmap rows={symptomHeat(logs)} namespace="log.symptoms" />
      </motion.section>
      <motion.section className={`${styles.card} ${styles.wide}`} {...reveal(11)}>
        <h3 className={styles.title}>{t('insights.advanced.heatMoods')}</h3>
        <Heatmap rows={moodHeat(logs)} namespace="log.moods" />
      </motion.section>
    </>
  )
}
