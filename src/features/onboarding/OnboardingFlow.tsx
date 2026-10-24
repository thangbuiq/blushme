import { useState, type ReactNode } from 'react'
import { formatISO } from 'date-fns'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Button } from '@/ui/Button'
import { Chip } from '@/ui/Chip'
import { DatePicker } from '@/ui/DatePicker'
import { Field } from '@/ui/Input'
import { ChevronIcon, DropIcon, LeafIcon, SparkIcon } from '@/ui/Icon'
import { Bloom } from '@/ui/art/Botanical'
import { SCREEN_TRANSITION, SPRING } from '@/ui/motion'
import { useSettingsStore } from '@/store/settingsStore'
import { useLogStore } from '@/store/logStore'
import { setStoredLanguage } from '@/i18n'
import { NAME_MAX, type Goal } from '@/data/settings'
import styles from './OnboardingFlow.module.css'

type Step = 'step1' | 'step2' | 'step3' | 'disclaimer'

const STEPS: Step[] = ['step1', 'step2', 'step3', 'disclaimer']
const GOALS: { goal: Goal; icon: typeof DropIcon; key: string }[] = [
  { goal: 'track', icon: DropIcon, key: 'Track' },
  { goal: 'ttc', icon: SparkIcon, key: 'Ttc' },
  { goal: 'avoiding', icon: LeafIcon, key: 'Avoiding' },
]
const todayISO = () => formatISO(new Date(), { representation: 'date' })

function Stepper({
  value,
  min,
  max,
  unit,
  label,
  disabled,
  onChange,
}: {
  value: number
  min: number
  max: number
  unit: string
  label: string
  disabled?: boolean
  onChange: (value: number) => void
}) {
  const { t } = useTranslation()
  return (
    <div className={styles.chipGroup} style={disabled ? { opacity: 0.5 } : undefined}>
      <span className="label-caps" id={`${label}-l`}>
        {label}
      </span>
      <div className={styles.stepper} role="group" aria-labelledby={`${label}-l`}>
        <button
          type="button"
          className={styles.stepperButton}
          aria-label={t('common.decrease')}
          disabled={disabled || value <= min}
          onClick={() => onChange(value - 1)}
        >
          −
        </button>
        <span className={styles.stepperValue} aria-live="polite">
          {value}
          <span className={styles.stepperUnit}>{unit}</span>
        </span>
        <button
          type="button"
          className={styles.stepperButton}
          aria-label={t('common.increase')}
          disabled={disabled || value >= max}
          onClick={() => onChange(value + 1)}
        >
          +
        </button>
      </div>
    </div>
  )
}

function Frame({
  children,
  footer,
  art,
  index,
}: {
  children: ReactNode
  footer: ReactNode
  art: 'rose' | 'lavender' | 'butter' | 'mint'
  index: number
}) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.div
      initial={reduceMotion ? undefined : { opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, x: -24 }}
      transition={SCREEN_TRANSITION}
      className={styles.stepInner}
    >
      <div className={styles.content}>
        <Bloom size={72} tone={art} petals={index % 2 ? 5 : 6} className={styles.art} />
        {children}
      </div>
      <div className={styles.footer}>{footer}</div>
    </motion.div>
  )
}

