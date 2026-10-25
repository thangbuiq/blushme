import { useEffect, useState } from 'react'
import { formatISO } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { Bloom } from '@/ui/art/Botanical'
import { Button } from '@/ui/Button'
import { formatShortDate } from '@/ui/dateFormat'
import { useCycleState } from '@/store/cycleStore'
import { useSettingsStore } from '@/store/settingsStore'
import { dueReminder, type Reminder } from './periodReminder'
import styles from './PeriodReminderDialog.module.css'

const todayISO = () => formatISO(new Date(), { representation: 'date' })
const SHOW_DELAY_MS = 1400 // let the Today screen settle before gently interrupting

interface Shown {
  reminder: Reminder
  date: string
}

// A small, calm dialog shown a few days before the predicted period. It appears
// at most once a day, and "ready" silences it until the next prediction.
export function PeriodReminderDialog() {
  const { t, i18n } = useTranslation()
  const state = useCycleState()
  const settings = useSettingsStore((s) => s.settings)
  const update = useSettingsStore((s) => s.update)
  const [ready, setReady] = useState(false)
  // Frozen when first shown: marking it "shown today" would otherwise make it vanish at once.
  const [shown, setShown] = useState<Shown | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), SHOW_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [])

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

  useEffect(() => {
    if (!ready || shown || reminder === null) return
    setShown({ reminder, date: predictedDate })
    void update({ reminderLastShown: todayISO() })
  }, [ready, shown, reminder, predictedDate, update])

  useEffect(() => {
    if (!shown) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setShown(null)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [shown])

  if (!shown) return null

  const { reminder: current } = shown
  const upcoming = current.kind === 'upcoming'
  const days = upcoming ? current.days : 0
  const when = !upcoming ? 'during' : days === 0 ? 'today' : days === 1 ? 'tomorrow' : 'soon'
  const close = () => setShown(null)
  const markReady = () => {
    // Only the heads-up is silenced for good; the care note simply closes for today.
    if (upcoming) void update({ reminderDismissedFor: shown.date })
    close()
  }

  return (
    <div className={styles.backdrop} onClick={close}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="period-reminder-title"
        onClick={(e) => e.stopPropagation()}
      >
        <Bloom size={64} tone="rose" petals={5} still className={styles.bloom} />
        <h2 id="period-reminder-title" className={styles.title}>
          {t('reminder.title')}
        </h2>
        <p className={styles.body}>
          {t(`reminder.body.${when}`, {
            date: formatShortDate(shown.date, i18n.language),
            count: days,
          })}
        </p>
        <p className={styles.note}>{t(upcoming ? 'reminder.note' : 'reminder.duringNote')}</p>
        <div className={styles.actions}>
          <Button onClick={markReady}>{t(upcoming ? 'reminder.ready' : 'reminder.gotIt')}</Button>
          {upcoming && (
            <Button variant="ghost" onClick={close}>
              {t('reminder.later')}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
