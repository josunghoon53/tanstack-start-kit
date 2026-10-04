import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/i18n/use-translation'
import {
  DEFAULT_THEME_STYLE,
  STYLE_STORAGE_KEY,
  THEME_STYLES,
  applyThemeStyle,
  parseThemeStyle,
} from '@/config/theme'
import type { ThemeStyle } from '@/config/theme'

// 스타일 이름은 고유명사라 번역하지 않는다(언어 토글의 언어 이름과 같은 이유).
const STYLE_NAMES: Record<ThemeStyle, string> = {
  graphite: 'Graphite',
  warm: 'Warm Paper',
  editorial: 'Editorial',
  nordic: 'Nordic',
}

// 미리보기 칩 색: 사이드바 / 배경 / 포인트. src/styles.css 각 스타일의 기본 팔레트와 맞춘다.
const PREVIEWS: Record<
  ThemeStyle,
  { side: string; bg: string; accent: string }
> = {
  graphite: {
    side: 'oklch(0.25 0.014 285)',
    bg: 'oklch(0.972 0.006 285)',
    accent: 'oklch(0.54 0.1 285)',
  },
  warm: {
    side: 'oklch(0.3 0.022 42)',
    bg: 'oklch(0.975 0.012 42)',
    accent: 'oklch(0.54 0.1 42)',
  },
  editorial: {
    side: 'oklch(0.19 0 0)',
    bg: 'oklch(1 0 0)',
    accent: 'oklch(0.2 0 0)',
  },
  nordic: {
    side: 'oklch(0.3 0.032 255)',
    bg: 'oklch(0.965 0.012 255)',
    accent: 'oklch(0.52 0.09 255)',
  },
}

export function StyleThemePicker() {
  const t = useTranslation().stylePicker
  const [style, setStyle] = useState<ThemeStyle>(DEFAULT_THEME_STYLE)

  useEffect(() => {
    setStyle(parseThemeStyle(window.localStorage.getItem(STYLE_STORAGE_KEY)))
  }, [])

  function selectStyle(next: ThemeStyle) {
    setStyle(next)
    applyThemeStyle(document.documentElement, next)
    window.localStorage.setItem(STYLE_STORAGE_KEY, next)
  }

  return (
    <div className="grid grid-cols-4 gap-3">
      {THEME_STYLES.map((key) => {
        const preview = PREVIEWS[key]
        const selected = style === key
        return (
          <button
            key={key}
            type="button"
            onClick={() => selectStyle(key)}
            aria-pressed={selected}
            className={cn(
              'flex flex-col gap-2 rounded-lg border bg-card p-2 text-left transition-colors',
              selected
                ? 'border-primary ring-2 ring-primary/30'
                : 'hover:border-foreground/30',
            )}
          >
            <span
              aria-hidden="true"
              className="flex h-14 overflow-hidden rounded-md border"
            >
              <span className="w-1/4" style={{ background: preview.side }} />
              <span
                className="flex flex-1 flex-col gap-1 p-1.5"
                style={{ background: preview.bg }}
              >
                <span
                  className="h-1.5 w-1/2 rounded-full"
                  style={{ background: preview.accent }}
                />
                <span className="h-1.5 w-3/4 rounded-full bg-black/10" />
              </span>
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold">{STYLE_NAMES[key]}</span>
              <span className="text-xs text-muted-foreground">{t[key]}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
