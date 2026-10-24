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
  detailsSheetOpen: false,
  openDetailsSheet: () => set({ detailsSheetOpen: true }),
  closeDetailsSheet: () => set({ detailsSheetOpen: false }),
  toast: null,
  showToast: (key) => set({ toast: { key, id: Date.now() } }),
  hideToast: () => set({ toast: null }),
}))
