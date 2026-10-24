import type { ReactNode } from 'react'
import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion'
import styles from './Button.module.css'
import { TAP_SCALE, TAP_TRANSITION } from './motion'

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children?: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  loading?: boolean
}

export function Button({
  variant = 'primary',
  loading,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const reduceMotion = useReducedMotion()
  const isDisabled = disabled || loading
  return (
    <motion.button
      className={[styles.button, styles[variant], className].filter(Boolean).join(' ')}
      whileTap={reduceMotion || isDisabled ? undefined : { scale: TAP_SCALE }}
      transition={TAP_TRANSITION}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      {children}
    </motion.button>
  )
}
