// Shared motion presets: slow and calm per DESIGN.md, never snappy or bouncy.
export const EASE = [0.4, 0, 0.2, 1] as const
export const TAP_SCALE = 0.97
export const SCREEN_TRANSITION = { duration: 0.28, ease: EASE }
export const TAP_TRANSITION = { duration: 0.15, ease: EASE }
