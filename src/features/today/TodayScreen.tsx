import { formatISO } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { DropIcon, PetalIcon, FlowerIcon, MoonIcon } from '@/ui/Icon'
import { Button } from '@/ui/Button'
import { formatShortDate } from '@/ui/dateFormat'
import { useCycleState } from '@/store/cycleStore'
import { useUiStore } from '@/store/uiStore'
import { CalendarSection } from '@/features/calendar/CalendarSection'
import type { Phase } from '@/engine/types'
import { statusLineText } from './statusLine'
import { DetailsSheet } from './DetailsSheet'
import { LearnSheet } from './LearnSheet'
import styles from './TodayScreen.module.css'

const todayISO = () => formatISO(new Date(), { representation: 'date' })

const PHASE_ICON: Record<Phase, typeof DropIcon> = {
  menstrual: DropIcon,
  follicular: PetalIcon,
  ovulation: FlowerIcon,
  luteal: MoonIcon,
}

const PHASE_ACCENT: Record<Phase, string> = {
  menstrual: 'var(--color-tertiary)',
  follicular: 'var(--color-mint)',
  ovulation: 'var(--color-butter)',
  luteal: 'var(--color-lavender)',
}

// Tertiary is the one accent dark enough to need white text for AA contrast
// (DESIGN.md: "White text on it passes AA"); the three pastels keep plum ink.
const PHASE_TEXT: Record<Phase, string> = {
  menstrual: 'var(--color-on-tertiary)',
  follicular: 'var(--color-primary)',
  ovulation: 'var(--color-primary)',
  luteal: 'var(--color-primary)',
}

export function TodayScreen() {
  const { t, i18n } = useTranslation()
  const state = useCycleState()
  const openLogSheet = useUiStore((s) => s.openLogSheet)
  const openDetailsSheet = useUiStore((s) => s.openDetailsSheet)
  const openLearnSheet = useUiStore((s) => s.openLearnSheet)

  const PhaseIcon = PHASE_ICON[state.phase]

  return (
    <div className={styles.screen}>
      <div className={styles.hero}>
        <button type="button" className={styles.dateCard} onClick={openDetailsSheet}>
          <span className="label-caps">{formatShortDate(todayISO(), i18n.language)}</span>
          <span className={styles.dayNumeral}>{t('today.dayLabel', { day: state.dayOfCycle })}</span>
          <span className={styles.statusLine}>{statusLineText(t, state)}</span>
        </button>

        <div
          className={styles.phaseCard}
          style={{ backgroundColor: PHASE_ACCENT[state.phase], color: PHASE_TEXT[state.phase] }}
        >
          <PhaseIcon size={24} className={styles.phaseIcon} />
          <span className={styles.phaseName}>{t(`today.phaseStatus.${state.phase}`)}</span>
        </div>

        <div className={styles.suggestionCard}>
          <p className={styles.suggestionText}>{t(`today.phaseDescription.${state.phase}`)}</p>
          <button type="button" className={styles.learnLink} onClick={openLearnSheet}>
            {t('today.learnLink')}
          </button>
        </div>

        <div className={styles.actions}>
          <Button variant="primary" onClick={() => openLogSheet(todayISO())}>
            {t('today.logButton')}
          </Button>
        </div>
      </div>

      <CalendarSection />

      <DetailsSheet state={state} />
      <LearnSheet />
    </div>
  )
}
