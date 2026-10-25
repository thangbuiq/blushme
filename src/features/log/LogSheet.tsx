import { useEffect, useState } from 'react'
import { addDays, formatISO, parseISO } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { Sheet } from '@/ui/Sheet'
import { Button } from '@/ui/Button'
import { Chip } from '@/ui/Chip'
import { ToggleSwitch } from '@/ui/ToggleSwitch'
import { DropIcon, ChevronIcon } from '@/ui/Icon'
import { formatShortDate } from '@/ui/dateFormat'
import { useUiStore } from '@/store/uiStore'
import { useLogStore } from '@/store/logStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useCycleState } from '@/store/cycleStore'
import type { CervicalMucus } from '@/engine/types'
import { CORE_SYMPTOMS, MORE_SYMPTOMS, type Symptom } from './symptoms'
import { MOODS, moodsOf, toggleMood } from './moods'
import { isSuspiciouslyEarly } from './periodValidation'
import { hasLogContent, withoutPeriod } from './periodDays'
import { isBleeding } from '@/engine/cycleLengths'
import { PhaseTag } from '@/features/today/PhaseTag'
import { TermLabel } from '@/ui/TermHint'
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
  const deleteLog = useLogStore((s) => s.deleteLog)
  const showToast = useUiStore((s) => s.showToast)
  const advancedTracking = useSettingsStore((s) => s.settings.advancedTracking)
  const confirm = useConfirm()
  const dateCycleState = useCycleState(date ?? undefined)

  const [symptoms, setSymptoms] = useState<Symptom[]>([])
  const [moods, setMoods] = useState<string[]>([])
  const [note, setNote] = useState('')
  const [bbt, setBbt] = useState('')
  const [cervicalMucus, setCervicalMucus] = useState<CervicalMucus | null>(null)
  const [lhPositive, setLhPositive] = useState(false)
  const [intimacy, setIntimacy] = useState(false)

  useEffect(() => {
    if (!open || !date) return
    const existing = logs.find((l) => l.date === date)
    setSymptoms((existing?.symptoms as Symptom[]) ?? [])
    setMoods(existing ? moodsOf(existing) : [])
    setNote(existing?.note ?? '')
    setBbt(existing?.bbt?.toString() ?? '')
    setCervicalMucus(existing?.cervicalMucus ?? null)
    setLhPositive(existing?.lhPositive ?? false)
    setIntimacy(existing?.intimacy ?? false)
  }, [open, date, logs])

  if (!date) return null

  const isToday = date === todayISO()
  const titleText = isToday ? t('log.todayTitle') : formatShortDate(date, i18n.language)
  const existing = logs.find((l) => l.date === date)
  const showCycleContext = !dateCycleState.paused && dateCycleState.dayOfCycle >= 1
  const subtitleText = showCycleContext ? (
    <>
      {t('log.cycleContext', { day: dateCycleState.dayOfCycle })} ·{' '}
      <PhaseTag phase={dateCycleState.phase} />
    </>
  ) : undefined

  function goToDay(offset: number) {
    openLogSheet(formatISO(addDays(parseISO(date!), offset), { representation: 'date' }))
  }

  function toggleSymptom(symptom: Symptom) {
    setSymptoms((current) =>
      current.includes(symptom) ? current.filter((s) => s !== symptom) : [...current, symptom],
    )
  }

  // Periods are recorded one day at a time; the start is the first marked day
  // after a gap, so there is no separate "start" to keep in sync.
  async function markPeriodDay() {
    if (!date) return
    if (isSuspiciouslyEarly(date, logs) && !(await confirm(t('log.earlyPeriodConfirm')))) return
    await upsertLog({ date, periodDay: true })
    showToast('today.periodStarted')
  }

  async function unmarkPeriodDay() {
    if (!date || !existing) return
    const cleared = withoutPeriod(existing)
    if (hasLogContent(cleared)) await upsertLog(cleared)
    else await deleteLog(date)
  }

  async function handleDelete() {
    if (!date) return
    if (
      !(await confirm(t('calendar.dayActions.deleteConfirm'), t('calendar.dayActions.delete'), {
        danger: true,
      }))
    )
      return
    close()
    await deleteLog(date)
  }

  async function handleSave() {
    if (!date) return
    await upsertLog({
      date,
      symptoms: symptoms.length > 0 ? symptoms : undefined,
      moods: moods.length > 0 ? moods : undefined,
      mood: undefined,
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
        {isBleeding(existing) ? (
          <div className={styles.periodBadge}>
            <DropIcon size={18} />
            <span className={styles.periodBadgeLabel}>{t('log.periodDayHere')}</span>
            <button
              type="button"
              className={styles.periodBadgeRemove}
              onClick={() => void unmarkPeriodDay()}
            >
              {t('log.unmarkPeriodDay')}
            </button>
          </div>
        ) : (
          <Button variant="secondary" onClick={() => void markPeriodDay()}>
            <DropIcon size={18} />
            {t('log.markPeriodDay')}
          </Button>
        )}

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
            {MORE_SYMPTOMS.map((symptom) => (
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

        <div className={styles.section}>
          <span className="label-caps">
            {t('log.moodLabel')} · {t('log.moodHint')}
          </span>
          <div className={styles.chipGrid}>
            {MOODS.map((option) => (
              <Chip
                key={option}
                selected={moods.includes(option)}
                onClick={() => setMoods((current) => toggleMood(current, option) ?? [])}
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
              <TermLabel term="bbt">
                <label className="label-caps" htmlFor="log-bbt">
                  {t('log.advanced.bbtLabel')}
                </label>
              </TermLabel>
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
              <TermLabel term="cervicalMucus">
                <span className="label-caps">{t('log.advanced.cervicalMucusLabel')}</span>
              </TermLabel>
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
              <TermLabel term="lh">{t('log.advanced.lhLabel')}</TermLabel>
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
        <Button variant="primary" onClick={handleSave}>
          {t('log.save')}
        </Button>
        {existing && (
          <Button variant="danger" onClick={() => void handleDelete()}>
            {t('log.deleteEntry')}
          </Button>
        )}
      </div>
    </Sheet>
  )
}
