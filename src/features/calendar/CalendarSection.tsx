import { useMemo, useState } from 'react'
import {
  addDays,
  addMonths,
  endOfMonth,
  formatISO,
  isSameDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { ChevronIcon } from '@/ui/Icon'
import { Button } from '@/ui/Button'
import { SCREEN_TRANSITION } from '@/ui/motion'
import { formatLongDate, formatMonthYear, formatShortDate } from '@/ui/dateFormat'
import { useCycleState } from '@/store/cycleStore'
import { useLogStore } from '@/store/logStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useUiStore } from '@/store/uiStore'
import type { ISODate } from '@/engine/types'
import { computeDayState } from './dayState'
import { currentPeriodSummary } from './periodSummary'
import { CalendarDay } from './CalendarDay'
import { CONFIDENCE_PERCENT } from '@/features/today/confidence'
import { CalendarLegendInline } from './CalendarLegendInline'
import styles from './CalendarSection.module.css'

const WEEKDAY_KEYS_MONDAY_START = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const WEEKDAY_KEYS_SUNDAY_START = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const todayISO = () => formatISO(new Date(), { representation: 'date' })

export function CalendarSection() {
  const { t, i18n } = useTranslation()
  const reduceMotion = useReducedMotion()

  const [monthAnchor, setMonthAnchor] = useState(() => new Date())
  const [direction, setDirection] = useState(0)

  const logs = useLogStore((s) => s.logs)
  const settings = useSettingsStore((s) => s.settings)
  const update = useSettingsStore((s) => s.update)
  const openLogSheet = useUiStore((s) => s.openLogSheet)
  const openDayActions = useUiStore((s) => s.openDayActions)
  const cycleState = useCycleState()

  const weekStartsOn = settings.weekStart === 'monday' ? 1 : 0
  const weekdayLabels =
    settings.weekStart === 'monday' ? WEEKDAY_KEYS_MONDAY_START : WEEKDAY_KEYS_SUNDAY_START

  const days = useMemo(() => {
    const gridStart = startOfWeek(startOfMonth(monthAnchor), { weekStartsOn })
    const monthEnd = endOfMonth(monthAnchor)
    const totalCells =
      Math.ceil((monthEnd.getTime() - gridStart.getTime()) / 86_400_000 / 7 + 1) * 7
    return Array.from({ length: totalCells }, (_, i) => addDays(gridStart, i))
  }, [monthAnchor, weekStartsOn])

  const today = new Date()

  const summary = currentPeriodSummary(todayISO(), logs, cycleState, settings.statedPeriodLength)
  const formatSummaryDate = (iso: ISODate) => formatShortDate(iso, i18n.language)

  function handleDayClick(iso: ISODate) {
    if (logs.some((l) => l.date === iso)) openDayActions(iso)
    else openLogSheet(iso)
  }

  return (
    <div className={styles.section}>
      {summary && (
        <div className={styles.summary}>
          <p>
            {t(
              summary.confirmed
                ? 'calendar.periodSummary.confirmed'
                : 'calendar.periodSummary.estimated',
              {
                start: formatSummaryDate(summary.start),
                end: formatSummaryDate(summary.end),
              },
            )}
          </p>
          {!summary.confirmed && (
            <p className={styles.summaryNote}>{t('calendar.periodSummary.estimatedNote')}</p>
          )}
        </div>
      )}

      <div className={styles.header}>
        <h2>{t('calendar.title')}</h2>
        <div className={styles.monthNav}>
          <button
            type="button"
            className={styles.navButton}
            aria-label={t('common.back')}
            onClick={() => {
              setDirection(-1)
              setMonthAnchor((d) => subMonths(d, 1))
            }}
          >
            <ChevronIcon size={18} className={styles.rotate180} />
          </button>
          <span>{formatMonthYear(monthAnchor, i18n.language)}</span>
          <button
            type="button"
            className={styles.navButton}
            aria-label={t('common.next')}
            onClick={() => {
              setDirection(1)
              setMonthAnchor((d) => addMonths(d, 1))
            }}
          >
            <ChevronIcon size={18} />
          </button>
        </div>
      </div>

      {!settings.fertilityDisclaimerShown && (
        <div className={styles.notice} role="note">
          <p>{t('calendar.fertilityDisclaimer')}</p>
          <Button variant="secondary" onClick={() => update({ fertilityDisclaimerShown: true })}>
            {t('common.gotIt')}
          </Button>
        </div>
      )}

      <div className={styles.weekdayRow}>
        {weekdayLabels.map((key) => (
          <span key={key} className={styles.weekday}>
            {t(`calendar.weekdays.${key}`)}
          </span>
        ))}
      </div>

      <div style={{ overflow: 'hidden' }}>
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={monthAnchor.getFullYear() * 12 + monthAnchor.getMonth()}
            className={styles.grid}
            custom={direction}
            initial={reduceMotion ? undefined : { x: direction * 24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={reduceMotion ? undefined : { x: direction * -24, opacity: 0 }}
            transition={SCREEN_TRANSITION}
          >
            {days.map((day) => {
              const iso = formatISO(day, { representation: 'date' })
              const dayState = computeDayState(iso, logs, cycleState, settings.statedPeriodLength)
              return (
                <CalendarDay
                  key={iso}
                  dayOfMonth={day.getDate()}
                  state={dayState}
                  isToday={isSameDay(day, today)}
                  isCurrentMonth={day.getMonth() === monthAnchor.getMonth()}
                  onClick={() => handleDayClick(iso)}
                  ariaLabel={formatLongDate(day, i18n.language)}
                />
              )
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      <CalendarLegendInline />

      <div className={`${styles.confidence} ${styles[cycleState.confidence]}`}>
        <span className={styles.confidenceLabel}>{t('calendar.confidence')}</span>
        <span className={styles.meter} aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={[
                styles.meterSeg,
                i <= ['low', 'medium', 'high'].indexOf(cycleState.confidence) && styles.meterOn,
              ]
                .filter(Boolean)
                .join(' ')}
            />
          ))}
        </span>
        <span className={styles.confidenceValue}>
          {CONFIDENCE_PERCENT[cycleState.confidence]}% ·{' '}
          {t(`today.details.confidence.${cycleState.confidence}`)}
        </span>
      </div>
    </div>
  )
}
