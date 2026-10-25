import { formatISO } from 'date-fns'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { CheckIcon, CloseIcon } from '@/ui/Icon'
import { Bloom } from '@/ui/art/Botanical'
import { formatShortDate } from '@/ui/dateFormat'
import { useCycleState } from '@/store/cycleStore'
import { useSettingsStore } from '@/store/settingsStore'
import { dueReminder } from './periodReminder'
import styles from './PeriodReminderDialog.module.css'

const todayISO = () => formatISO(new Date(), { representation: 'date' })

// A calm banner pinned to the top of the app, shown on each day of the lead window
// (and while on the period) until it is closed for the day (a swipe up also closes it), confirmed with "ready",
// or switched off. It never blocks the screen underneath.
export function PeriodReminderDialog() {
  const { t, i18n } = useTranslation()
  const reduceMotion = useReducedMotion()
  const state = useCycleState()
  const settings = useSettingsStore((s) => s.settings)
  const update = useSettingsStore((s) => s.update)

  const predictedDate = state.predictedNextPeriod.date
  const reminder = dueReminder({
    today: todayISO(),
    predictedDate,
    rangeDays: state.predictedNextPeriod.rangeDays,
    paused: state.paused,
    enabled: settings.periodReminder,
    onPeriod: state.phase === 'menstrual',
    dismissedFor: settings.reminderDismissedFor,
    lastShown: settings.reminderLastShown,
  })

  const upcoming = reminder?.kind === 'upcoming' || reminder?.kind === 'inRange'
  const days = reminder?.kind === 'upcoming' ? reminder.days : 0
  const when =
    reminder?.kind === 'inRange'
      ? 'inRange'
      : !upcoming
        ? 'during'
        : days === 0
          ? 'today'
          : days === 1
            ? 'tomorrow'
            : 'soon'

  // "Shown" doubles as "closed for today", so it comes back tomorrow.
  const closeForToday = () => void update({ reminderLastShown: todayISO() })
  const markReady = () => void update({ reminderDismissedFor: predictedDate })
  const turnOff = () => void update({ periodReminder: false })

  return (
    <AnimatePresence>
      {reminder && (
        <motion.div
          key="period-reminder"
          className={`${styles.banner} ${upcoming ? '' : styles.during}`}
          role="status"
          aria-live="polite"
          initial={reduceMotion ? undefined : { opacity: 0, y: -32, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -32 }}
          transition={{ duration: reduceMotion ? 0 : 0.34, ease: [0.22, 1, 0.36, 1] }}
          drag={reduceMotion ? false : 'y'}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0.6, bottom: 0.05 }}
          onDragEnd={(_, info) => {
            if (info.offset.y < -40 || info.velocity.y < -400) closeForToday()
          }}
        >
          <div className={styles.icon} aria-hidden="true">
            <Bloom size={40} tone={upcoming ? 'rose' : 'lavender'} still />
          </div>
          <div className={styles.content}>
            <div className={styles.head}>
              <span className={styles.chip}>{t(`reminder.chip.${when}`, { count: days })}</span>
              <button
                type="button"
                className={styles.close}
                onClick={closeForToday}
                aria-label={t('reminder.close')}
              >
                <CloseIcon size={16} />
              </button>
            </div>
            <p className={styles.title}>
              {t(upcoming ? 'reminder.heading.upcoming' : 'reminder.heading.during')}
            </p>
            <p className={styles.body}>
              {t(`reminder.body.${when}`, {
                date: formatShortDate(predictedDate, i18n.language),
                count: days,
              })}
            </p>
            <div className={styles.actions}>
              {upcoming && (
                <button type="button" className={styles.primary} onClick={markReady}>
                  <CheckIcon size={14} />
                  {t('reminder.ready')}
                </button>
              )}
              <button type="button" className={styles.link} onClick={turnOff}>
                {t('reminder.turnOff')}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
