import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Sheet } from './Sheet'
import { Button } from './Button'

interface PendingConfirm {
  message: string
  confirmLabel?: string
  resolve: (confirmed: boolean) => void
}

interface ConfirmContextValue {
  confirm: (message: string, confirmLabel?: string) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null)

// A styled, in-app replacement for window.confirm(): every "are you sure?"
// moment (delete all data, an unusually early period) should look like part
// of Blush, not a browser-chrome popup.
export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const [pending, setPending] = useState<PendingConfirm | null>(null)
  const resolverRef = useRef<((confirmed: boolean) => void) | null>(null)

  const confirm = useCallback((message: string, confirmLabel?: string) => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve
      setPending({ message, confirmLabel, resolve })
    })
  }, [])

  function settle(confirmed: boolean) {
    resolverRef.current?.(confirmed)
    resolverRef.current = null
    setPending(null)
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <Sheet open={pending !== null} onClose={() => settle(false)} title={t('common.areYouSure')}>
        <p>{pending?.message}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
          <Button variant="primary" onClick={() => settle(true)}>
            {pending?.confirmLabel ?? t('common.yes')}
          </Button>
          <Button variant="secondary" onClick={() => settle(false)}>
            {t('common.cancel')}
          </Button>
        </div>
      </Sheet>
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const context = useContext(ConfirmContext)
  if (!context) throw new Error('useConfirm must be used within a ConfirmDialogProvider')
  return context.confirm
}
