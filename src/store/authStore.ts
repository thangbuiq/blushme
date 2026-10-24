import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export type AuthErrorCode =
  | 'invalidCredentials'
  | 'emailNotConfirmed'
  | 'userExists'
  | 'weakPassword'
  | 'invalidEmail'
  | 'rateLimited'
  | 'network'
  | 'unknown'

export type AuthResult =
  { ok: true; needsConfirmation?: boolean } | { ok: false; code: AuthErrorCode }

interface AuthState {
  user: User | null
  ready: boolean
  /** Local-only demo session: nothing is read from or written to Supabase. */
  demo: boolean
  enterDemo: () => void
  init: () => () => void
  signIn: (email: string, password: string) => Promise<AuthResult>
  signUp: (email: string, password: string) => Promise<AuthResult>
  signOut: () => Promise<void>
}

function mapError(error: { message: string; code?: string; status?: number }): AuthErrorCode {
  const code = error.code ?? ''
  const message = error.message.toLowerCase()
  if (code === 'invalid_credentials' || message.includes('invalid login'))
    return 'invalidCredentials'
  if (code === 'email_not_confirmed' || message.includes('not confirmed'))
    return 'emailNotConfirmed'
  if (code === 'user_already_exists' || message.includes('already registered')) return 'userExists'
  if (code === 'weak_password' || message.includes('password')) return 'weakPassword'
  if (code === 'email_address_invalid' || message.includes('invalid email')) return 'invalidEmail'
  if (error.status === 429 || code.includes('rate_limit')) return 'rateLimited'
  if (message.includes('fetch') || message.includes('network')) return 'network'
  return 'unknown'
}

const DEMO_USER = { id: 'demo', email: 'demo@blushme.app' } as User

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  ready: false,
  demo: false,
  enterDemo() {
    set({ user: DEMO_USER, demo: true, ready: true })
  },
  init() {
    void supabase.auth.getSession().then(({ data }) => {
      if (!get().demo) set({ user: data.session?.user ?? null, ready: true })
    })
    const { data } = supabase.auth.onAuthStateChange((_event, session: Session | null) => {
      if (get().demo) return
      set({ user: session?.user ?? null, ready: true })
    })
    return () => data.subscription.unsubscribe()
  },
  async signIn(email, password) {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      return error ? { ok: false, code: mapError(error) } : { ok: true }
    } catch {
      return { ok: false, code: 'network' }
    }
  },
  async signUp(email, password) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      })
      if (error) return { ok: false, code: mapError(error) }
      // An existing confirmed email returns a user with no identities (anti-enumeration).
      if (data.user && data.user.identities?.length === 0) return { ok: false, code: 'userExists' }
      return { ok: true, needsConfirmation: !data.session }
    } catch {
      return { ok: false, code: 'network' }
    }
  },
  async signOut() {
    if (get().demo) {
      set({ user: null, demo: false })
      return
    }
    await supabase.auth.signOut()
  },
}))
