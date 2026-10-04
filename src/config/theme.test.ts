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
})

describe('parseThemeColor', () => {
  it.each(THEME_COLORS)('accepts the known color %s', (color) => {
    expect(parseThemeColor(color)).toBe(color)
  })

  it('returns null (= style default color) for unknown, legacy, or missing values', () => {
    expect(parseThemeColor('slate')).toBeNull()
    expect(parseThemeColor('nope')).toBeNull()
    expect(parseThemeColor(null)).toBeNull()
  })
})

describe('apply helpers', () => {
  it('sets data-style on the element', () => {
    applyThemeStyle(document.documentElement, 'warm')
    expect(document.documentElement).toHaveAttribute('data-style', 'warm')
  })

  it('sets and clears data-color', () => {
    applyThemeColor(document.documentElement, 'green')
    expect(document.documentElement).toHaveAttribute('data-color', 'green')

    applyThemeColor(document.documentElement, null)
    expect(document.documentElement).not.toHaveAttribute('data-color')
  })
})

describe('THEME_INIT_SCRIPT', () => {
  function runScript() {
    new Function(THEME_INIT_SCRIPT)()
  }

  it('restores a stored style and color before first paint', () => {
    window.localStorage.setItem(STYLE_STORAGE_KEY, 'nordic')
    window.localStorage.setItem(COLOR_STORAGE_KEY, 'rose')

    runScript()

    expect(document.documentElement).toHaveAttribute('data-style', 'nordic')
    expect(document.documentElement).toHaveAttribute('data-color', 'rose')
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

  it.each(THEME_COLORS)('defines a block for the %s color preset', (color) => {
    expect(css).toContain(`:root[data-color='${color}']`)
  })

  it('no longer contains dark mode or background-image rules', () => {
    expect(css).not.toContain('.dark')
    expect(css).not.toContain('bg-grid-fade')
    expect(css).not.toContain('/backgrounds/')
  })
})
