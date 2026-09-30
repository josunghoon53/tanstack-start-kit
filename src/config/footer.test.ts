import { describe, expect, it } from 'vitest'
import { getFooterColumns, getFooterSocialLinks } from './footer'

describe('getFooterColumns', () => {
  it('returns Korean column titles for ko', () => {
    const columns = getFooterColumns('ko')

    expect(columns.map((c) => c.title)).toEqual(['제품', '리소스', '법적 정보'])
  })

  it('returns English column titles for en', () => {
    const columns = getFooterColumns('en')

    expect(columns.map((c) => c.title)).toEqual([
      'Product',
      'Resources',
      'Legal',
    ])
  })

  it('keeps the same hrefs across locales', () => {
    const koHrefs = getFooterColumns('ko').flatMap((c) =>
      c.links.map((l) => l.href),
    )
    const enHrefs = getFooterColumns('en').flatMap((c) =>
      c.links.map((l) => l.href),
    )

    expect(enHrefs).toEqual(koHrefs)
  })
})

describe('getFooterSocialLinks', () => {
  it('keeps GitHub/X/email order across locales', () => {
    const koLinks = getFooterSocialLinks('ko')
    const enLinks = getFooterSocialLinks('en')

    expect(koLinks.map((l) => l.href)).toEqual(enLinks.map((l) => l.href))
    expect(koLinks[2].href).toBe('mailto:hello@example.com')
  })
})
