import { differenceInCalendarDays, parseISO } from 'date-fns'
import { useTranslation } from 'react-i18next'
import type { CycleState } from '@/engine/types'
import styles from './ForecastChart.module.css'

const W = 340
const H = 210
const PAD = { top: 22, right: 10, bottom: 30, left: 30 }
const MAX_PAST = 6

/** Recent cycle lengths as bars, with the forecast cycle shown as a range against the expected band. */
export function ForecastChart({ state }: { state: CycleState }) {
  const { t } = useTranslation()
  const { math, predictedNextPeriod, lastPeriodStart } = state

  const past = math.allCycleLengths.slice(-MAX_PAST)
  const offset = math.allCycleLengths.length - past.length
  const excluded = new Set(math.excludedCycles.map((c) => c.index))

  const expected = differenceInCalendarDays(
    parseISO(predictedNextPeriod.date),
    parseISO(lastPeriodStart),
  )
  const lo = expected - predictedNextPeriod.rangeDays
  const hi = expected + predictedNextPeriod.rangeDays

  const yMin = Math.floor(Math.min(...past, lo) / 2) * 2 - 4
  const yMax = Math.ceil(Math.max(...past, hi) / 2) * 2 + 2
  const plotW = W - PAD.left - PAD.right
  const plotH = H - PAD.top - PAD.bottom
  const y = (v: number) => PAD.top + plotH * (1 - (v - yMin) / (yMax - yMin))
  const slots = past.length + 1
  const slotW = plotW / slots
  const cx = (i: number) => PAD.left + slotW * (i + 0.5)
  const barW = Math.min(26, slotW * 0.56)
  const ticks = [yMin + 2, Math.round((yMin + yMax) / 2), yMax - 2]
  const fx = cx(past.length)

  return (
    <figure className={styles.figure}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={t('insights.forecast.aria', { lo, hi, expected })}
        className={styles.svg}
      >
        {ticks.map((v) => (
          <g key={v}>
            <line className={styles.grid} x1={PAD.left} x2={W - PAD.right} y1={y(v)} y2={y(v)} />
            <text className={styles.axis} x={PAD.left - 6} y={y(v) + 3} textAnchor="end">
              {v}
            </text>
          </g>
        ))}

        <rect className={styles.band} x={PAD.left} y={y(hi)} width={plotW} height={y(lo) - y(hi)} />
        <line
          className={styles.expected}
          x1={PAD.left}
          x2={W - PAD.right}
          y1={y(expected)}
          y2={y(expected)}
        />

        {past.map((len, i) => (
          <g key={offset + i}>
            <rect
              className={excluded.has(offset + i) ? styles.barExcluded : styles.bar}
              x={cx(i) - barW / 2}
              y={y(len)}
              width={barW}
              height={y(yMin) - y(len)}
              rx={1}
            />
            <text className={styles.value} x={cx(i)} y={y(len) - 5} textAnchor="middle">
              {len}
            </text>
          </g>
        ))}

        <line
          className={styles.divider}
          x1={fx - slotW / 2}
          x2={fx - slotW / 2}
          y1={PAD.top - 8}
          y2={y(yMin)}
        />
        <line className={styles.whisker} x1={fx} x2={fx} y1={y(hi)} y2={y(lo)} />
        <line className={styles.whisker} x1={fx - 8} x2={fx + 8} y1={y(hi)} y2={y(hi)} />
        <line className={styles.whisker} x1={fx - 8} x2={fx + 8} y1={y(lo)} y2={y(lo)} />
        <circle className={styles.dot} cx={fx} cy={y(expected)} r={5} />
        <text className={styles.forecastValue} x={fx} y={y(hi) - 7} textAnchor="middle">
          {lo}-{hi}
        </text>

        <line
          className={styles.baseline}
          x1={PAD.left}
          x2={W - PAD.right}
          y1={y(yMin)}
          y2={y(yMin)}
        />
        <text
          className={styles.axis}
          x={(PAD.left + fx - slotW / 2) / 2}
          y={H - 10}
          textAnchor="middle"
        >
          {t('insights.forecast.past')}
        </text>
        <text className={styles.axisStrong} x={fx} y={H - 10} textAnchor="middle">
          {t('insights.forecast.next')}
        </text>
      </svg>
      <ul className={styles.legend}>
        <li>
          <span className={`${styles.swatch} ${styles.swatchBand}`} aria-hidden="true" />
          {t('insights.forecast.legendBand', { lo, hi })}
        </li>
        <li>
          <span className={`${styles.swatch} ${styles.swatchDot}`} aria-hidden="true" />
          {t('insights.forecast.legendExpected', { expected })}
        </li>
        {past.some((_, i) => excluded.has(offset + i)) && (
          <li>
            <span className={`${styles.swatch} ${styles.swatchExcluded}`} aria-hidden="true" />
            {t('insights.forecast.legendExcluded')}
          </li>
        )}
      </ul>
    </figure>
  )
}
