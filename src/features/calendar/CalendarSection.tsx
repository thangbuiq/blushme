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
import { formatShortDate } from '@/ui/dateFormat'
import { useCycleState } from '@/store/cycleStore'
import { useLogStore } from '@/store/logStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useUiStore } from '@/store/uiStore'
import type { ISODate } from '@/engine/types'
import { isSuspiciouslyEarly } from '@/features/log/periodValidation'
import { useConfirm } from '@/ui/ConfirmDialog'
import { computeDayState } from './dayState'
import { currentPeriodSummary } from './periodSummary'
import { CalendarDay, type RangeSelectionState } from './CalendarDay'
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
  const [rangeMode, setRangeMode] = useState(false)
  const [rangeStart, setRangeStart] = useState<ISODate | null>(null)
  const [rangeEnd, setRangeEnd] = useState<ISODate | null>(null)

  const logs = useLogStore((s) => s.logs)
  const upsertLog = useLogStore((s) => s.upsertLog)
  const settings = useSettingsStore((s) => s.settings)
  const update = useSettingsStore((s) => s.update)
  const confirm = useConfirm()
  const openLogSheet = useUiStore((s) => s.openLogSheet)
  const cycleState = useCycleState()

  const weekStartsOn = settings.weekStart === 'monday' ? 1 : 0
  const weekdayLabels = settings.weekStart === 'monday' ? WEEKDAY_KEYS_MONDAY_START : WEEKDAY_KEYS_SUNDAY_START

  const days = useMemo(() => {
    const gridStart = startOfWeek(startOfMonth(monthAnchor), { weekStartsOn })
    const monthEnd = endOfMonth(monthAnchor)
    const totalCells = Math.ceil((monthEnd.getTime() - gridStart.getTime()) / 86_400_000 / 7 + 1) * 7
    return Array.from({ length: totalCells }, (_, i) => addDays(gridStart, i))
  }, [monthAnchor, weekStartsOn])

  const today = new Date()

  const summary = currentPeriodSummary(todayISO(), logs, cycleState, settings.statedPeriodLength)
  const formatSummaryDate = (iso: ISODate) => formatShortDate(iso, i18n.language)

  function startRangeSelect() {
    setRangeMode(true)
    setRangeStart(null)
    setRangeEnd(null)
  }

  function cancelRangeSelect() {
    setRangeMode(false)
    setRangeStart(null)
    setRangeEnd(null)
  }

  function handleDayClick(iso: ISODate) {
    if (!rangeMode) {
      openLogSheet(iso)
      return
    }
    if (!rangeStart) {
      setRangeStart(iso)
    } else if (!rangeEnd) {
      setRangeEnd(iso < rangeStart ? rangeStart : iso)
      if (iso < rangeStart) setRangeStart(iso)
    } else {
      // picking again after both are set restarts the selection
      setRangeStart(iso)
      setRangeEnd(null)
    }
  }

  async function confirmRangeSave() {
    if (!rangeStart || !rangeEnd) return
    if (isSuspiciouslyEarly(rangeStart, logs)) {
      if (!(await confirm(t('log.earlyPeriodConfirm')))) return
    }
    const spanDays = Math.round((new Date(rangeEnd).getTime() - new Date(rangeStart).getTime()) / 86_400_000) + 1
    for (let i = 0; i < spanDays; i++) {
      const date = formatISO(addDays(new Date(rangeStart), i), { representation: 'date' })
      await upsertLog({ date, periodStart: i === 0, flow: 2 })
    }
    cancelRangeSelect()
  }

  const rangeDayCount =
    rangeStart && rangeEnd
      ? Math.round((new Date(rangeEnd).getTime() - new Date(rangeStart).getTime()) / 86_400_000) + 1
      : 0

  return (
    <div className={styles.section}>
      {summary && (
        <div className={styles.summary}>
          <p>
            {t(summary.confirmed ? 'calendar.periodSummary.confirmed' : 'calendar.periodSummary.estimated', {
              start: formatSummaryDate(summary.start),
              end: formatSummaryDate(summary.end),
            })}
          </p>
          {!summary.confirmed && <p className={styles.summaryNote}>{t('calendar.periodSummary.estimatedNote')}</p>}
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
          <span>{monthAnchor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
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

      {!rangeMode && (
        <div className={styles.toolbar}>
          <Button variant="secondary" onClick={startRangeSelect}>
            {t('calendar.rangeSelect.start')}
          </Button>
        </div>
      )}

      {settings.fertilityLayerEnabled && !settings.fertilityDisclaimerShown && (
        <div className={styles.notice} role="note">
          <p>{t('calendar.fertilityDisclaimer')}</p>
          <Button variant="secondary" onClick={() => update({ fertilityDisclaimerShown: true })}>
            {t('common.gotIt')}
          </Button>
        </div>
      )}

      {rangeMode && (
        <p className={styles.rangeHint}>
          {rangeStart ? t('calendar.rangeSelect.promptEnd') : t('calendar.rangeSelect.promptStart')}
        </p>
      )}

      <div className={styles.weekdayRow}>
        {weekdayLabels.map((key) => (
          <span key={key} className={styles.weekday}>
            {key}
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
              const dayState = computeDayState(
                iso,
                logs,
                cycleState,
                settings.statedPeriodLength,
                settings.fertilityLayerEnabled,
              )
              let rangeSelection: RangeSelectionState = null
              if (rangeStart && !rangeEnd && iso === rangeStart) rangeSelection = 'boundary'
              if (rangeStart && rangeEnd) {
                if (iso === rangeStart || iso === rangeEnd) rangeSelection = 'boundary'
                else if (iso > rangeStart && iso < rangeEnd) rangeSelection = 'inside'
              }
              return (
                <CalendarDay
                  key={iso}
                  dayOfMonth={day.getDate()}
                  state={dayState}
                  isToday={isSameDay(day, today)}
                  isCurrentMonth={day.getMonth() === monthAnchor.getMonth()}
                  onClick={() => handleDayClick(iso)}
                  ariaLabel={day.toLocaleDateString(undefined, { dateStyle: 'full' })}
                  rangeSelection={rangeSelection}
                />
              )
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      <CalendarLegendInline fertilityLayerEnabled={settings.fertilityLayerEnabled} />

      {rangeMode && (
        <div className={styles.rangeBar}>
          {rangeStart && rangeEnd ? (
            <Button variant="primary" onClick={() => void confirmRangeSave()}>
              {t('calendar.rangeSelect.save', { days: rangeDayCount })}
            </Button>
          ) : (
            <span className={styles.rangeHint}>{t('calendar.rangeSelect.promptStart')}</span>
          )}
          <Button variant="secondary" onClick={cancelRangeSelect}>
            {t('calendar.rangeSelect.cancel')}
          </Button>
        </div>
      )}
    </div>
  )
}
