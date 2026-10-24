import { readFileSync, writeFileSync } from 'node:fs'
import { parse } from 'yaml'

interface DesignTokens {
  colors: Record<string, string>
  typography: Record<
    string,
    {
      fontFamily: string
      fontSize: string
      fontWeight: number
      lineHeight: number
      letterSpacing?: string
      fontFeature?: string
    }
  >
  rounded: Record<string, string>
  spacing: Record<string, string>
}

function kebab(name: string): string {
  return name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

function readFrontmatter(path: string): DesignTokens {
  const raw = readFileSync(path, 'utf-8')
  const match = raw.match(/^---\n([\s\S]*?)\n---/)
  if (!match) throw new Error('DESIGN.md is missing a YAML frontmatter block')
  return parse(match[1]) as DesignTokens
}

function main() {
  const tokens = readFrontmatter(new URL('../DESIGN.md', import.meta.url).pathname)
  const lines: string[] = [':root {']

  for (const [name, value] of Object.entries(tokens.colors)) {
    lines.push(`  --color-${kebab(name)}: ${value};`)
  }
  for (const [name, value] of Object.entries(tokens.rounded)) {
    lines.push(`  --radius-${kebab(name)}: ${value};`)
  }
  for (const [name, value] of Object.entries(tokens.spacing)) {
    lines.push(`  --space-${kebab(name)}: ${value};`)
  }
  for (const [name, type] of Object.entries(tokens.typography)) {
    const key = kebab(name)
    const family = type.fontFamily.includes(',') ? type.fontFamily : `'${type.fontFamily}', serif`
    lines.push(`  --font-family-${key}: ${family};`)
    lines.push(`  --font-size-${key}: ${type.fontSize};`)
    lines.push(`  --font-weight-${key}: ${type.fontWeight};`)
    lines.push(`  --line-height-${key}: ${type.lineHeight};`)
    if (type.letterSpacing) lines.push(`  --letter-spacing-${key}: ${type.letterSpacing};`)
  }
  lines.push('}')
  lines.push('')

  writeFileSync(new URL('../src/ui/tokens.css', import.meta.url).pathname, lines.join('\n'))
  console.log('Wrote src/ui/tokens.css')
}

main()
