import { useState } from 'react'
import { formatISO } from 'date-fns'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Button } from '@/ui/Button'
import { SCREEN_TRANSITION } from '@/ui/motion'
import { Chip } from '@/ui/Chip'
import { Field } from '@/ui/Input'
import { DatePicker } from '@/ui/DatePicker'
import { useSettingsStore } from '@/store/settingsStore'
import { useLogStore } from '@/store/logStore'
import type { Goal } from '@/data/db'
import styles from './OnboardingFlow.module.css'

type Step = 'step1' | 'step2' | 'step3' | 'disclaimer' | 'lockOffer'

const GOALS: Goal[] = ['track', 'ttc', 'avoiding']
const todayISO = () => formatISO(new Date(), { representation: 'date' })

export function OnboardingFlow() {
  const { t, i18n } = useTranslation()
  const reduceMotion = useReducedMotion()
  const update = useSettingsStore((s) => s.update)
  const upsertLog = useLogStore((s) => s.upsertLog)

  const [step, setStep] = useState<Step>('step1')
  const [goal, setGoal] = useState<Goal>('track')
  const [lastPeriodDate, setLastPeriodDate] = useState(todayISO())
  const [hasLastPeriodDate, setHasLastPeriodDate] = useState(false)
  const [cycleLength, setCycleLength] = useState('28')
  const [periodLength, setPeriodLength] = useState('5')
  const [notSure, setNotSure] = useState(false)

  async function finishOnboarding() {
    if (hasLastPeriodDate) {
      await upsertLog({ date: lastPeriodDate, periodStart: true })
    }
    await update({
      goal,
      statedCycleLength: notSure ? 28 : Number(cycleLength) || 28,
      statedPeriodLength: notSure ? 5 : Number(periodLength) || 5,
      statedConfidenceLow: notSure,
      fertilityLayerEnabled: goal === 'ttc' || goal === 'avoiding',
    })
    setStep('lockOffer')
  }

  async function finishLockOffer(enableLock: boolean) {
    await update({
      onboardingComplete: true,
      lockEnabled: enableLock,
      lockOfferedAfterFirstLog: true,
    })
  }

  return (
    <div className={styles.screen}>
      <AnimatePresence mode="wait" initial={false}>
        {step === 'step1' && (
          <motion.div
            key="step1"
            initial={reduceMotion ? undefined : { opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, x: -12 }}
            transition={SCREEN_TRANSITION}
            className={styles.stepInner}
          >
            <div className={styles.content}>
              <h1>{t('onboarding.step1.title')}</h1>
              <div className={styles.chipGroup}>
                <span className="label-caps">{t('onboarding.step1.languageLabel')}</span>
                <div className={styles.languageRow}>
                  <Chip
                    selected={i18n.language.startsWith('en')}
                    onClick={() => void i18n.changeLanguage('en')}
                  >
                    English
                  </Chip>
                  <Chip
                    selected={i18n.language.startsWith('vi')}
                    onClick={() => void i18n.changeLanguage('vi')}
                  >
                    Tiếng Việt
                  </Chip>
                </div>
              </div>
              <div className={styles.chipGroup}>
                <span className="label-caps">{t('onboarding.step1.goalLabel')}</span>
                {GOALS.map((g) => (
                  <Chip key={g} selected={goal === g} onClick={() => setGoal(g)}>
                    {t(
                      `onboarding.step1.goal${g === 'track' ? 'Track' : g === 'ttc' ? 'Ttc' : 'Avoiding'}`,
                    )}
                  </Chip>
                ))}
              </div>
            </div>
            <div className={styles.footer}>
              <Button onClick={() => setStep('step2')}>{t('common.next')}</Button>
            </div>
          </motion.div>
        )}

        {step === 'step2' && (
          <motion.div
            key="step2"
            initial={reduceMotion ? undefined : { opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, x: -12 }}
            transition={SCREEN_TRANSITION}
            className={styles.stepInner}
          >
            <div className={styles.content}>
              <h1>{t('onboarding.step2.title')}</h1>
              <p className={styles.disclaimer}>{t('onboarding.step2.helper')}</p>
              <DatePicker
                label={t('onboarding.step2.title')}
                id="last-period-date"
                value={lastPeriodDate}
                max={todayISO()}
                onChange={(date) => {
                  setLastPeriodDate(date)
                  setHasLastPeriodDate(true)
                }}
              />
            </div>
            <div className={styles.footer}>
              <Button onClick={() => setStep('step3')}>{t('common.next')}</Button>
              <button type="button" className={styles.skipLink} onClick={() => setStep('step3')}>
                {t('common.skip')}
              </button>
            </div>
          </motion.div>
        )}

        {step === 'step3' && (
          <motion.div
            key="step3"
            initial={reduceMotion ? undefined : { opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, x: -12 }}
            transition={SCREEN_TRANSITION}
            className={styles.stepInner}
          >
            <div className={styles.content}>
              <h1>{t('onboarding.step3.title')}</h1>
              <Field
                label={t('onboarding.step3.cycleLengthLabel')}
                id="cycle-length"
                type="number"
                inputMode="numeric"
                value={cycleLength}
                disabled={notSure}
                onChange={(e) => setCycleLength(e.target.value)}
              />
              <Field
                label={t('onboarding.step3.periodLengthLabel')}
                id="period-length"
                type="number"
                inputMode="numeric"
                value={periodLength}
                disabled={notSure}
                onChange={(e) => setPeriodLength(e.target.value)}
              />
              <Chip selected={notSure} onClick={() => setNotSure((v) => !v)}>
                {t('common.notSure')}
              </Chip>
            </div>
            <div className={styles.footer}>
              <Button onClick={() => setStep('disclaimer')}>{t('common.next')}</Button>
            </div>
          </motion.div>
        )}

        {step === 'disclaimer' && (
          <motion.div
            key="disclaimer"
            initial={reduceMotion ? undefined : { opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, x: -12 }}
            transition={SCREEN_TRANSITION}
            className={styles.stepInner}
          >
            <div className={styles.content}>
              <p className={styles.disclaimer}>{t('onboarding.disclaimer')}</p>
            </div>
            <div className={styles.footer}>
              <Button onClick={() => void finishOnboarding()}>{t('common.gotIt')}</Button>
            </div>
          </motion.div>
        )}

        {step === 'lockOffer' && (
          <motion.div
            key="lockOffer"
            initial={reduceMotion ? undefined : { opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, x: -12 }}
            transition={SCREEN_TRANSITION}
            className={styles.stepInner}
          >
            <div className={styles.content}>
              <h1>{t('onboarding.lockOffer.title')}</h1>
              <p className={styles.disclaimer}>{t('onboarding.lockOffer.body')}</p>
            </div>
            <div className={styles.footer}>
              <Button onClick={() => void finishLockOffer(true)}>
                {t('onboarding.lockOffer.enable')}
              </Button>
              <button
                type="button"
                className={styles.skipLink}
                onClick={() => void finishLockOffer(false)}
              >
                {t('onboarding.lockOffer.notNow')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
