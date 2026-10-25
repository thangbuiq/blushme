import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useUiStore } from '@/store/uiStore'
import { Sheet } from './Sheet'

// Mounted last at the app root so it stacks above whichever sheet opened it.
export function GlossarySheet() {
  const { t } = useTranslation()
  const term = useUiStore((s) => s.glossaryTerm)
  const close = useUiStore((s) => s.closeGlossary)
  // Keep the last term while the sheet slides out, so its text doesn't vanish mid-animation.
  const shown = useRef(term)
  if (term) shown.current = term
  const key = shown.current
  return (
    <Sheet open={term !== null} onClose={close} title={key ? t(`glossary.${key}.title`) : ''}>
      {key && (
        <p style={{ color: 'var(--color-secondary)' }}>{t(`glossary.${key}.body`)}</p>
      )}
    </Sheet>
  )
}
