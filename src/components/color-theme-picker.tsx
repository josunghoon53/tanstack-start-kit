import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

type ColorTheme = 'blue' | 'green' | 'purple' | 'rose' | 'orange' | 'slate'

const COLOR_THEMES: Array<{ key: ColorTheme; label: string; swatch: string }> = [
  { key: 'blue', label: '블루', swatch: 'oklch(0.55 0.15 260)' },
  { key: 'green', label: '그린', swatch: 'oklch(0.45 0.08 155)' },
  { key: 'purple', label: '퍼플', swatch: 'oklch(0.55 0.15 300)' },
  { key: 'rose', label: '로즈', swatch: 'oklch(0.55 0.15 15)' },
  { key: 'orange', label: '오렌지', swatch: 'oklch(0.58 0.15 60)' },
  { key: 'slate', label: '무채색', swatch: 'oklch(0.45 0 0)' },
]

function getInitialColor(): ColorTheme {
  if (typeof window === 'undefined') {
    return 'blue'
  }

  const stored = window.localStorage.getItem('theme-color')
  if (COLOR_THEMES.some((item) => item.key === stored)) {
    return stored as ColorTheme
  }

  return 'blue'
}

function applyColorTheme(color: ColorTheme) {
  if (color === 'blue') {
    document.documentElement.removeAttribute('data-color')
  } else {
    document.documentElement.setAttribute('data-color', color)
  }
}

export function ColorThemePicker() {
  const [color, setColor] = useState<ColorTheme>('blue')

  useEffect(() => {
    setColor(getInitialColor())
  }, [])

  function selectColor(next: ColorTheme) {
    setColor(next)
    applyColorTheme(next)
    window.localStorage.setItem('theme-color', next)
  }

  return (
    <div className="flex flex-wrap gap-3">
      {COLOR_THEMES.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => selectColor(item.key)}
          className="flex flex-col items-center gap-1.5"
          aria-label={item.label}
          title={item.label}
        >
          <span
            className={cn(
              'flex size-8 items-center justify-center rounded-full ring-2 ring-offset-2 ring-offset-background transition-colors',
              color === item.key ? 'ring-foreground' : 'ring-transparent',
            )}
            style={{ backgroundColor: item.swatch }}
          >
            {color === item.key && <Check className="size-4 text-white" />}
          </span>
          <span className="text-xs text-muted-foreground">{item.label}</span>
        </button>
      ))}
    </div>
  )
}
