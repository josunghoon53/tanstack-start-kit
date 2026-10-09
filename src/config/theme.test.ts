import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import {
  COLOR_STORAGE_KEY,
  DEFAULT_THEME_STYLE,
  STYLE_STORAGE_KEY,
  THEME_COLORS,
  THEME_INIT_SCRIPT,
  PALETTE_PRESETS,
  THEME_STYLES,
  applyThemeColor,
  applyThemeStyle,
  parseThemeColor,
  parseThemeStyle,
} from './theme'

// 2026-10에 정리한 예전 프리셋 id. 저장돼 있어도 기본(무채색)으로 조용히 돌아가야 한다.
const REMOVED_PRESETS = [
  'dreamy',
  'nature',
  'energy',
  'pop-color',
  'sweet',
  'cozy',
  'retro',
  'rest',
  'elegant',
  'clear',
]

afterEach(() => {
  window.localStorage.clear()
  document.documentElement.removeAttribute('data-style')
  document.documentElement.removeAttribute('data-color')
})

describe('parseThemeStyle', () => {
  it.each(THEME_STYLES)('accepts the known style %s', (style) => {
    expect(parseThemeStyle(style)).toBe(style)
  })

  it('falls back to the default for unknown or missing values', () => {
    expect(parseThemeStyle('nope')).toBe(DEFAULT_THEME_STYLE)
    expect(parseThemeStyle(null)).toBe(DEFAULT_THEME_STYLE)
  })

  it.each([
    ['graphite', 'clean'],
    ['nordic', 'clean'],
    ['warm', 'soft'],
  ] as const)('maps the legacy style %s to %s', (legacy, expected) => {
    expect(parseThemeStyle(legacy)).toBe(expected)
  })

  it('does not treat object prototype keys as legacy styles', () => {
    expect(parseThemeStyle('constructor')).toBe(DEFAULT_THEME_STYLE)
    expect(parseThemeStyle('toString')).toBe(DEFAULT_THEME_STYLE)
  })
})

describe('parseThemeColor', () => {
  it.each(THEME_COLORS)('accepts the known color %s', (color) => {
    expect(parseThemeColor(color)).toBe(color)
  })

  it('returns null (= neutral default) for unknown or missing values', () => {
    expect(parseThemeColor('slate')).toBeNull()
    expect(parseThemeColor('nope')).toBeNull()
    expect(parseThemeColor('constructor')).toBeNull()
    expect(parseThemeColor(null)).toBeNull()
  })

  it.each(['blue', 'green', 'purple', 'rose', 'orange'])(
    'falls back to neutral for the legacy accent color %s',
    (legacy) => {
      expect(parseThemeColor(legacy)).toBeNull()
    },
  )

  it.each(REMOVED_PRESETS)(
    'falls back to neutral for the removed preset %s',
    (removed) => {
      expect(parseThemeColor(removed)).toBeNull()
    },
  )
})

describe('apply helpers', () => {
  it('sets data-style on the element', () => {
    applyThemeStyle(document.documentElement, 'soft')
    expect(document.documentElement).toHaveAttribute('data-style', 'soft')
  })

  it('sets and clears data-color', () => {
    applyThemeColor(document.documentElement, 'pop-red')
    expect(document.documentElement).toHaveAttribute('data-color', 'pop-red')

    applyThemeColor(document.documentElement, null)
    expect(document.documentElement).not.toHaveAttribute('data-color')
  })
})

describe('THEME_INIT_SCRIPT', () => {
  function runScript() {
    new Function(THEME_INIT_SCRIPT)()
  }

  it('restores a stored style and color before first paint', () => {
    window.localStorage.setItem(STYLE_STORAGE_KEY, 'crisp')
    window.localStorage.setItem(COLOR_STORAGE_KEY, 'pop-red')

    runScript()

    expect(document.documentElement).toHaveAttribute('data-style', 'crisp')
    expect(document.documentElement).toHaveAttribute('data-color', 'pop-red')
  })

  it.each(THEME_COLORS)('restores the %s palette', (color) => {
    window.localStorage.setItem(COLOR_STORAGE_KEY, color)

    runScript()

    expect(document.documentElement).toHaveAttribute('data-color', color)
  })

  it.each(['blue', 'green', 'purple', 'rose', 'orange'])(
    'drops the legacy accent color %s back to neutral',
    (legacy) => {
      document.documentElement.setAttribute('data-color', 'pop')
      window.localStorage.setItem(COLOR_STORAGE_KEY, legacy)

      runScript()

      expect(document.documentElement).not.toHaveAttribute('data-color')
    },
  )

  it.each(REMOVED_PRESETS)(
    'drops the removed preset %s back to neutral',
    (removed) => {
      document.documentElement.setAttribute('data-color', 'pop')
      window.localStorage.setItem(COLOR_STORAGE_KEY, removed)

      runScript()

      expect(document.documentElement).not.toHaveAttribute('data-color')
    },
  )

  it('maps legacy stored styles to their new equivalents', () => {
    window.localStorage.setItem(STYLE_STORAGE_KEY, 'warm')

    runScript()

    expect(document.documentElement).toHaveAttribute('data-style', 'soft')
  })

  it('uses the default style and no color when nothing is stored', () => {
    runScript()

    expect(document.documentElement).toHaveAttribute(
      'data-style',
      DEFAULT_THEME_STYLE,
    )
    expect(document.documentElement).not.toHaveAttribute('data-color')
  })

  it('ignores invalid and legacy stored values', () => {
    window.localStorage.setItem(STYLE_STORAGE_KEY, 'bogus')
    window.localStorage.setItem(COLOR_STORAGE_KEY, 'slate')

    runScript()

    expect(document.documentElement).toHaveAttribute(
      'data-style',
      DEFAULT_THEME_STYLE,
    )
    expect(document.documentElement).not.toHaveAttribute('data-color')
  })
})

