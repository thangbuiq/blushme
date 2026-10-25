import type { ReactNode } from 'react'
import { formatISO } from 'date-fns'
import { motion, useReducedMotion } from 'framer-motion'
import { Trans, useTranslation } from 'react-i18next'
import {
  ChevronIcon,
  DropIcon,
  FlowerIcon,
  LeafIcon,
  MoonIcon,
  PlusIcon,
  SparkIcon,
} from '@/ui/Icon'
import { Sprig } from '@/ui/art/Botanical'
import { ButtonVine } from '@/ui/art/ButtonVine'
import { Button } from '@/ui/Button'
import { Avatar } from '@/ui/Avatar'
import { Chip } from '@/ui/Chip'
import { useConfirm } from '@/ui/ConfirmDialog'
import { REVEAL } from '@/ui/motion'
import { formatShortDate, formatWeekdayDay } from '@/ui/dateFormat'
import { isBleeding } from '@/engine/cycleLengths'
import type { Phase } from '@/engine/types'
import { useCycleState } from '@/store/cycleStore'
import { useLogStore } from '@/store/logStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useUiStore } from '@/store/uiStore'
import { CalendarSection } from '@/features/calendar/CalendarSection'
import { MOODS, moodsOf, toggleMood } from '@/features/log/moods'
import { isSuspiciouslyEarly } from '@/features/log/periodValidation'
import { PhaseIllustration } from './PhaseIllustration'
import { PHASE_COLOR, PHASE_TEXT_COLOR, cycleGeometry } from './phaseColors'
import { PhaseTag } from './PhaseTag'
import { focusAlert, focusPrep } from './focus'
import { statusLineText } from './statusLine'
import { CycleRing } from './CycleRing'
import { PhaseTimeline } from './PhaseTimeline'
import styles from './TodayScreen.module.css'

const CARE_GROUPS = [
  { key: 'food', Icon: LeafIcon },
  { key: 'move', Icon: SparkIcon },
  { key: 'mind', Icon: FlowerIcon },
  { key: 'sleep', Icon: MoonIcon },
] as const

const todayISO = () => formatISO(new Date(), { representation: 'date' })

function greetingKey(): string {
  const hour = new Date().getHours()
  if (hour < 11) return 'today.greeting.morning'
  if (hour < 14) return 'today.greeting.noon'
  if (hour < 18) return 'today.greeting.afternoon'
  return 'today.greeting.evening'
}

