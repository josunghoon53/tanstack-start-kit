import { describe, expect, it } from 'vitest'
import { getNavItems } from './nav'

describe('getNavItems', () => {
  it('returns Korean labels for ko', () => {
    const items = getNavItems('ko')

    expect(items[0]).toMatchObject({ label: '대시보드', href: '/' })
  })

  it('returns English labels for en', () => {
    const items = getNavItems('en')

    expect(items[0]).toMatchObject({ label: 'Dashboard', href: '/' })
  })

  it('keeps the same hrefs/structure across locales', () => {
    const koHrefs = getNavItems('ko').map((item) =>
      item.type === 'link'
        ? item.href
        : item.sections.flatMap((s) => s.items.map((i) => i.href)),
    )
    const enHrefs = getNavItems('en').map((item) =>
      item.type === 'link'
        ? item.href
        : item.sections.flatMap((s) => s.items.map((i) => i.href)),
    )

    expect(enHrefs).toEqual(koHrefs)
  })
})
