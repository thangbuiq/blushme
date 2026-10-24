import { useEffect } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/authStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useLogStore } from '@/store/logStore'
import { useUiStore } from '@/store/uiStore'
import { AuthScreen } from '@/features/auth/AuthScreen'
import { OnboardingFlow } from '@/features/onboarding/OnboardingFlow'
import { TodayScreen } from '@/features/today/TodayScreen'
import { InsightsScreen } from '@/features/insights/InsightsScreen'
import { SettingsScreen } from '@/features/settings/SettingsScreen'
import { LogSheet } from '@/features/log/LogSheet'
import { TodaySheets } from '@/features/today/TodaySheets'
import { DayActionsSheet } from '@/features/calendar/DayActionsSheet'
import { BottomNav } from '@/ui/BottomNav'
import { Toast } from '@/ui/Toast'
import { Splash } from '@/ui/Splash'
import { setStoredLanguage } from '@/i18n'
import { SCREEN_TRANSITION } from '@/ui/motion'

export function App() {
  const { i18n } = useTranslation()
  const reduceMotion = useReducedMotion()
  const authReady = useAuthStore((s) => s.ready)
  const userId = useAuthStore((s) => s.user?.id ?? null)
  const settingsLoaded = useSettingsStore((s) => s.loaded)
  const logsLoaded = useLogStore((s) => s.loaded)
  const loaded = settingsLoaded && logsLoaded
  const settings = useSettingsStore((s) => s.settings)
  const screen = useUiStore((s) => s.screen)

  useEffect(() => useAuthStore.getState().init(), [])

  // Load the signed-in user's data; wipe it from memory on sign-out or user switch.
  useEffect(() => {
    if (!userId) {
      useSettingsStore.getState().reset()
      useLogStore.getState().reset()
      useUiStore.getState().setScreen('today')
      return
    }
    void useSettingsStore.getState().load()
    void useLogStore.getState().load()
  }, [userId])

  useEffect(() => {
    const lang = settings.language
    if (userId && loaded && lang && lang !== i18n.language) {
      setStoredLanguage(lang)
      void i18n.changeLanguage(lang)
    }
  }, [userId, loaded, settings.language, i18n])

  let content
  if (!authReady || (userId && !loaded)) {
    content = <Splash />
  } else if (!userId) {
    content = <AuthScreen />
  } else if (!settings.onboardingComplete) {
    content = <OnboardingFlow />
  } else {
    content = (
      <>
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={screen}
            className="scroll"
            style={{ position: 'absolute', inset: 0, overflowY: 'auto' }}
            initial={reduceMotion ? undefined : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2, ease: SCREEN_TRANSITION.ease }}
          >
            {screen === 'today' && <TodayScreen />}
            {screen === 'insights' && <InsightsScreen />}
            {screen === 'settings' && <SettingsScreen />}
          </motion.div>
        </AnimatePresence>
        <LogSheet />
        <DayActionsSheet />
        <TodaySheets />
        <BottomNav />
      </>
    )
  }

  return (
    <>
      {content}
      <Toast />
    </>
  )
}
