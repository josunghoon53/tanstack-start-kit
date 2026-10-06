import { describe, expect, it } from 'vitest'
import { PALETTE_PRESETS, THEME_COLORS } from './theme'

// WCAG 2.x 상대 휘도와 대비 비율. 미리보기(color-combos-preview.html)와 같은 식이다.
function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a: string, b: string) {
  const x = luminance(a)
  const y = luminance(b)
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}

const presets = THEME_COLORS.map((id) => [id, PALETTE_PRESETS[id]] as const)

describe('palette presets', () => {
  it('defines a preset for every allowed color and nothing else', () => {
    expect(Object.keys(PALETTE_PRESETS).sort()).toEqual(
      [...THEME_COLORS].sort(),
    )
  })

  it.each(presets)('%s stores uppercase 6-digit hex values', (_, preset) => {
    for (const value of Object.values(preset)) {
      expect(value).toMatch(/^#[0-9A-F]{6}$/)
    }
  })

  it.each(presets)(
    '%s assigns roles by luminance (main < accent < soft)',
    (_, preset) => {
      expect(luminance(preset.main)).toBeLessThan(luminance(preset.accent))
      expect(luminance(preset.accent)).toBeLessThan(luminance(preset.soft))
    },
  )
})

describe('palette contrast (WCAG)', () => {
  it.each(presets)('%s: white text on 주색 is at least 4.5:1', (_, p) => {
    expect(p.mainFg).toBe('#FFFFFF')
    expect(contrast(p.mainFg, p.main)).toBeGreaterThanOrEqual(4.5)
  })

  it.each(presets)(
    '%s: 주색 as text (links, active tab) on a white card is at least 4.5:1',
    (_, p) => {
      expect(contrast(p.main, '#FFFFFF')).toBeGreaterThanOrEqual(4.5)
    },
  )

  it.each(presets)(
    '%s: sidebar inactive text on 주색 is at least 4.5:1',
    (_, p) => {
      expect(contrast(p.sidebarText, p.main)).toBeGreaterThanOrEqual(4.5)
    },
  )

  it.each(presets)(
    '%s: sidebar strong text beats the inactive text and is at least 4.5:1 on the hover surface',
    (_, p) => {
      // 목표는 7:1이지만 주색이 밝은 프리셋(sweet: 흰색도 6.0:1)은 흰색까지만 올라간다.
      expect(contrast(p.sidebarStrong, p.main)).toBeGreaterThanOrEqual(
        contrast(p.sidebarText, p.main),
      )
      expect(contrast(p.sidebarStrong, p.sidebarLine)).toBeGreaterThanOrEqual(
        4.5,
      )
    },
  )

  it.each(presets)(
    '%s: active menu text on the 포인트 pill is at least 4.5:1',
    (_, p) => {
      expect(['#111111', '#FFFFFF']).toContain(p.accentFg)
      expect(contrast(p.accentFg, p.accent)).toBeGreaterThanOrEqual(4.5)
    },
  )

  it.each(presets)(
    '%s: chip text on the 옅은 색 surface is at least 4.5:1',
    (_, p) => {
      expect(contrast(p.softFg, p.soft)).toBeGreaterThanOrEqual(4.5)
    },
  )

  it.each(presets)(
    '%s: 포인트 pill stands out from the 주색 sidebar (non-text, 3:1)',
    (_, p) => {
      expect(contrast(p.accent, p.main)).toBeGreaterThanOrEqual(3)
    },
  )
})
