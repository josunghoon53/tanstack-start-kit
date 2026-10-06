import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import {
  COLOR_STORAGE_KEY,
  DEFAULT_THEME_STYLE,
  STYLE_STORAGE_KEY,
  THEME_COLORS,
  THEME_INIT_SCRIPT,
  THEME_STYLES,
  applyThemeColor,
  applyThemeStyle,
  parseThemeColor,
  parseThemeStyle,
} from './theme'

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
})

describe('apply helpers', () => {
  it('sets data-style on the element', () => {
    applyThemeStyle(document.documentElement, 'soft')
    expect(document.documentElement).toHaveAttribute('data-style', 'soft')
  })

  it('sets and clears data-color', () => {
    applyThemeColor(document.documentElement, 'nature')
    expect(document.documentElement).toHaveAttribute('data-color', 'nature')

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
