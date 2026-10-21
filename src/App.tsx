import { useEffect } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useSettingsStore } from '@/store/settingsStore'
import { useLogStore } from '@/store/logStore'
import { useUiStore } from '@/store/uiStore'
import { OnboardingFlow } from '@/features/onboarding/OnboardingFlow'
import { TodayScreen } from '@/features/today/TodayScreen'
import { InsightsScreen } from '@/features/insights/InsightsScreen'
import { SettingsScreen } from '@/features/settings/SettingsScreen'
import { LogSheet } from '@/features/log/LogSheet'
import { BottomNav } from '@/ui/BottomNav'
import { SCREEN_TRANSITION } from '@/ui/motion'

export function App() {
  const { i18n } = useTranslation()
  const reduceMotion = useReducedMotion()
  const loaded = useSettingsStore((s) => s.loaded)
  const settings = useSettingsStore((s) => s.settings)
  const loadSettings = useSettingsStore((s) => s.load)
  const loadLogs = useLogStore((s) => s.load)
  const screen = useUiStore((s) => s.screen)

  useEffect(() => {
    void loadSettings()
    void loadLogs()
  }, [loadSettings, loadLogs])

  useEffect(() => {
    if (settings.language && settings.language !== i18n.language) {
      void i18n.changeLanguage(settings.language)
    }
  }, [settings.language, i18n])

  if (!loaded) return null

  if (!settings.onboardingComplete) {
    return <OnboardingFlow />
  }

  return (
    <>
      <AnimatePresence initial={false}>
        <motion.div
          key={screen}
          // Overlapping cross-fade (no "wait"): the new screen is on top and
          // fully opaque almost immediately, so the bottom nav's active tab
          // highlight never looks out of sync with what's on screen.
          style={{ position: 'absolute', inset: 0, overflowY: 'auto' }}
          initial={reduceMotion ? undefined : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.16, ease: SCREEN_TRANSITION.ease }}
        >
          {screen === 'today' && <TodayScreen />}
          {screen === 'insights' && <InsightsScreen />}
          {screen === 'settings' && <SettingsScreen />}
        </motion.div>
      </AnimatePresence>
      <LogSheet />
      <BottomNav />
    </>
  )
}
