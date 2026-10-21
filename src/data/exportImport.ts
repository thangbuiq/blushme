import { db } from './db'
import type { SettingsRecord } from './db'
import type { DailyLog } from '@/engine/types'

export interface BlushExport {
  version: 1
  exportedAt: string
  logs: DailyLog[]
  settings: SettingsRecord
}

export async function exportToJson(): Promise<string> {
  const [logs, settings] = await Promise.all([db.logs.toArray(), db.settings.get('settings')])
  const payload: BlushExport = {
    version: 1,
    exportedAt: new Date().toISOString(),
    logs,
    settings: settings as SettingsRecord,
  }
  return JSON.stringify(payload, null, 2)
}

export async function importFromJson(json: string): Promise<void> {
  const payload = JSON.parse(json) as BlushExport
  if (payload.version !== 1) {
    throw new Error('Unsupported export version')
  }
  await db.transaction('rw', db.logs, db.settings, async () => {
    await db.logs.clear()
    await db.logs.bulkPut(payload.logs)
    if (payload.settings) {
      await db.settings.put(payload.settings)
    }
  })
}

export async function deleteAllData(): Promise<void> {
  await db.transaction('rw', db.logs, db.settings, async () => {
    await db.logs.clear()
    await db.settings.clear()
  })
}
