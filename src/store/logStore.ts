import { create } from 'zustand'
import { buildDemoLogs } from '@/data/demoLogs'
import { fetchLogs, putLogs, removeLogs } from '@/data/repo'
import type { DailyLog } from '@/engine/types'
import { useAuthStore } from './authStore'
import { useUiStore } from './uiStore'

interface LogState {
  logs: DailyLog[]
  loaded: boolean
  load: () => Promise<void>
  upsertLog: (log: DailyLog) => Promise<void>
  upsertLogs: (logs: DailyLog[]) => Promise<void>
  deleteLog: (date: string) => Promise<void>
  deleteLogs: (dates: string[]) => Promise<void>
  reset: () => void
}

const byDate = (a: DailyLog, b: DailyLog) => a.date.localeCompare(b.date)

export const useLogStore = create<LogState>((set, get) => ({
  logs: [],
  loaded: false,
  async load() {
    const { user, demo } = useAuthStore.getState()
    if (!user) return
    if (demo) {
      set({ logs: buildDemoLogs().sort(byDate), loaded: true })
      return
    }
    try {
      set({ logs: (await fetchLogs()).sort(byDate), loaded: true })
    } catch {
      useUiStore.getState().showToast('errors.loadFailed')
      set({ loaded: true })
    }
  },
  async upsertLog(log) {
    await get().upsertLogs([log])
  },
  async upsertLogs(incoming) {
    const { user, demo } = useAuthStore.getState()
    const userId = user?.id
    const previous = get().logs
    const merged = new Map(previous.map((l) => [l.date, l]))
    for (const log of incoming) merged.set(log.date, { ...merged.get(log.date), ...log })
    const dates = new Set(incoming.map((l) => l.date))
    set({ logs: [...merged.values()].sort(byDate) })
    if (!userId || demo) return
    try {
      await putLogs(
        userId,
        [...merged.values()].filter((l) => dates.has(l.date)),
      )
    } catch {
      set({ logs: previous })
      useUiStore.getState().showToast('errors.saveFailed')
    }
  },
  async deleteLog(date) {
    await get().deleteLogs([date])
  },
  async deleteLogs(dates) {
    const previous = get().logs
    const drop = new Set(dates)
    set({ logs: previous.filter((l) => !drop.has(l.date)) })
    if (useAuthStore.getState().demo) return
    try {
      await removeLogs(dates)
    } catch {
      set({ logs: previous })
      useUiStore.getState().showToast('errors.saveFailed')
    }
  },
  reset() {
    set({ logs: [], loaded: false })
  },
}))
