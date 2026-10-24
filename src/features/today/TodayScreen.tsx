import { formatISO } from 'date-fns'
import { motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { CheckIcon, ChevronIcon, DropIcon, PlusIcon } from '@/ui/Icon'
import { Bloom, Sprig } from '@/ui/art/Botanical'
import { ButtonVine } from '@/ui/art/ButtonVine'
import { Button } from '@/ui/Button'
import { Chip } from '@/ui/Chip'
import { useConfirm } from '@/ui/ConfirmDialog'
import { REVEAL } from '@/ui/motion'
import { formatShortDate, formatWeekdayDay } from '@/ui/dateFormat'
import { useCycleState } from '@/store/cycleStore'
import { useLogStore } from '@/store/logStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useUiStore } from '@/store/uiStore'
import { CalendarSection } from '@/features/calendar/CalendarSection'
import { MOODS } from '@/features/log/moods'
import { isSuspiciouslyEarly } from '@/features/log/periodValidation'
import { PHASE_TONE, cycleGeometry } from './phaseColors'
import { statusLineText } from './statusLine'
import { CycleRing } from './CycleRing'
import { PhaseTimeline } from './PhaseTimeline'
import styles from './TodayScreen.module.css'

const todayISO = () => formatISO(new Date(), { representation: 'date' })

function greetingKey(): string {
  const hour = new Date().getHours()
  if (hour < 11) return 'today.greeting.morning'
  if (hour < 14) return 'today.greeting.noon'
  if (hour < 18) return 'today.greeting.afternoon'
  return 'today.greeting.evening'
}

export function TodayScreen() {
  const { t, i18n } = useTranslation()
  const reduceMotion = useReducedMotion()
  const confirm = useConfirm()
  const state = useCycleState()
  const logs = useLogStore((s) => s.logs)
  const upsertLog = useLogStore((s) => s.upsertLog)
  const periodLength = useSettingsStore((s) => s.settings.statedPeriodLength)
  const openLogSheet = useUiStore((s) => s.openLogSheet)
  const openDetailsSheet = useUiStore((s) => s.openDetailsSheet)
  const showToast = useUiStore((s) => s.showToast)

  const today = todayISO()
  const todayLog = logs.find((l) => l.date === today)
  const onPeriodToday = Boolean(todayLog?.periodStart || (todayLog?.flow ?? 0) > 0)

  async function startPeriodToday() {
    if (isSuspiciouslyEarly(today, logs) && !(await confirm(t('log.earlyPeriodConfirm')))) return
    await upsertLog({ date: today, periodStart: true, flow: todayLog?.flow || 2 })
    showToast('today.periodStarted')
  }

  const reveal = (i: number) => ({
    variants: REVEAL,
    initial: reduceMotion ? 'show' : 'hidden',
    animate: 'show',
    custom: i,
  })

  return (
    <div className={styles.screen}>
      <motion.header className={styles.header} {...reveal(0)}>
        <div>
          <h1 className={styles.greeting}>{t(greetingKey())}</h1>
          <p className={styles.date}>{formatWeekdayDay(new Date(), i18n.language)}</p>
        </div>
        <Bloom size={64} tone={PHASE_TONE[state.phase]} petals={6} className={styles.headerArt} />
      </motion.header>

      <motion.section className={`${styles.card} ${styles.hero}`} {...reveal(1)}>
        <Sprig width={150} className={styles.heroSprig} still />
        <Sprig width={120} mirror className={styles.heroSprigLeft} still />
        <CycleRing state={state} periodLength={periodLength} />
        <div className={styles.status}>
          <h2 className={styles.statusTitle}>{statusLineText(t, state)}</h2>
          <p className={styles.statusSub}>
            {t('today.expected', {
              date: formatShortDate(state.predictedNextPeriod.date, i18n.language),
            })}
          </p>
          <button type="button" className={styles.detailsButton} onClick={openDetailsSheet}>
            <ButtonVine side="left" />
            <ButtonVine side="right" />
            <span className={styles.detailsLabel}>
              {t('today.insightButton')}
              <ChevronIcon size={14} />
            </span>
          </button>
        </div>
      </motion.section>

      <motion.section
        className={`${styles.card} ${styles.focus}`}
        {...reveal(2)}
        aria-labelledby="focus-title"
      >
        <div className={styles.focusHead}>
          <Bloom size={56} tone={PHASE_TONE[state.phase]} petals={5} still />
          <div>
            <p className={styles.focusKicker}>{t('today.focusKicker')}</p>
            <h2 id="focus-title" style={{ fontSize: '1.25rem' }}>
              {t(`today.phaseStatus.${state.phase}`)}
            </h2>
          </div>
        </div>
        <p className={styles.focusBody}>{t(`today.phaseDescription.${state.phase}`)}</p>
        <ul className={styles.tips}>
          {[1, 2, 3].map((n) => (
            <li key={n} className={styles.tip}>
              <span className={styles.tipIcon}>
                <CheckIcon size={13} />
              </span>
              {t(`today.tips.${state.phase}.tip${n}`)}
            </li>
          ))}
        </ul>
      </motion.section>

      <motion.section className={styles.card} {...reveal(3)} aria-labelledby="quick-log">
        <PhaseTimeline
          geometry={cycleGeometry(state, periodLength)}
          currentDay={state.dayOfCycle}
          currentPhase={state.phase}
        />
        <h2 id="quick-log" className={styles.sectionTitle}>
          {t('today.howAreYou')}
        </h2>
        <div className={styles.moods}>
          {MOODS.map((mood) => (
            <Chip
              key={mood}
              selected={todayLog?.mood === mood}
              onClick={() =>
                void upsertLog({ date: today, mood: todayLog?.mood === mood ? undefined : mood })
              }
            >
              {t(`log.moods.${mood}`)}
            </Chip>
          ))}
        </div>
        <div className={styles.actions}>
          <Button onClick={() => openLogSheet(today)}>
            <PlusIcon size={18} />
            {t('today.logButton')}
          </Button>
          {state.phase !== 'menstrual' && !onPeriodToday ? (
            <Button variant="secondary" onClick={() => void startPeriodToday()}>
              <DropIcon size={18} />
              {t('today.startPeriod')}
            </Button>
          ) : null}
        </div>
      </motion.section>

      <motion.div {...reveal(4)}>
        <CalendarSection />
      </motion.div>
    </div>
  )
}
