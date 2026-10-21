import { create } from 'zustand'

export type Screen = 'today' | 'insights' | 'settings'

interface UiState {
  screen: Screen
  setScreen: (screen: Screen) => void
  logSheetOpen: boolean
  logSheetDate: string | null
  openLogSheet: (date: string) => void
  closeLogSheet: () => void
  detailsSheetOpen: boolean
  openDetailsSheet: () => void
  closeDetailsSheet: () => void
  learnSheetOpen: boolean
  openLearnSheet: () => void
  closeLearnSheet: () => void
}

export const useUiStore = create<UiState>((set) => ({
  screen: 'today',
  setScreen: (screen) => set({ screen }),
  logSheetOpen: false,
  logSheetDate: null,
  openLogSheet: (date) => set({ logSheetOpen: true, logSheetDate: date }),
  closeLogSheet: () => set({ logSheetOpen: false }),
  detailsSheetOpen: false,
  openDetailsSheet: () => set({ detailsSheetOpen: true }),
  closeDetailsSheet: () => set({ detailsSheetOpen: false }),
  learnSheetOpen: false,
  openLearnSheet: () => set({ learnSheetOpen: true }),
  closeLearnSheet: () => set({ learnSheetOpen: false }),
}))
