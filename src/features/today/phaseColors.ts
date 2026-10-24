import type { Phase } from '@/engine/types'
import { differenceInCalendarDays, parseISO } from 'date-fns'
import type { CycleState } from '@/engine/types'
import type { Tone } from '@/ui/art/Botanical'
import { DropIcon, FlowerIcon, MoonIcon, PetalIcon } from '@/ui/Icon'

export const PHASE_COLOR: Record<Phase, string> = {
  menstrual: '#B8416A',
  follicular: '#8DBBA0',
  ovulation: '#EFBF4F',
  luteal: '#B39BE0',
}

/** Darker shades of the phase colours, readable as text on white. */
export const PHASE_TEXT_COLOR: Record<Phase, string> = {
  menstrual: '#B8416A',
  follicular: '#4B8765',
  ovulation: '#A06F08',
  luteal: '#7656C2',
}

export const PHASE_TONE: Record<Phase, Tone> = {
  menstrual: 'rose',
  follicular: 'mint',
  ovulation: 'butter',
  luteal: 'lavender',
}

export const PHASE_ICON: Record<Phase, typeof DropIcon> = {
  menstrual: DropIcon,
  follicular: PetalIcon,
  ovulation: FlowerIcon,
  luteal: MoonIcon,
}

export interface PhaseSegment {
  phase: Phase
  /** Days elapsed before this segment starts (exclusive) and when it ends (inclusive). */
  from: number
  to: number
}

export interface CycleGeometry {
  cycleLength: number
  segments: PhaseSegment[]
}

/** Where each phase starts and ends within the user's predicted cycle. */
export function cycleGeometry(state: CycleState, periodLength: number): CycleGeometry {
  const cycleLength = Math.max(
    21,
    differenceInCalendarDays(
      parseISO(state.predictedNextPeriod.date),
      parseISO(state.lastPeriodStart),
    ),
  )
  const period = Math.min(Math.max(periodLength, 2), cycleLength - 14)
  const ovulationDay = Math.min(
    Math.max(
      differenceInCalendarDays(parseISO(state.ovulation.date), parseISO(state.lastPeriodStart)) + 1,
      period + 2,
    ),
    cycleLength - 3,
  )
  return {
    cycleLength,
    segments: [
      { phase: 'menstrual', from: 0, to: period },
      { phase: 'follicular', from: period, to: ovulationDay - 1 },
      { phase: 'ovulation', from: ovulationDay - 1, to: ovulationDay + 1 },
      { phase: 'luteal', from: ovulationDay + 1, to: cycleLength },
    ],
  }
}
