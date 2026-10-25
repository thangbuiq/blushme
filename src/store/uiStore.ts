import { create } from 'zustand'

import type { Phase } from '@/engine/types'

export type GlossaryKey =
  | 'lh'
  | 'bbt'
  | 'cervicalMucus'
  | 'corpusLuteum'
  | 'fertileWindow'
  | 'variation'
  | 'weightedAverage'
  | 'confidence'

export type Screen = 'today' | 'insights' | 'settings'

interface UiState {
  screen: Screen
  setScreen: (screen: Screen) => void
  logSheetOpen: boolean
  logSheetDate: string | null
  openLogSheet: (date: string) => void
  closeLogSheet: () => void
  dayActionsDate: string | null
  openDayActions: (date: string) => void
  closeDayActions: () => void
  detailsSheetOpen: boolean
  openDetailsSheet: () => void
  closeDetailsSheet: () => void
  phaseSheet: Phase | null
  openPhaseSheet: (phase: Phase) => void
  closePhaseSheet: () => void
  glossaryTerm: GlossaryKey | null
  openGlossary: (term: GlossaryKey) => void
  closeGlossary: () => void
  toast: { key: string; id: number } | null
  showToast: (key: string) => void
  hideToast: () => void
}

export const useUiStore = create<UiState>((set) => ({
  screen: 'today',
  setScreen: (screen) => set({ screen }),
  logSheetOpen: false,
  logSheetDate: null,
  openLogSheet: (date) => set({ logSheetOpen: true, logSheetDate: date }),
  closeLogSheet: () => set({ logSheetOpen: false }),
  dayActionsDate: null,
  openDayActions: (date) => set({ dayActionsDate: date }),
  closeDayActions: () => set({ dayActionsDate: null }),
  detailsSheetOpen: false,
  openDetailsSheet: () => set({ detailsSheetOpen: true }),
  closeDetailsSheet: () => set({ detailsSheetOpen: false }),
  phaseSheet: null,
  openPhaseSheet: (phase) => set({ phaseSheet: phase }),
  closePhaseSheet: () => set({ phaseSheet: null }),
  glossaryTerm: null,
  openGlossary: (term) => set({ glossaryTerm: term }),
  closeGlossary: () => set({ glossaryTerm: null }),
  toast: null,
  showToast: (key) => set({ toast: { key, id: Date.now() } }),
  hideToast: () => set({ toast: null }),
}))
