import { useTranslation } from 'react-i18next'
import { useUiStore, type GlossaryKey } from '@/store/uiStore'
import { InfoIcon } from './Icon'
import styles from './TermHint.module.css'

/** A small (i) button that opens the glossary sheet for a term. */
export function TermHint({ term }: { term: GlossaryKey }) {
  const { t } = useTranslation()
  const openGlossary = useUiStore((s) => s.openGlossary)
  return (
    <button
      type="button"
      className={styles.hint}
      aria-label={t('glossary.aria', { term: t(`glossary.${term}.title`) })}
      onClick={(e) => {
        e.stopPropagation()
        openGlossary(term)
      }}
    >
      <InfoIcon size={16} />
    </button>
  )
}

/** A label followed by its (i) hint, kept together on one line. */
export function TermLabel({
  term,
  children,
  className,
}: {
  term: GlossaryKey
  children: React.ReactNode
  className?: string
}) {
  return (
    <span className={`${styles.label} ${className ?? ''}`}>
      {children}
      <TermHint term={term} />
    </span>
  )
}
