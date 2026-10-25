import { supabase } from '@/lib/supabase'
import { clearAll } from './repo'

export async function deleteAllData(): Promise<void> {
  const { data } = await supabase.auth.getUser()
  if (!data.user) throw new Error('Not signed in')
  await clearAll(data.user.id)
}
