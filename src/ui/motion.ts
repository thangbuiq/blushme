// Shared motion presets: calm and soft, with a touch of spring for life.
export const EASE = [0.22, 1, 0.36, 1] as const
export const TAP_SCALE = 0.96
export const SCREEN_TRANSITION = { duration: 0.32, ease: EASE }
export const TAP_TRANSITION = { duration: 0.15, ease: EASE }
export const SPRING = { type: 'spring', stiffness: 420, damping: 30 } as const
export const SOFT_SPRING = { type: 'spring', stiffness: 220, damping: 26 } as const

/** Staggered reveal for lists of cards: spread onto a motion element with `custom={index}`. */
export const REVEAL = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: EASE, delay: 0.04 * Math.min(i, 5) },
  }),
}
