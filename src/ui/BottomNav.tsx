import { motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useUiStore, type Screen } from '@/store/uiStore'
import { DropIcon, ChartIcon, UserIcon } from './Icon'
import { SPRING, TAP_SCALE } from './motion'
import styles from './BottomNav.module.css'

const ITEMS: { screen: Screen; icon: typeof DropIcon; labelKey: string }[] = [
  { screen: 'today', icon: DropIcon, labelKey: 'nav.today' },
  { screen: 'insights', icon: ChartIcon, labelKey: 'nav.insights' },
  { screen: 'settings', icon: UserIcon, labelKey: 'nav.settings' },
]

export function BottomNav() {
  const { t } = useTranslation()
  const reduceMotion = useReducedMotion()
  const screen = useUiStore((s) => s.screen)
  const setScreen = useUiStore((s) => s.setScreen)

  return (
    <div className={styles.wrap}>
      <nav className={styles.nav} aria-label={t('nav.label')}>
        {ITEMS.map(({ screen: target, icon: IconComponent, labelKey }) => {
          const active = screen === target
          return (
            <motion.button
              key={target}
              type="button"
              className={[styles.item, active && styles.active].filter(Boolean).join(' ')}
              aria-current={active ? 'page' : undefined}
              aria-label={t(labelKey)}
              whileTap={reduceMotion ? undefined : { scale: TAP_SCALE }}
              onClick={() => setScreen(target)}
            >
              {active && (
                <motion.span
                  layoutId="nav-pill"
                  className={styles.pill}
                  transition={reduceMotion ? { duration: 0 } : SPRING}
                />
              )}
              <IconComponent size={22} />
              {active && (
                <motion.span
                  className={styles.label}
                  initial={reduceMotion ? false : { opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  transition={{ duration: 0.25 }}
                >
                  {t(labelKey)}
                </motion.span>
              )}
            </motion.button>
          )
        })}
      </nav>
    </div>
  )
}
