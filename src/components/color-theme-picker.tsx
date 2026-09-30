import { useEffect, useMemo, useState } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/i18n/use-translation'

type ColorTheme = 'blue' | 'green' | 'purple' | 'rose' | 'orange' | 'slate'

interface ColorThemePickerMessages {
  blue: string
  green: string
  purple: string
  rose: string
  orange: string
  slate: string
}

// 매개변수 타입을 Messages['colorThemePicker']가 아니라 string으로 넓혀서 선언한다 —
// `as const` 딕셔너리의 ko/en 리터럴 유니언 타입은 서로 대입할 수 없어서 그대로 쓰면 에러가 난다.
function getColorThemes(
  t: ColorThemePickerMessages,
): Array<{ key: ColorTheme; label: string; swatch: string }> {
  return [
    { key: 'blue', label: t.blue, swatch: 'oklch(0.55 0.15 260)' },
    { key: 'green', label: t.green, swatch: 'oklch(0.45 0.08 155)' },
    { key: 'purple', label: t.purple, swatch: 'oklch(0.55 0.15 300)' },
    { key: 'rose', label: t.rose, swatch: 'oklch(0.55 0.15 15)' },
    { key: 'orange', label: t.orange, swatch: 'oklch(0.58 0.15 60)' },
    { key: 'slate', label: t.slate, swatch: 'oklch(0.45 0 0)' },
  ]
}

function getInitialColor(
  colorThemes: ReturnType<typeof getColorThemes>,
): ColorTheme {
  if (typeof window === 'undefined') {
    return 'blue'
  }

  const stored = window.localStorage.getItem('theme-color')
  if (colorThemes.some((item) => item.key === stored)) {
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
  const t = useTranslation().colorThemePicker
  const colorThemes = useMemo(() => getColorThemes(t), [t])
  const [color, setColor] = useState<ColorTheme>('blue')

  useEffect(() => {
    setColor(getInitialColor(colorThemes))
  }, [colorThemes])

  function selectColor(next: ColorTheme) {
    setColor(next)
    applyColorTheme(next)
    window.localStorage.setItem('theme-color', next)
  }

  return (
    <div className="flex flex-wrap gap-3">
      {colorThemes.map((item) => (
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
