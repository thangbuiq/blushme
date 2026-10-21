import type { ReactNode } from 'react'
import { motion, useReducedMotion, AnimatePresence, type HTMLMotionProps } from 'framer-motion'
import styles from './Chip.module.css'
import { CheckIcon } from './Icon'
import { TAP_SCALE, TAP_TRANSITION } from './motion'

interface ChipProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  selected?: boolean
  children?: ReactNode
}

export function Chip({ selected = false, className, children, ...props }: ChipProps) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.button
      type="button"
      aria-pressed={selected}
      className={[styles.chip, selected && styles.selected, className].filter(Boolean).join(' ')}
      whileTap={reduceMotion ? undefined : { scale: TAP_SCALE }}
      animate={{ scale: 1 }}
      transition={TAP_TRANSITION}
      {...props}
    >
      <AnimatePresence initial={false}>
        {selected && (
          <motion.span
            style={{ display: 'inline-flex', overflow: 'hidden' }}
            initial={reduceMotion ? false : { width: 0, opacity: 0, marginRight: 0 }}
            animate={{ width: 'auto', opacity: 1, marginRight: 6 }}
            exit={reduceMotion ? undefined : { width: 0, opacity: 0, marginRight: 0 }}
            transition={TAP_TRANSITION}
          >
            <CheckIcon size={12} />
          </motion.span>
        )}
      </AnimatePresence>
      {children}
    </motion.button>
  )
}
