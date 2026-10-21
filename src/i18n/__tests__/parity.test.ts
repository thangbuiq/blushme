import { describe, expect, it } from 'vitest'
import en from '../en.json'
import vi from '../vi.json'

type Tree = { [key: string]: Tree | string }

function collectKeyPaths(tree: Tree, prefix = ''): string[] {
  return Object.entries(tree).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key
    return typeof value === 'string' ? [path] : collectKeyPaths(value, path)
  })
}

describe('i18n key parity', () => {
  it('has the same set of keys in en and vi', () => {
    const enKeys = collectKeyPaths(en as Tree).sort()
    const viKeys = collectKeyPaths(vi as Tree).sort()

    const missingFromVi = enKeys.filter((k) => !viKeys.includes(k))
    const missingFromEn = viKeys.filter((k) => !enKeys.includes(k))

    expect(missingFromVi, 'keys present in en but missing from vi').toEqual([])
    expect(missingFromEn, 'keys present in vi but missing from en').toEqual([])
  })

  it('has no empty translation values', () => {
    for (const [locale, tree] of [['en', en], ['vi', vi]] as const) {
      for (const path of collectKeyPaths(tree as Tree)) {
        const value = path.split('.').reduce<unknown>((node, key) => {
          return (node as Tree)[key]
        }, tree)
        expect(typeof value === 'string' && value.trim().length > 0, `${locale}.${path}`).toBe(
          true,
        )
      }
    }
  })
})