function PhaseTerm({
  phase,
  onClick,
  children,
}: {
  phase: Phase
  onClick: () => void
  children?: ReactNode
}) {
  return (
    <button
      type="button"
      className={styles.phaseTerm}
      style={{ color: PHASE_TEXT_COLOR[phase] }}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export function TodayScreen() {
  const { t, i18n } = useTranslation()
  const reduceMotion = useReducedMotion()
  const confirm = useConfirm()
  const state = useCycleState()
  const logs = useLogStore((s) => s.logs)
  const upsertLog = useLogStore((s) => s.upsertLog)
  const periodLength = useSettingsStore((s) => s.settings.statedPeriodLength)
  const displayName = useSettingsStore((s) => s.settings.displayName.trim())
  const avatar = useSettingsStore((s) => s.settings.avatar)
  const setScreen = useUiStore((s) => s.setScreen)
  const openLogSheet = useUiStore((s) => s.openLogSheet)
  const openDetailsSheet = useUiStore((s) => s.openDetailsSheet)
  const openPhaseSheet = useUiStore((s) => s.openPhaseSheet)
  const showToast = useUiStore((s) => s.showToast)

  const today = todayISO()
  const prep = focusPrep(state)
  const alert = focusAlert(state, logs)
  const todayLog = logs.find((l) => l.date === today)
  const onPeriodToday = isBleeding(todayLog)
  const todayMoods = todayLog ? moodsOf(todayLog) : []

  async function startPeriodToday() {
    if (isSuspiciouslyEarly(today, logs) && !(await confirm(t('log.earlyPeriodConfirm')))) return
    await upsertLog({ date: today, periodDay: true })
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
          <h1 className={styles.greeting}>
            {t(greetingKey())}
            {displayName && (
              <>
                , <span className={styles.name}>{displayName}</span>
              </>
            )}
          </h1>
          <p className={styles.date}>{formatWeekdayDay(new Date(), i18n.language)}</p>
        </div>
        <button
          type="button"
          className={styles.avatarButton}
          onClick={() => setScreen('settings')}
          aria-label={t('settings.profile.avatarLabel')}
        >
          <Avatar id={avatar} size={56} />
        </button>
      </motion.header>

      <motion.section className={`${styles.card} ${styles.hero}`} {...reveal(1)}>
        <Sprig width={104} className={styles.heroSprig} still />
        <Sprig width={120} mirror className={styles.heroSprigLeft} still />
        <CycleRing state={state} periodLength={periodLength} />
        <div className={styles.status}>
          <button
            type="button"
            className={styles.phaseLine}
            onClick={() => openPhaseSheet(state.phase)}
          >
            <span
              className={styles.phaseDot}
              style={{ backgroundColor: PHASE_COLOR[state.phase] }}
            />
            <PhaseTag phase={state.phase} />
          </button>
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
          <button
            type="button"
            className={styles.focusArt}
            style={{ backgroundColor: `${PHASE_COLOR[state.phase]}22` }}
            aria-label={t(`today.phase.${state.phase}`)}
            onClick={() => openPhaseSheet(state.phase)}
          >
            <PhaseIllustration phase={state.phase} compact />
          </button>
          <div>
            <p className={styles.focusKicker}>{t('today.focusKicker')}</p>
            <h2 id="focus-title" style={{ fontSize: '1.25rem' }}>
              <Trans
                i18nKey={`today.phaseStatus.${state.phase}`}
                components={{
                  term: (
                    <PhaseTerm phase={state.phase} onClick={() => openPhaseSheet(state.phase)} />
                  ),
                }}
              />
            </h2>
          </div>
        </div>
        <div className={styles.prep}>
          <span className={styles.prepKicker}>{t('today.prep.kicker')}</span>
          <p>
            {t(
              prep.key === 'supplies' && prep.count === 0
                ? 'today.prep.suppliesToday'
                : `today.prep.${prep.key}`,
              { count: prep.count },
            )}
          </p>
        </div>
        <p className={styles.focusBody}>{t(`today.phaseDescription.${state.phase}`)}</p>
        <ul className={styles.care}>
          {CARE_GROUPS.map(({ key, Icon }) => (
            <li key={key} className={styles.careItem}>
              <span className={styles.careIcon} aria-hidden="true">
                <Icon size={15} />
              </span>
              <p className={styles.careText}>
                <strong>{t(`today.care.groups.${key}`)}</strong>
                {t(`today.care.${state.phase}.${key}`)}
              </p>
            </li>
          ))}
        </ul>
        {alert && (
          <div className={styles.alert} role="note">
            <p className={styles.alertTitle}>{t('today.alert.title')}</p>
            <p>{t(`today.alert.${alert.code}`, { count: alert.count })}</p>
            <button type="button" className={styles.alertLink} onClick={openDetailsSheet}>
              {t('today.alert.more')}
              <ChevronIcon size={14} />
            </button>
          </div>
        )}
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
              selected={todayMoods.includes(mood)}
              onClick={() =>
                void upsertLog({
                  date: today,
                  moods: toggleMood(todayMoods, mood),
                  mood: undefined,
                })
              }
            >
              {t(`log.moods.${mood}`)}
            </Chip>
          ))}
        </div>
        <div className={styles.actions}>
          <Button className={styles.logButton} onClick={() => openLogSheet(today)}>
            <PlusIcon size={18} />
            {t('today.logButton')}
          </Button>
          {!onPeriodToday ? (
            <Button variant="secondary" onClick={() => void startPeriodToday()}>
              <DropIcon size={18} />
              {t(state.phase === 'menstrual' ? 'today.logPeriodDay' : 'today.startPeriod')}
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
