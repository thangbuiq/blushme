import { useEffect, useRef, type ReactNode } from 'react'
import { AnimatePresence, motion, useDragControls, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { CloseIcon } from './Icon'
import { SOFT_SPRING } from './motion'
import styles from './Sheet.module.css'

interface SheetProps {
  open: boolean
  onClose: () => void
  title: ReactNode
  ariaLabel?: string
  subtitle?: ReactNode
  children: ReactNode
}

export function Sheet({ open, onClose, title, ariaLabel, subtitle, children }: SheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  const dragControls = useDragControls()
  const { t } = useTranslation()

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

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={styles.backdrop}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.25 }}
        >
          <motion.div
            ref={sheetRef}
            className={`${styles.sheet} scroll`}
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel ?? (typeof title === 'string' ? title : undefined)}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            initial={reduceMotion ? undefined : { y: '100%' }}
            animate={{ y: 0 }}
            exit={reduceMotion ? undefined : { y: '100%' }}
            transition={reduceMotion ? { duration: 0 } : SOFT_SPRING}
            drag={reduceMotion ? false : 'y'}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            dragListener={false}
            dragControls={dragControls}
            onDragEnd={(_, info) => {
              if (info.offset.y > 110 || info.velocity.y > 600) onClose()
            }}
          >
            <div
              className={styles.handle}
              aria-hidden="true"
              style={{ touchAction: 'none' }}
              onPointerDown={(e) => dragControls.start(e)}
            />
            <button
              type="button"
              className={styles.closeButton}
              onClick={onClose}
              aria-label={t('common.close')}
            >
              <CloseIcon size={16} />
            </button>
            <h2 className={styles.title}>{title}</h2>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
