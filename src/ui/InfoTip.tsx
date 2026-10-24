import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { InfoIcon } from './Icon'
import styles from './InfoTip.module.css'

/**
 * A small (i) button with an explanation bubble. Opens on hover, focus or tap;
 * closes on Escape, blur or a tap elsewhere. The bubble spans the nearest
 * positioned ancestor (a settings row), so it never overflows the frame.
 */
export function InfoTip({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const id = useId()
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    function onPointerDown(event: PointerEvent) {
      if (!buttonRef.current?.parentElement?.contains(event.target as Node)) setOpen(false)
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <span
      className={styles.wrap}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        ref={buttonRef}
        type="button"
        className={styles.button}
        aria-label={t('common.moreInfo')}
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onClick={() => setOpen(true)}
      >
        <InfoIcon size={16} />
      </button>
      {open && (
        <span role="tooltip" id={id} className={styles.bubble}>
          {children}
        </span>
      )}
    </span>
  )
}
