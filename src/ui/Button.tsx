import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion'
import styles from './Button.module.css'
import { TAP_SCALE, TAP_TRANSITION } from './motion'

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary'
}

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  const reduceMotion = useReducedMotion()
  const variantClass = variant === 'primary' ? styles.primary : styles.secondary
  return (
    <motion.button
      className={[styles.button, variantClass, className].filter(Boolean).join(' ')}
      whileTap={reduceMotion || props.disabled ? undefined : { scale: TAP_SCALE }}
      transition={TAP_TRANSITION}
      {...props}
    />
  )
}
