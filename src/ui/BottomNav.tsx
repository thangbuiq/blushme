import { motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useUiStore, type Screen } from '@/store/uiStore'
import { DropIcon, MoonIcon, FlowerIcon } from './Icon'
import { TAP_SCALE, TAP_TRANSITION } from './motion'
import styles from './BottomNav.module.css'

const ITEMS: { screen: Screen; icon: typeof DropIcon; labelKey: string }[] = [
  { screen: 'today', icon: DropIcon, labelKey: 'nav.today' },
  { screen: 'insights', icon: MoonIcon, labelKey: 'nav.insights' },
  { screen: 'settings', icon: FlowerIcon, labelKey: 'nav.settings' },
]

export function BottomNav() {
  const { t } = useTranslation()
  const reduceMotion = useReducedMotion()
  const screen = useUiStore((s) => s.screen)
  const setScreen = useUiStore((s) => s.setScreen)
  const activeIndex = ITEMS.findIndex((item) => item.screen === screen)

  return (
    <nav className={styles.nav} aria-label={t('nav.today')}>
      <motion.span
        className={styles.indicator}
        aria-hidden="true"
        animate={{ left: `${activeIndex * (100 / ITEMS.length)}%` }}
        transition={reduceMotion ? { duration: 0 } : TAP_TRANSITION}
      />
      {ITEMS.map(({ screen: target, icon: IconComponent, labelKey }) => {
        const active = screen === target
        return (
          <motion.button
            key={target}
            type="button"
            className={[styles.item, active && styles.active].filter(Boolean).join(' ')}
            aria-current={active ? 'page' : undefined}
            whileTap={reduceMotion ? undefined : { scale: TAP_SCALE }}
            transition={TAP_TRANSITION}
            onClick={() => setScreen(target)}
          >
            <IconComponent size={22} />
            <span className={styles.label}>{t(labelKey)}</span>
          </motion.button>
        )
      })}
    </nav>
  )
}
