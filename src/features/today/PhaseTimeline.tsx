import { motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import type { Phase } from '@/engine/types'
import { LoopIcon } from '@/ui/Icon'
import { EASE } from '@/ui/motion'
import { PHASE_COLOR, PHASE_ICON, type CycleGeometry } from './phaseColors'
import styles from './PhaseTimeline.module.css'

interface PhaseTimelineProps {
  geometry: CycleGeometry
  /** Today's day of cycle; draws a marker on the line. */
  currentDay?: number
  /** Highlights this phase and softens the others. */
  currentPhase?: Phase
  /** Adds day ranges under each phase and makes phases tappable. */
  detailed?: boolean
  onSelect?: (phase: Phase) => void
}

/** A thin, linear view of the cycle: symbols above, a phase line, then day labels. The ↻ at the end shows it loops. */
export function PhaseTimeline({
  geometry,
  currentDay,
  currentPhase,
  detailed,
  onSelect,
}: PhaseTimelineProps) {
  const { t } = useTranslation()
  const reduceMotion = useReducedMotion()
  const { cycleLength, segments } = geometry
  const markerLeft = currentDay
    ? `${((Math.min(currentDay, cycleLength) - 0.5) / cycleLength) * 100}%`
    : null
  const range = (from: number, to: number) => (to - from <= 1 ? `${to}` : `${from + 1}-${to}`)

  return (
    <div className={styles.wrap} role="group" aria-label={t('timeline.label')}>
      <div className={styles.row}>
        {segments.map(({ phase, from, to }) => {
          const Icon = PHASE_ICON[phase]
          const dim = currentPhase && currentPhase !== phase
          const content = (
            <>
              <span
                className={styles.symbol}
                style={{ color: PHASE_COLOR[phase], opacity: dim ? 0.75 : 1 }}
              >
                <Icon size={detailed ? 20 : 16} />
              </span>
              <span
                className={styles.bar}
                style={{ backgroundColor: PHASE_COLOR[phase], opacity: dim ? 0.35 : 1 }}
              />
              {detailed && <span className={styles.range}>{range(from, to)}</span>}
            </>
          )
          const style = { flexGrow: to - from }
          return onSelect ? (
            <button
              key={phase}
              type="button"
              className={`${styles.segment} ${styles.interactive}`}
              style={style}
              onClick={() => onSelect(phase)}
              aria-label={t(`today.phase.${phase}`)}
            >
              {content}
            </button>
          ) : (
            <div key={phase} className={styles.segment} style={style}>
              {content}
            </div>
          )
        })}
        {markerLeft && currentPhase && (
          <motion.span
            className={styles.marker}
            style={{ borderColor: PHASE_COLOR[currentPhase] }}
            initial={reduceMotion ? false : { left: '0%', opacity: 0 }}
            animate={{ left: markerLeft, opacity: 1 }}
            transition={{ duration: 1.1, ease: EASE, delay: 0.3 }}
            title={t('timeline.today')}
          />
        )}
      </div>
      <div className={styles.footer}>
        <span>{t('timeline.start')}</span>
        {currentDay && (
          <span className={styles.today}>{t('timeline.todayDay', { day: currentDay })}</span>
        )}
        <span className={styles.loop}>
          {t('timeline.end', { day: cycleLength })}
          <LoopIcon size={14} />
        </span>
      </div>
      <p className={styles.note}>{t('timeline.note')}</p>
    </div>
  )
}