export function OnboardingFlow() {
  const { t, i18n } = useTranslation()
  const reduceMotion = useReducedMotion()
  const update = useSettingsStore((s) => s.update)
  const upsertLog = useLogStore((s) => s.upsertLog)

  const [step, setStep] = useState<Step>('step1')
  const [goal, setGoal] = useState<Goal>('track')
  const [name, setName] = useState('')
  const [lastPeriodDate, setLastPeriodDate] = useState(todayISO())
  const [hasLastPeriodDate, setHasLastPeriodDate] = useState(false)
  const [cycleLength, setCycleLength] = useState(28)
  const [periodLength, setPeriodLength] = useState(5)
  const [notSure, setNotSure] = useState(false)
  const [saving, setSaving] = useState(false)

  const index = STEPS.indexOf(step)

  async function finishOnboarding() {
    setSaving(true)
    if (hasLastPeriodDate) {
      await upsertLog({ date: lastPeriodDate, periodStart: true })
    }
    await update({
      goal,
      displayName: name.trim(),
      language: i18n.language.startsWith('en') ? 'en' : 'vi',
      statedCycleLength: notSure ? 28 : cycleLength,
      statedPeriodLength: notSure ? 5 : periodLength,
      statedConfidenceLow: notSure,
      onboardingComplete: true,
    })
    setSaving(false)
  }

  const next = (to: Step) => () => setStep(to)

  return (
    <div className={`${styles.screen} scroll`}>
      <div className={styles.top}>
        {index > 0 && (
          <button
            type="button"
            className={styles.back}
            onClick={() => setStep(STEPS[index - 1])}
            aria-label={t('common.back')}
          >
            <ChevronIcon className={styles.backIcon} />
          </button>
        )}
        <div
          className={styles.progress}
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={STEPS.length}
          aria-valuenow={index + 1}
        >
          {STEPS.map((s, i) => (
            <span key={s} className={styles.dot}>
              <motion.span
                className={styles.dotFill}
                initial={false}
                animate={{ width: i <= index ? '100%' : '0%' }}
                transition={reduceMotion ? { duration: 0 } : SPRING}
              />
            </span>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {step === 'step1' && (
          <Frame
            key="step1"
            index={index}
            art="rose"
            footer={<Button onClick={next('step2')}>{t('common.next')}</Button>}
          >
            <h1>{t('onboarding.step1.title')}</h1>
            <div className={styles.chipGroup}>
              <span className="label-caps">{t('onboarding.step1.languageLabel')}</span>
              <div className={styles.languageRow}>
                {(['vi', 'en'] as const).map((lang) => (
                  <Chip
                    key={lang}
                    selected={i18n.language.startsWith(lang)}
                    onClick={() => {
                      setStoredLanguage(lang)
                      void i18n.changeLanguage(lang)
                    }}
                  >
                    {lang === 'vi' ? 'Tiếng Việt' : 'English'}
                  </Chip>
                ))}
              </div>
            </div>
            <Field
              id="onboarding-name"
              label={t('onboarding.step1.nameLabel')}
              placeholder={t('onboarding.step1.namePlaceholder')}
              maxLength={NAME_MAX}
              autoComplete="given-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className={styles.chipGroup}>
              <span className="label-caps">{t('onboarding.step1.goalLabel')}</span>
              <div className={styles.goalList}>
                {GOALS.map(({ goal: g, icon: GoalIcon, key }) => (
                  <motion.button
                    key={g}
                    type="button"
                    aria-pressed={goal === g}
                    className={[styles.goal, goal === g && styles.goalSelected]
                      .filter(Boolean)
                      .join(' ')}
                    whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                    onClick={() => setGoal(g)}
                  >
                    <GoalIcon size={24} />
                    <span className={styles.goalText}>
                      <strong>{t(`onboarding.step1.goal${key}`)}</strong>
                      <span className={styles.goalHint}>
                        {t(`onboarding.step1.goal${key}Hint`)}
                      </span>
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          </Frame>
        )}

        {step === 'step2' && (
          <Frame
            key="step2"
            index={index}
            art="lavender"
            footer={
              <>
                <Button onClick={next('step3')}>{t('common.next')}</Button>
                <button type="button" className={styles.skipLink} onClick={next('step3')}>
                  {t('common.skip')}
                </button>
              </>
            }
          >
            <h1>{t('onboarding.step2.title')}</h1>
            <p className={styles.disclaimer}>{t('onboarding.step2.helper')}</p>
            <DatePicker
              label={t('onboarding.step2.label')}
              id="last-period-date"
              value={lastPeriodDate}
              max={todayISO()}
              onChange={(date) => {
                setLastPeriodDate(date)
                setHasLastPeriodDate(true)
              }}
            />
          </Frame>
        )}

        {step === 'step3' && (
          <Frame
            key="step3"
            index={index}
            art="butter"
            footer={<Button onClick={next('disclaimer')}>{t('common.next')}</Button>}
          >
            <h1>{t('onboarding.step3.title')}</h1>
            <Stepper
              label={t('onboarding.step3.cycleLengthLabel')}
              unit={t('common.days')}
              value={cycleLength}
              min={21}
              max={45}
              disabled={notSure}
              onChange={setCycleLength}
            />
            <Stepper
              label={t('onboarding.step3.periodLengthLabel')}
              unit={t('common.days')}
              value={periodLength}
              min={2}
              max={10}
              disabled={notSure}
              onChange={setPeriodLength}
            />
            <div>
              <Chip selected={notSure} onClick={() => setNotSure((v) => !v)}>
                {t('common.notSure')}
              </Chip>
            </div>
          </Frame>
        )}

        {step === 'disclaimer' && (
          <Frame
            key="disclaimer"
            index={index}
            art="mint"
            footer={
              <Button loading={saving} onClick={() => void finishOnboarding()}>
                {t('onboarding.start')}
              </Button>
            }
          >
            <h1>{t('onboarding.disclaimerTitle')}</h1>
            <p className={styles.disclaimer}>{t('onboarding.disclaimer')}</p>
          </Frame>
        )}
      </AnimatePresence>
    </div>
  )
}
