import { motion, useReducedMotion } from 'framer-motion'
import styles from './ToggleSwitch.module.css'
import { TAP_SCALE, TAP_TRANSITION } from './motion'

interface ToggleSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  ariaLabel?: string
}

export function ToggleSwitch({ checked, onChange, ariaLabel }: ToggleSwitchProps) {
  const reduceMotion = useReducedMotion()
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      className={styles.toggleSwitch}
      onClick={() => onChange(!checked)}
    >
      <motion.span
        className={styles.toggleKnob}
        animate={{ x: checked ? 22 : 0 }}
        whileTap={reduceMotion ? undefined : { scale: TAP_SCALE }}
        transition={TAP_TRANSITION}
      />
    </button>
  )
}
