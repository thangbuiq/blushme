import { describe, expect, it } from 'vitest'
import { excludeOutliers } from '../outliers'

describe('outlier exclusion', () => {
  it('excludes cycle lengths outside the [21, 45] day range, regardless of count', () => {
    const { valid, excluded } = excludeOutliers([28, 90, 27, 5])

    expect(valid.sort()).toEqual([27, 28])
    expect(excluded).toEqual(
      expect.arrayContaining([
        { index: 1, length: 90, reason: 'range' },
        { index: 3, length: 5, reason: 'range' },
      ]),
    )
  })

  it('leaves fewer than 5 in-range cycles untouched by the MAD check', () => {
    const { valid, excluded } = excludeOutliers([28, 29, 44, 27])
    expect(valid).toEqual([28, 29, 44, 27])
    expect(excluded).toHaveLength(0)
  })

  it('excludes a cycle more than 2.5 scaled-MAD from the median once n >= 5', () => {
    // Four tightly clustered cycles plus one in-range but wildly different one.
    const { valid, excluded } = excludeOutliers([28, 29, 27, 28, 44])

    expect(valid).toEqual([28, 29, 27, 28])
    expect(excluded).toEqual([{ index: 4, length: 44, reason: 'outlier' }])
  })
})
