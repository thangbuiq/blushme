import { create } from 'zustand'
import { db, DEFAULT_SETTINGS, getSettings, type SettingsRecord } from '@/data/db'

interface SettingsState {
  settings: SettingsRecord
  loaded: boolean
  load: () => Promise<void>
  update: (patch: Partial<SettingsRecord>) => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  loaded: false,
  async load() {
    const settings = await getSettings()
    set({ settings, loaded: true })
  },
  async update(patch) {
    const next = { ...get().settings, ...patch }
    await db.settings.put(next)
    set({ settings: next })
  },
}))
