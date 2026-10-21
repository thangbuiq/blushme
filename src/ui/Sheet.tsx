import { useEffect, useRef, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
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

export function Sheet({ open, onClose, title, ariaLabel, subtitle, children }: SheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  const { t } = useTranslation()

  useEffect(() => {
    if (!open) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    sheetRef.current?.focus()
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
          transition={{ duration: reduceMotion ? 0 : 0.2 }}
        >
          <motion.div
            ref={sheetRef}
            className={styles.sheet}
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel ?? (typeof title === 'string' ? title : undefined)}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            initial={reduceMotion ? undefined : { opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.4, 0, 0.2, 1] }}
          >
            <button type="button" className={styles.closeButton} onClick={onClose} aria-label={t('common.cancel')}>
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
