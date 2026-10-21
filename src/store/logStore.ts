import { create } from 'zustand'
import { db } from '@/data/db'
import type { DailyLog } from '@/engine/types'

interface LogState {
  logs: DailyLog[]
  loaded: boolean
  load: () => Promise<void>
  upsertLog: (log: DailyLog) => Promise<void>
  deleteLog: (date: string) => Promise<void>
}

export const useLogStore = create<LogState>((set, get) => ({
  logs: [],
  loaded: false,
  async load() {
    const logs = await db.logs.toArray()
    set({ logs: logs.sort((a, b) => a.date.localeCompare(b.date)), loaded: true })
  },
  async upsertLog(log) {
    const existing = get().logs.find((l) => l.date === log.date)
    const merged = existing ? { ...existing, ...log } : log
    await db.logs.put(merged)
    const logs = get().logs.filter((l) => l.date !== log.date)
    set({ logs: [...logs, merged].sort((a, b) => a.date.localeCompare(b.date)) })
  },
  async deleteLog(date) {
    await db.logs.delete(date)
    set({ logs: get().logs.filter((l) => l.date !== date) })
  },
}))
