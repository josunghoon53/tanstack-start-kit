import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/i18n/use-translation'
import {
  COLOR_STORAGE_KEY,
  THEME_COLORS,
  applyThemeColor,
  parseThemeColor,
} from '@/config/theme'
import type { ThemeColor } from '@/config/theme'

// 스와치 색은 src/styles.css의 data-color 포인트색의 색상각(--ah)과 같은 값을 쓴다.
const COLOR_HUES: Record<ThemeColor, number> = {
  blue: 255,
  green: 155,
  purple: 300,
  rose: 12,
  orange: 55,
}

export function ColorThemePicker() {
  const t = useTranslation().colorThemePicker
  const [color, setColor] = useState<ThemeColor | null>(null)

  useEffect(() => {
    setColor(parseThemeColor(window.localStorage.getItem(COLOR_STORAGE_KEY)))
  }, [])

  function selectColor(next: ThemeColor | null) {
    setColor(next)
    applyThemeColor(document.documentElement, next)
    if (next === null) {
      window.localStorage.removeItem(COLOR_STORAGE_KEY)
    } else {
      window.localStorage.setItem(COLOR_STORAGE_KEY, next)
    }
  }

  const options: Array<{
    key: ThemeColor | null
    label: string
    swatch: string
  }> = [
    { key: null, label: t.neutral, swatch: 'oklch(0.25 0 90)' },
    ...THEME_COLORS.map((key) => ({
      key,
      label: t[key],
      swatch: `oklch(0.5 0.11 ${COLOR_HUES[key]})`,
    })),
  ]

  return (
    <div className="flex flex-wrap gap-3">
      {options.map((item) => {
        const selected = color === item.key
        return (
          <button
            key={item.key ?? 'default'}
            type="button"
            onClick={() => selectColor(item.key)}
            className="flex flex-col items-center gap-1.5"
            aria-label={item.label}
            aria-pressed={selected}
            title={item.label}
          >
            <span
              className={cn(
                'flex size-8 items-center justify-center rounded-full ring-2 ring-offset-2 ring-offset-background transition-colors',
                selected ? 'ring-foreground' : 'ring-transparent',
              )}
              style={{ background: item.swatch }}
            >
              {selected && <Check className="size-4 text-white" />}
            </span>
            <span className="text-xs text-muted-foreground">{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}
