import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion, useDragControls, useMotionValue, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { CloseIcon } from './Icon'
import styles from './Sheet.module.css'

interface SheetProps {
  open: boolean
  onClose: () => void
  title: ReactNode
  ariaLabel?: string
  subtitle?: ReactNode
  children: ReactNode
}

const EXIT_MS = 260

// The slide and the fade are CSS animations (the `translate` property and
// opacity), so they run on the compositor thread and stay smooth even while the
// main thread is busy mounting the sheet's content. Framer Motion only handles
// the drag, which uses `transform`, so the two never fight over one property.
export function Sheet({ open, onClose, title, ariaLabel, subtitle, children }: SheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  const dragControls = useDragControls()
  const dragY = useMotionValue(0)
  const { t } = useTranslation()

  const [mounted, setMounted] = useState(open)
  const [closing, setClosing] = useState(false)
  // While sliding out the parent may already have cleared its content; keep showing the last open render.
  const latest = useRef({ title, ariaLabel, subtitle, children })
  if (open) latest.current = { title, ariaLabel, subtitle, children }

  useEffect(() => {
    if (open) {
      dragY.set(0)
      setMounted(true)
      setClosing(false)
      return
    }
    if (!mounted) return
    setClosing(true)
    const timer = window.setTimeout(
      () => {
        setMounted(false)
        setClosing(false)
      },
      reduceMotion ? 0 : EXIT_MS,
    )
    return () => window.clearTimeout(timer)
  }, [open, mounted, reduceMotion, dragY])

  useEffect(() => {
    if (!open) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    // preventScroll: the sheet starts off-screen (translated), and a plain focus()
    // scrolls the app frame to reveal it, which made the page jump.
    sheetRef.current?.focus({ preventScroll: true })
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!mounted) return null
  const shown = open ? { title, ariaLabel, subtitle, children } : latest.current

  return (
    <div
      className={`${styles.backdrop} ${closing ? styles.backdropClosing : ''}`}
      onClick={onClose}
    >
      <motion.div
        ref={sheetRef}
        className={`${styles.sheet} ${closing ? styles.sheetClosing : ''} scroll`}
        role="dialog"
        aria-modal="true"
        aria-label={shown.ariaLabel ?? (typeof shown.title === 'string' ? shown.title : undefined)}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        style={{ y: dragY }}
        drag={reduceMotion ? false : 'y'}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.5 }}
        dragListener={false}
        dragControls={dragControls}
        onDragEnd={(_, info) => {
          if (info.offset.y > 110 || info.velocity.y > 600) onClose()
        }}
      >
        <div className={styles.header}>
          <div
            className={styles.handleZone}
            style={{ touchAction: 'none' }}
            onPointerDown={(e) => dragControls.start(e)}
          >
            <div className={styles.handle} aria-hidden="true" />
          </div>
          <div className={styles.titleRow}>
            <h2 className={styles.title}>{shown.title}</h2>
            <button
              type="button"
              className={styles.closeButton}
              onClick={onClose}
              aria-label={t('common.close')}
            >
              <CloseIcon size={16} />
            </button>
          </div>
        </div>
        {shown.subtitle && <p className={styles.subtitle}>{shown.subtitle}</p>}
        {shown.children}
      </motion.div>
    </div>
  )
}
