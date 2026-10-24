import { useState, type FormEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Button } from '@/ui/Button'
import { Field, FieldAction } from '@/ui/Input'
import { EyeIcon, LockIcon, MailIcon } from '@/ui/Icon'
import { Bloom, Sprig } from '@/ui/art/Botanical'
import { EASE, SOFT_SPRING } from '@/ui/motion'
import { useAuthStore, type AuthErrorCode } from '@/store/authStore'
import { useUiStore } from '@/store/uiStore'
import { setStoredLanguage } from '@/i18n'
import styles from './AuthScreen.module.css'

type Mode = 'signIn' | 'signUp'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function AuthScreen() {
  const { t, i18n } = useTranslation()
  const reduceMotion = useReducedMotion()
  const signIn = useAuthStore((s) => s.signIn)
  const signUp = useAuthStore((s) => s.signUp)
  const enterDemo = useAuthStore((s) => s.enterDemo)
  const showToast = useUiStore((s) => s.showToast)

  const [mode, setMode] = useState<Mode>('signIn')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function switchMode(next: Mode) {
    setMode(next)
    setError(null)
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    const trimmed = email.trim()
    if (!EMAIL_RE.test(trimmed)) return setError(t('auth.errors.invalidEmail'))
    if (password.length < 6) return setError(t('auth.errors.weakPassword'))

    setBusy(true)
    const result =
      mode === 'signIn' ? await signIn(trimmed, password) : await signUp(trimmed, password)
    setBusy(false)

    if (!result.ok) return setError(t(`auth.errors.${result.code satisfies AuthErrorCode}`))
    // Signed in already when the project skips email confirmation; otherwise just
    // report success and let them sign in, without a separate "check your email" screen.
    if (mode === 'signUp' && result.needsConfirmation) {
      setMode('signIn')
      setPassword('')
      showToast('auth.signedUp')
    }
  }

  const isSignUp = mode === 'signUp'

  return (
    <div className={`${styles.screen} scroll`}>
      <div className={styles.lang} role="group" aria-label={t('settings.language')}>
        {(['vi', 'en'] as const).map((lang) => (
          <button
            key={lang}
            type="button"
            className={[styles.langButton, i18n.language.startsWith(lang) && styles.langActive]
              .filter(Boolean)
              .join(' ')}
            aria-pressed={i18n.language.startsWith(lang)}
            onClick={() => {
              setStoredLanguage(lang)
              void i18n.changeLanguage(lang)
            }}
          >
            {lang.toUpperCase()}
          </button>
        ))}
      </div>

      <header className={styles.hero}>
        <Sprig width={130} className={styles.sprig} />
        <Sprig width={100} mirror className={styles.sprigLeft} still />
        <motion.div
          className={styles.brand}
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <Bloom size={28} petals={5} />
          Blushme
        </motion.div>
        <motion.h1
          className={styles.title}
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
        >
          {t('auth.heroTitle')}
        </motion.h1>
        <motion.p
          className={styles.lead}
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.2 }}
        >
          {t('auth.heroLead')}
        </motion.p>
      </header>

      <motion.main
        className={styles.panel}
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SOFT_SPRING, delay: 0.25 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key="form"
            className={styles.form}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className={styles.tabs} role="tablist">
              {(['signIn', 'signUp'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  role="tab"
                  aria-selected={mode === m}
                  className={[styles.tab, mode === m && styles.tabActive].filter(Boolean).join(' ')}
                  onClick={() => switchMode(m)}
                >
                  {mode === m && (
                    <motion.span
                      layoutId="auth-tab"
                      className={styles.tabPill}
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : { type: 'spring', stiffness: 420, damping: 32 }
                      }
                    />
                  )}
                  {t(`auth.${m}`)}
                </button>
              ))}
            </div>

            <form className={styles.form} onSubmit={onSubmit} noValidate>
              <Field
                id="auth-email"
                type="email"
                label={t('auth.email')}
                placeholder="ten@email.com"
                autoComplete="email"
                inputMode="email"
                icon={<MailIcon size={18} />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Field
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                label={t('auth.password')}
                placeholder={isSignUp ? t('auth.passwordHint') : '••••••••'}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                icon={<LockIcon size={18} />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                action={
                  <FieldAction
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={t(showPassword ? 'auth.hidePassword' : 'auth.showPassword')}
                  >
                    <EyeIcon size={20} off={showPassword} />
                  </FieldAction>
                }
              />

              <AnimatePresence initial={false}>
                {error && (
                  <motion.p
                    key={error}
                    role="alert"
                    className={styles.error}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <Button type="submit" loading={busy}>
                {t(isSignUp ? 'auth.createAccount' : 'auth.signInCta')}
              </Button>
            </form>

            <p className={styles.switchRow}>
              {t(isSignUp ? 'auth.haveAccount' : 'auth.noAccount')}{' '}
              <button
                type="button"
                className={styles.linkButton}
                onClick={() => switchMode(isSignUp ? 'signIn' : 'signUp')}
              >
                {t(isSignUp ? 'auth.signIn' : 'auth.signUp')}
              </button>
            </p>
            <p className={styles.hint} style={{ textAlign: 'center' }}>
              {t('auth.privacy')}
            </p>
            <button type="button" className={styles.demoLink} onClick={enterDemo} disabled={busy}>
              {t('auth.useDemo')}
            </button>
          </motion.div>
        </AnimatePresence>
      </motion.main>
    </div>
  )
}
