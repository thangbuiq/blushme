import { formatISO } from 'date-fns'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { CloseIcon } from '@/ui/Icon'
import { formatShortDate } from '@/ui/dateFormat'
import { useCycleState } from '@/store/cycleStore'
import { useSettingsStore } from '@/store/settingsStore'
import { dueReminder } from './periodReminder'
import styles from './PeriodReminderDialog.module.css'

const todayISO = () => formatISO(new Date(), { representation: 'date' })

// A calm banner pinned to the top of the app, shown on each day of the lead window
// (and while on the period) until it is closed for the day, confirmed with "ready",
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
    paused: state.paused,
    enabled: settings.periodReminder,
    onPeriod: state.phase === 'menstrual',
    dismissedFor: settings.reminderDismissedFor,
    lastShown: settings.reminderLastShown,
  })

  const upcoming = reminder?.kind === 'upcoming'
  const days = reminder?.kind === 'upcoming' ? reminder.days : 0
  const when = !upcoming ? 'during' : days === 0 ? 'today' : days === 1 ? 'tomorrow' : 'soon'

  // "Shown" doubles as "closed for today", so it comes back tomorrow.
  const closeForToday = () => void update({ reminderLastShown: todayISO() })
  const markReady = () => void update({ reminderDismissedFor: predictedDate })
  const turnOff = () => void update({ periodReminder: false })

  return (
    <AnimatePresence>
      {reminder && (
        <motion.div
          key="period-reminder"
          className={styles.banner}
          role="status"
          aria-live="polite"
          initial={reduceMotion ? undefined : { opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -24 }}
          transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className={styles.head}>
            <p className={styles.title}>{t('reminder.title')}</p>
            <button
              type="button"
              className={styles.close}
              onClick={closeForToday}
              aria-label={t('reminder.close')}
            >
              <CloseIcon size={16} />
            </button>
          </div>
          <p className={styles.body}>
            {t(`reminder.body.${when}`, {
              date: formatShortDate(predictedDate, i18n.language),
              count: days,
            })}
          </p>
          <div className={styles.actions}>
            {upcoming && (
              <button type="button" className={styles.primary} onClick={markReady}>
                {t('reminder.ready')}
              </button>
            )}
            <button type="button" className={styles.link} onClick={turnOff}>
              {t('reminder.turnOff')}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
