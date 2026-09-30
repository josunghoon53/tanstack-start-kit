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

  it('links the LLM runner menu to /llm-runner in both locales', () => {
    for (const [locale, label] of [
      ['ko', 'AI 플레이그라운드'],
      ['en', 'AI Playground'],
    ] as const) {
      expect(getNavItems(locale)).toContainEqual(
        expect.objectContaining({ type: 'link', label, href: '/llm-runner' }),
      )
    }
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
