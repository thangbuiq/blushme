import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Button } from './Button'
import { Bloom } from './art/Botanical'
import styles from './ConfirmDialog.module.css'

interface ConfirmOptions {
  /** Destructive action: tints the dialog and the confirm button red. */
  danger?: boolean
}

interface PendingConfirm extends ConfirmOptions {
  message: string
  confirmLabel?: string
}

interface ConfirmContextValue {
  confirm: (message: string, confirmLabel?: string, options?: ConfirmOptions) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null)

// A styled, in-app replacement for window.confirm(): every "are you sure?"
// moment (delete all data, an unusually early period) should look like part
// of Blushme, not a browser-chrome popup. A small centred card, not a bottom
// sheet: it is a quick yes/no, so it appears right where the eye already is.
export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const reduceMotion = useReducedMotion()
  const [pending, setPending] = useState<PendingConfirm | null>(null)
  const resolverRef = useRef<((confirmed: boolean) => void) | null>(null)

  const confirm = useCallback(
    (message: string, confirmLabel?: string, options?: ConfirmOptions) => {
      // A second request while one is open settles the first as cancelled.
      resolverRef.current?.(false)
      return new Promise<boolean>((resolve) => {
        resolverRef.current = resolve
        setPending({ message, confirmLabel, ...options })
      })
    },
    [],
  )

  const settle = useCallback((confirmed: boolean) => {
    resolverRef.current?.(confirmed)
    resolverRef.current = null
    setPending(null)
  }, [])

  const open = pending !== null
  useEffect(() => {
    if (!open) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') settle(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, settle])

  const fade = reduceMotion ? 0 : 0.2

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <AnimatePresence>
        {pending && (
          <motion.div
            key="confirm"
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: fade }}
            onClick={() => settle(false)}
          >
            <motion.div
              className={`${styles.dialog} ${pending.danger ? styles.danger : ''}`}
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="confirm-title"
              aria-describedby="confirm-body"
              initial={reduceMotion ? undefined : { opacity: 0, scale: 0.92, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, scale: 0.96, y: 6 }}
              transition={{ duration: reduceMotion ? 0 : 0.26, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.badge}>
                <Bloom size={56} tone={pending.danger ? 'butter' : 'rose'} still />
              </div>
              <h2 id="confirm-title" className={styles.title}>
                {t('common.areYouSure')}
              </h2>
              <p id="confirm-body" className={styles.body}>
                {pending.message}
              </p>
              <div className={styles.actions}>
                <Button
                  variant={pending.danger ? 'dangerSolid' : 'primary'}
                  autoFocus
                  onClick={() => settle(true)}
                >
                  {pending.confirmLabel ?? t('common.yes')}
                </Button>
                <Button variant="ghost" onClick={() => settle(false)}>
                  {t('common.cancel')}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const context = useContext(ConfirmContext)
  if (!context) throw new Error('useConfirm must be used within a ConfirmDialogProvider')
  return context.confirm
}
