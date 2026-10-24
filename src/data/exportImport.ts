import { supabase } from '@/lib/supabase'
import { clearAll, fetchLogs, fetchSettings, putLogs, saveSettings } from './repo'
import type { SettingsRecord } from './settings'
import type { DailyLog } from '@/engine/types'

export interface BlushmeExport {
  version: 1
  exportedAt: string
  logs: DailyLog[]
  settings: SettingsRecord
}

async function currentUserId(): Promise<string> {
  const { data } = await supabase.auth.getUser()
  if (!data.user) throw new Error('Not signed in')
  return data.user.id
}

export async function exportToJson(): Promise<string> {
  const [logs, settings] = await Promise.all([fetchLogs(), fetchSettings()])
  const payload: BlushmeExport = {
    version: 1,
    exportedAt: new Date().toISOString(),
    logs,
    settings: settings as SettingsRecord,
  }
  return JSON.stringify(payload, null, 2)
}

export async function importFromJson(json: string): Promise<void> {
  const payload = JSON.parse(json) as BlushmeExport
  if (payload.version !== 1 || !Array.isArray(payload.logs)) {
    throw new Error('Unsupported export version')
  }
  const userId = await currentUserId()
  await clearAll(userId)
  await putLogs(userId, payload.logs)
  if (payload.settings) await saveSettings(userId, payload.settings)
}

export async function deleteAllData(): Promise<void> {
  await clearAll(await currentUserId())
}
