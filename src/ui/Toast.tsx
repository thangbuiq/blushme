import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useUiStore } from '@/store/uiStore'
import { SPRING } from './motion'

export function Toast() {
  const { t } = useTranslation()
  const toast = useUiStore((s) => s.toast)
  const hideToast = useUiStore((s) => s.hideToast)

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(hideToast, 4200)
    return () => window.clearTimeout(timer)
  }, [toast, hideToast])

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 'max(16px, env(safe-area-inset-top))',
        zIndex: 60,
        padding: '0 16px',
        pointerEvents: 'none',
      }}
    >
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12 }}
            transition={SPRING}
            style={{
              background: 'var(--color-primary)',
              color: '#fff',
              padding: '12px 20px',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-body-sm)',
              boxShadow: 'var(--shadow-lift)',
              width: 'fit-content',
              maxWidth: '100%',
              margin: '0 auto',
              textAlign: 'center',
            }}
          >
            {t(toast.key)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
