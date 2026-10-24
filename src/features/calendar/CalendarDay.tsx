import { motion, useReducedMotion } from 'framer-motion'
import { TAP_SCALE, TAP_TRANSITION } from '@/ui/motion'
import type { DayState } from './dayState'
import styles from './CalendarDay.module.css'

interface CalendarDayProps {
  dayOfMonth: number
  state: DayState
  isToday: boolean
  isCurrentMonth: boolean
  onClick: () => void
  ariaLabel: string
}

export function CalendarDay({
  dayOfMonth,
  state,
  isToday,
  isCurrentMonth,
  onClick,
  ariaLabel,
}: CalendarDayProps) {
  const reduceMotion = useReducedMotion()
  const classNames = [
    styles.day,
    state.logged && styles.logged,
    !state.logged && state.predicted && styles.predicted,
    !state.logged && state.fertile === 'fertile' && styles.fertile,
    !state.logged && state.fertile === 'low' && styles.low,
    !state.logged && state.fertile === 'ovulation' && styles.ovulation,
    isToday && styles.today,
    !isCurrentMonth && styles.outside,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <motion.button
      type="button"
      className={classNames}
      onClick={onClick}
      aria-label={ariaLabel}
      whileTap={reduceMotion ? undefined : { scale: TAP_SCALE }}
      transition={TAP_TRANSITION}
    >
      <span className="numeral">{dayOfMonth}</span>
      {state.fertile === 'fertile' && (
        <>
          <span className={styles.fertileUnderline} aria-hidden="true" />
          <span className={styles.fertileDot} aria-hidden="true" />
        </>
      )}
      {state.fertile === 'ovulation' && <span className={styles.ovulationDot} aria-hidden="true" />}
    </motion.button>
  )
}
