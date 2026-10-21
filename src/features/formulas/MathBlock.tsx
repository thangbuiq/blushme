import { useEffect, useState } from 'react'

interface MathBlockProps {
  latex: string
  displayMode?: boolean
}

export function MathBlock({ latex, displayMode = true }: MathBlockProps) {
  const [html, setHtml] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function render() {
      const [katex] = await Promise.all([import('katex'), import('katex/dist/katex.min.css')])
      if (cancelled) return
      setHtml(katex.default.renderToString(latex, { displayMode, throwOnError: false }))
    }
    void render()
    return () => {
      cancelled = true
    }
  }, [latex, displayMode])

  if (!html) return <p aria-hidden="true">{latex}</p>

  return <div dangerouslySetInnerHTML={{ __html: html }} />
}
