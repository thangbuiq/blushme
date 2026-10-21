import type { ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { SCREEN_TRANSITION } from './motion'

interface CollapseProps {
  open: boolean
  children: ReactNode
}

// A smooth, slow expand/collapse used anywhere content is revealed on demand
// (disclosure rows, "Add more", "More"), instead of content just popping in.
export function Collapse({ open, children }: CollapseProps) {
  const reduceMotion = useReducedMotion()

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={reduceMotion ? undefined : { height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
          transition={SCREEN_TRANSITION}
          style={{ overflow: 'hidden' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