describe('styles.css consistency', () => {
  const css = readFileSync(resolve(process.cwd(), 'src/styles.css'), 'utf-8')

  it.each(THEME_STYLES.filter((style) => style !== DEFAULT_THEME_STYLE))(
    'defines a block for the %s style',
    (style) => {
      expect(css).toContain(`:root[data-style='${style}']`)
    },
  )

  it.each(THEME_COLORS)('defines a block for the %s color', (color) => {
    expect(css).toContain(`:root[data-color='${color}']`)
  })

  // theme.ts의 PALETTE_PRESETS 값이 CSS 블록에 그대로 들어 있어야 한다(둘은 손으로 맞춘다).
  const PAL_VARS = {
    main: '--pal-main',
    accent: '--pal-accent',
    soft: '--pal-soft',
    mainFg: '--pal-main-fg',
    accentFg: '--pal-accent-fg',
    softFg: '--pal-soft-fg',
    sidebarText: '--pal-sidebar-text',
    sidebarStrong: '--pal-sidebar-strong',
    sidebarLine: '--pal-sidebar-line',
  } as const

  function colorBlock(color: string) {
    const start = css.indexOf(`:root[data-color='${color}'] {`)
    return css.slice(start, css.indexOf('}', start))
  }

  // prettier가 CSS의 hex를 소문자로 바꾸므로 소문자로 비교한다.
  it.each(THEME_COLORS)('the %s block matches PALETTE_PRESETS', (color) => {
    const block = colorBlock(color)
    for (const [key, cssVar] of Object.entries(PAL_VARS)) {
      const value = PALETTE_PRESETS[color][key as keyof typeof PAL_VARS]
      expect(block).toContain(`${cssVar}: ${value.toLowerCase()};`)
    }
  })

  it('has no CSS block for a color that is not in THEME_COLORS', () => {
    const ids = [...css.matchAll(/:root\[data-color='([^']+)'\]/g)].map(
      (match) => match[1],
    )
    expect([...new Set(ids)].sort()).toEqual([...THEME_COLORS].sort())
  })

  it('maps the palette onto shadcn tokens after the style blocks', () => {
    const mapping = css.indexOf(':root[data-color] {')
    expect(mapping).toBeGreaterThan(css.lastIndexOf(":root[data-style='"))
    for (const color of THEME_COLORS) {
      expect(css.indexOf(`:root[data-color='${color}']`)).toBeGreaterThan(
        css.lastIndexOf(":root[data-style='"),
      )
    }
  })

  it('never puts a palette color on the big main surfaces', () => {
    const mapping = css.slice(
      css.indexOf(':root[data-color] {'),
      css.indexOf('}', css.indexOf(':root[data-color] {')),
    )
    for (const token of [
      '--background',
      '--card',
      '--foreground',
      '--secondary',
      '--muted',
      '--accent',
      '--border',
      '--popover',
    ]) {
      expect(mapping).not.toContain(`${token}:`)
    }
  })

  it('drops the old hue-angle accent switches', () => {
    expect(css).not.toContain('--ah')
    expect(css).not.toContain('--ae')
  })

  it('keeps styles free of color: no hue shifting or per-style palettes remain', () => {
    for (const legacy of ['graphite', 'warm', 'nordic']) {
      expect(css).not.toContain(`data-style='${legacy}'`)
    }
    expect(css).not.toContain('--nk')
    expect(css).not.toContain('--ak')
  })

  it('no longer contains dark mode or background-image rules', () => {
    expect(css).not.toContain('.dark')
    expect(css).not.toContain('bg-grid-fade')
    expect(css).not.toContain('/backgrounds/')
  })
})
