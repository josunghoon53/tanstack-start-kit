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
  clean: 'Clean',
  soft: 'Soft',
  editorial: 'Editorial',
  crisp: 'Crisp',
}

// 미리보기는 모양과 글꼴만 보여주도록 항상 회색조로 그린다(스타일은 색을 갖지 않는다).
// 값은 src/styles.css 각 스타일 블록의 --card-border/--shadow-card/--font-body 와 맞춘다.
const PREVIEWS: Record<
  ThemeStyle,
  { radius: string; border: string; shadow: string; font: string }
> = {
  clean: {
    radius: '8px',
    border: 'oklch(0.9 0.006 90)',
    shadow: '0 1px 2px oklch(0.3 0.01 90 / 0.06)',
    font: "'IBM Plex Sans KR', sans-serif",
  },
  soft: {
    radius: '14px',
    border: 'oklch(0.9 0.006 90)',
    shadow: '0 8px 24px -16px oklch(0.35 0.02 90 / 0.35)',
    font: "'Gowun Dodum', sans-serif",
  },
  editorial: {
    radius: '0px',
    border: 'oklch(0.9 0.006 90)',
    shadow: 'none',
    font: "'Nanum Myeongjo', serif",
  },
  crisp: {
    radius: '3px',
    border: 'oklch(0.22 0.004 90)',
    shadow: 'none',
    font: "'Noto Sans KR', sans-serif",
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
              style={{ background: 'oklch(0.955 0.006 90)' }}
            >
              <span
                className="w-1/4"
                style={{ background: 'oklch(0.21 0.004 90)' }}
              />
              <span className="flex flex-1 items-center p-2">
                <span
                  className="w-full border px-2 py-1 text-xs leading-tight"
                  style={{
                    background: 'oklch(0.988 0.003 90)',
                    borderRadius: preview.radius,
                    borderColor: preview.border,
                    boxShadow: preview.shadow,
                    fontFamily: preview.font,
                    color: 'oklch(0.2 0.006 90)',
                  }}
                >
                  가나다 Aa
                </span>
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
