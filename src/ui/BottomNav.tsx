import { motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useUiStore, type Screen } from '@/store/uiStore'
import { DropIcon, ChartIcon, UserIcon } from './Icon'
import { TAP_SCALE } from './motion'
import styles from './BottomNav.module.css'

// Only the pill moves (a transform), so sliding between tabs never re-lays-out the bar.
const PILL_SPRING = { type: 'spring', stiffness: 420, damping: 36, mass: 0.9 } as const

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
                  transition={reduceMotion ? { duration: 0 } : PILL_SPRING}
                />
              )}
              <IconComponent size={22} />
              <span className={styles.label}>{t(labelKey)}</span>
            </motion.button>
          )
        })}
      </nav>
    </div>
  )
}
