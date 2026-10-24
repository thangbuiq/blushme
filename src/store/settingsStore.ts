import { create } from 'zustand'
import { DEFAULT_SETTINGS, type SettingsRecord } from '@/data/settings'
import { fetchSettings, saveSettings } from '@/data/repo'
import { useAuthStore } from './authStore'
import { useUiStore } from './uiStore'

interface SettingsState {
  settings: SettingsRecord
  loaded: boolean
  load: () => Promise<void>
  update: (patch: Partial<SettingsRecord>) => Promise<void>
  reset: () => void
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  loaded: false,
  async load() {
    const { user, demo } = useAuthStore.getState()
    if (!user) return
    if (demo) {
      set({
        settings: { ...DEFAULT_SETTINGS, onboardingComplete: true, displayName: 'Thuý Vy' },
        loaded: true,
      })
      return
    }
    try {
      const remote = await fetchSettings()
      set({ settings: remote ?? DEFAULT_SETTINGS, loaded: true })
    } catch {
      useUiStore.getState().showToast('errors.loadFailed')
      set({ loaded: true })
    }
  },
  async update(patch) {
    const { user, demo } = useAuthStore.getState()
    const userId = user?.id
    const previous = get().settings
    const next = { ...previous, ...patch }
    set({ settings: next })
    if (!userId || demo) return
    try {
      await saveSettings(userId, next)
    } catch {
      set({ settings: previous })
      useUiStore.getState().showToast('errors.saveFailed')
    }
  },
  reset() {
    set({ settings: DEFAULT_SETTINGS, loaded: false })
  },
}))
