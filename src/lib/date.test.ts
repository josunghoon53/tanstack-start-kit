import { describe, expect, it } from 'vitest'
import { isWithinDateRange, toDateKey } from './date'

describe('toDateKey', () => {
  it('formats a local date as YYYY-MM-DD, zero-padded', () => {
    expect(toDateKey(new Date(2026, 0, 5))).toBe('2026-01-05')
    expect(toDateKey(new Date(2026, 11, 31))).toBe('2026-12-31')
  })
})

describe('isWithinDateRange', () => {
  it('matches everything when the range is undefined or has no `from`', () => {
    expect(isWithinDateRange('2026-09-21', undefined)).toBe(true)
    expect(isWithinDateRange('2026-09-21', {})).toBe(true)
  })

  it('treats a range with only `from` as a single-day match', () => {
    const range = { from: new Date(2026, 8, 21) }
    expect(isWithinDateRange('2026-09-21', range)).toBe(true)
    expect(isWithinDateRange('2026-09-20', range)).toBe(false)
    expect(isWithinDateRange('2026-09-22', range)).toBe(false)
  })

  it('matches dates within an inclusive from/to range', () => {
    const range = { from: new Date(2026, 8, 10), to: new Date(2026, 8, 20) }
    expect(isWithinDateRange('2026-09-09', range)).toBe(false)
    expect(isWithinDateRange('2026-09-10', range)).toBe(true)
    expect(isWithinDateRange('2026-09-15', range)).toBe(true)
    expect(isWithinDateRange('2026-09-20', range)).toBe(true)
    expect(isWithinDateRange('2026-09-21', range)).toBe(false)
  })
})
