import { useEffect, useState } from 'react'
import { addDays, formatISO, parseISO } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { Sheet } from '@/ui/Sheet'
import { Button } from '@/ui/Button'
import { Chip } from '@/ui/Chip'
import { Collapse } from '@/ui/Collapse'
import { ToggleSwitch } from '@/ui/ToggleSwitch'
import { DropIcon, ChevronIcon } from '@/ui/Icon'
import { formatShortDate } from '@/ui/dateFormat'
import { useUiStore } from '@/store/uiStore'
import { useLogStore } from '@/store/logStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useCycleState } from '@/store/cycleStore'
import type { CervicalMucus, Flow } from '@/engine/types'
import { CORE_SYMPTOMS, MORE_SYMPTOMS, type Symptom } from './symptoms'
import { MOODS } from './moods'
import { isContinuingPeriod, isSuspiciouslyEarly, periodDayNumber } from './periodValidation'
import { useConfirm } from '@/ui/ConfirmDialog'
import styles from './LogSheet.module.css'

const CERVICAL_MUCUS_OPTIONS: CervicalMucus[] = ['dry', 'sticky', 'creamy', 'eggWhite']
const todayISO = () => formatISO(new Date(), { representation: 'date' })

export function LogSheet() {
  const { t, i18n } = useTranslation()
  const open = useUiStore((s) => s.logSheetOpen)
  const date = useUiStore((s) => s.logSheetDate)
  const close = useUiStore((s) => s.closeLogSheet)
  const openLogSheet = useUiStore((s) => s.openLogSheet)
  const logs = useLogStore((s) => s.logs)
  const upsertLog = useLogStore((s) => s.upsertLog)
  const advancedTracking = useSettingsStore((s) => s.settings.advancedTracking)
  const confirm = useConfirm()
  const dateCycleState = useCycleState(date ?? undefined)

  const [onPeriod, setOnPeriod] = useState(false)
  const [flow, setFlow] = useState<Flow>(2)
  const [expanded, setExpanded] = useState(false)
  const [showMoreSymptoms, setShowMoreSymptoms] = useState(false)
  const [symptoms, setSymptoms] = useState<Symptom[]>([])
  const [mood, setMood] = useState('')
  const [note, setNote] = useState('')
  const [bbt, setBbt] = useState('')
  const [cervicalMucus, setCervicalMucus] = useState<CervicalMucus | null>(null)
  const [lhPositive, setLhPositive] = useState(false)
  const [intimacy, setIntimacy] = useState(false)

  useEffect(() => {
    if (!open || !date) return
    const existing = logs.find((l) => l.date === date)
    const hasPeriodData = Boolean(existing?.periodStart || (existing?.flow ?? 0) > 0)
    setOnPeriod(hasPeriodData || (!existing && isContinuingPeriod(date, logs)))
    setFlow(existing?.flow ?? 2)
    setSymptoms((existing?.symptoms as Symptom[]) ?? [])
    setMood(existing?.mood ?? '')
    setNote(existing?.note ?? '')
    setBbt(existing?.bbt?.toString() ?? '')
    setCervicalMucus(existing?.cervicalMucus ?? null)
    setLhPositive(existing?.lhPositive ?? false)
    setIntimacy(existing?.intimacy ?? false)
    setExpanded(false)
    setShowMoreSymptoms(false)
  }, [open, date, logs])

  if (!date) return null

  const isToday = date === todayISO()
  const titleText = isToday ? t('log.todayTitle') : formatShortDate(date, i18n.language)
  const showCycleContext = !dateCycleState.paused && dateCycleState.dayOfCycle >= 1
  const subtitleText = showCycleContext
    ? t('log.cycleContext', {
        day: dateCycleState.dayOfCycle,
        phase: t(`today.phaseBadge.${dateCycleState.phase}`),
      })
    : undefined

  function goToDay(offset: number) {
    openLogSheet(formatISO(addDays(parseISO(date!), offset), { representation: 'date' }))
  }

  function toggleSymptom(symptom: Symptom) {
    setSymptoms((current) =>
      current.includes(symptom) ? current.filter((s) => s !== symptom) : [...current, symptom],
    )
  }

  async function handleSave() {
    if (!date) return
    const existing = logs.find((l) => l.date === date)
    const isNewStart = onPeriod && !isContinuingPeriod(date, logs)
    if (isNewStart && !existing?.periodStart && isSuspiciouslyEarly(date, logs)) {
      if (!(await confirm(t('log.earlyPeriodConfirm')))) return
    }
    await upsertLog({
      date,
      periodStart: isNewStart ? true : undefined,
      flow: onPeriod ? flow : undefined,
      symptoms: symptoms.length > 0 ? symptoms : undefined,
      mood: mood || undefined,
      note: note || undefined,
      bbt: advancedTracking && bbt ? Number(bbt) : undefined,
      cervicalMucus: advancedTracking ? (cervicalMucus ?? undefined) : undefined,
      lhPositive: advancedTracking ? lhPositive : undefined,
      intimacy: advancedTracking ? intimacy : undefined,
    })
    close()
  }

  return (
    <Sheet
      open={open}
      onClose={close}
      ariaLabel={titleText}
      title={
        <div className={styles.dateNav}>
          <button
            type="button"
            className={styles.dateNavButton}
            onClick={() => goToDay(-1)}
            aria-label={t('common.back')}
          >
            <ChevronIcon size={16} className={styles.rotate180} />
          </button>
          <span>{titleText}</span>
          <button
            type="button"
            className={styles.dateNavButton}
            onClick={() => goToDay(1)}
            disabled={isToday}
            aria-label={t('common.next')}
          >
            <ChevronIcon size={16} />
          </button>
        </div>
      }
      subtitle={subtitleText}
    >
      <div className={styles.form}>
        <div className={styles.periodToggle}>
          <span>{t('log.onPeriod')}</span>
          <ToggleSwitch checked={onPeriod} onChange={setOnPeriod} ariaLabel={t('log.onPeriod')} />
        </div>

        <Collapse open={onPeriod}>
          <div className={styles.section}>
            <span className="label-caps">
              {t('log.periodDayLabel', { day: periodDayNumber(date, logs) })}
            </span>
            <div className={styles.flowRow} role="radiogroup" aria-label={t('log.flowLabel')}>
              {([1, 2, 3] as Flow[]).map((level) => (
                <button
                  key={level}
                  type="button"
                  role="radio"
                  aria-checked={flow === level}
                  className={[styles.dropButton, flow >= level && styles.dropActive]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => setFlow(level)}
                >
                  <DropIcon size={28} />
                </button>
              ))}
            </div>
          </div>
        </Collapse>

        <div className={styles.section}>
          <span className="label-caps">{t('log.symptomsLabel')}</span>
          <div className={styles.chipGrid}>
            {CORE_SYMPTOMS.map((symptom) => (
              <Chip
                key={symptom}
                selected={symptoms.includes(symptom)}
                onClick={() => toggleSymptom(symptom)}
              >
                {t(`log.symptoms.${symptom}`)}
              </Chip>
            ))}
            {!showMoreSymptoms && (
              <Chip onClick={() => setShowMoreSymptoms(true)}>{t('log.symptoms.more')}</Chip>
            )}
            {showMoreSymptoms &&
              MORE_SYMPTOMS.map((symptom) => (
                <Chip
                  key={symptom}
                  selected={symptoms.includes(symptom)}
                  onClick={() => toggleSymptom(symptom)}
                >
                  {t(`log.symptoms.${symptom}`)}
                </Chip>
              ))}
          </div>
        </div>

        {!expanded && (
          <button type="button" className={styles.expander} onClick={() => setExpanded(true)}>
            {t('log.addMore')}
          </button>
        )}

        <Collapse open={expanded}>
          <>
            <div className={styles.section}>
              <span className="label-caps">{t('log.moodLabel')}</span>
              <div className={styles.chipGrid}>
                {MOODS.map((option) => (
                  <Chip
                    key={option}
                    selected={mood === option}
                    onClick={() => setMood(mood === option ? '' : option)}
                  >
                    {t(`log.moods.${option}`)}
                  </Chip>
                ))}
              </div>
            </div>

            <div className={styles.section}>
              <label className="label-caps" htmlFor="log-note">
                {t('log.noteLabel')}
              </label>
              <textarea
                id="log-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t('log.notePlaceholder')}
                className={styles.textarea}
              />
            </div>

            {advancedTracking && (
              <>
                <div className={styles.section}>
                  <label className="label-caps" htmlFor="log-bbt">
                    {t('log.advanced.bbtLabel')}
                  </label>
                  <input
                    id="log-bbt"
                    type="number"
                    step="0.01"
                    inputMode="decimal"
                    value={bbt}
                    onChange={(e) => setBbt(e.target.value)}
                    className={styles.textarea}
                    style={{ minHeight: 'unset', height: 48 }}
                  />
                </div>

                <div className={styles.section}>
                  <span className="label-caps">{t('log.advanced.cervicalMucusLabel')}</span>
                  <div className={styles.chipGrid}>
                    {CERVICAL_MUCUS_OPTIONS.map((option) => (
                      <Chip
                        key={option}
                        selected={cervicalMucus === option}
                        onClick={() => setCervicalMucus(cervicalMucus === option ? null : option)}
                      >
                        {t(`log.advanced.cervicalMucus.${option}`)}
                      </Chip>
                    ))}
                  </div>
                </div>

                <div className={styles.toggleRow}>
                  <span>{t('log.advanced.lhLabel')}</span>
                  <Chip selected={lhPositive} onClick={() => setLhPositive((v) => !v)}>
                    {t('log.advanced.lhPositive')}
                  </Chip>
                </div>

                <div className={styles.toggleRow}>
                  <span>{t('log.advanced.intimacyLabel')}</span>
                  <ToggleSwitch
                    checked={intimacy}
                    onChange={setIntimacy}
                    ariaLabel={t('log.advanced.intimacyLabel')}
                  />
                </div>
              </>
            )}
          </>
        </Collapse>

        <Button variant="primary" onClick={handleSave}>
          {t('log.save')}
        </Button>
      </div>
    </Sheet>
  )
}
