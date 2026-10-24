import { supabase } from '@/lib/supabase'
import type { DailyLog } from '@/engine/types'
import { DEFAULT_SETTINGS, type SettingsRecord } from './settings'

// All reads/writes go through the signed-in user's session; row level
// security (see supabase/migrations) isolates each user's rows.

function check<T extends { error: { message: string } | null }>(result: T): T {
  if (result.error) throw new Error(result.error.message)
  return result
}

export async function fetchSettings(): Promise<SettingsRecord | null> {
  const { data } = check(await supabase.from('cycle_settings').select('data').maybeSingle())
  if (!data) return null
  return { ...DEFAULT_SETTINGS, ...(data.data as Partial<SettingsRecord>) }
}

export async function saveSettings(userId: string, settings: SettingsRecord): Promise<void> {
  check(
    await supabase
      .from('cycle_settings')
      .upsert({ user_id: userId, data: settings, updated_at: new Date().toISOString() }),
  )
}

export async function fetchLogs(): Promise<DailyLog[]> {
  const { data } = check(await supabase.from('daily_logs').select('data').order('date').limit(5000))
  return (data ?? []).map((row) => row.data as DailyLog)
}

function toRow(userId: string, log: DailyLog) {
  return { user_id: userId, date: log.date, data: log, updated_at: new Date().toISOString() }
}

export async function putLogs(userId: string, logs: DailyLog[]): Promise<void> {
  if (logs.length === 0) return
  check(await supabase.from('daily_logs').upsert(logs.map((log) => toRow(userId, log))))
}

export async function removeLogs(dates: string[]): Promise<void> {
  if (dates.length === 0) return
  check(await supabase.from('daily_logs').delete().in('date', dates))
}

export async function clearAll(userId: string): Promise<void> {
  check(await supabase.from('daily_logs').delete().eq('user_id', userId))
  check(await supabase.from('cycle_settings').delete().eq('user_id', userId))
}

export async function deleteAccount(): Promise<void> {
  check(await supabase.rpc('delete_my_account'))
}
