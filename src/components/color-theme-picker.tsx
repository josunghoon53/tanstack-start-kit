import { useEffect, useRef, useState } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/i18n/use-translation'
import {
  COLOR_STORAGE_KEY,
  PALETTE_PRESETS,
  THEME_COLORS,
  applyThemeColor,
  parseThemeColor,
} from '@/config/theme'
import type { ThemeColor } from '@/config/theme'

// 기본(무채색) 카드의 스와치. src/styles.css 기본값의 사이드바 면 / 활성 메뉴 박스 / 배경과 같은 색이다.
const NEUTRAL_SWATCHES = [
  'oklch(0.21 0.004 90)',
  'oklch(0.985 0.004 90)',
  'oklch(0.935 0.006 90)',
] as const

type Option = {
  key: ThemeColor | null
  label: string
  swatches: readonly [string, string, string]
}

// 기본 + 팔레트 12종을 라디오 그룹으로 보여준다. 방향키로 옮기면 바로 적용된다(라디오 버튼과 같은 동작).
export function ColorThemePicker() {
  const t = useTranslation().colorThemePicker
  const [color, setColor] = useState<ThemeColor | null>(null)
  const refs = useRef<Array<HTMLButtonElement | null>>([])

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

  const options: Array<Option> = [
    { key: null, label: t.neutral, swatches: NEUTRAL_SWATCHES },
    ...THEME_COLORS.map((key) => {
      const preset = PALETTE_PRESETS[key]
      return {
        key,
        label: t.presets[key],
        swatches: [preset.main, preset.accent, preset.soft] as const,
      }
    }),
  ]
  const roleLabels = [t.roles.main, t.roles.accent, t.roles.soft]
  const selectedIndex = Math.max(
    0,
    options.findIndex((item) => item.key === color),
  )

  function handleKeyDown(event: React.KeyboardEvent, index: number) {
    const step =
      event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? 1
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
          ? -1
          : 0
    if (step === 0) {
      return
    }
    event.preventDefault()
    const next = (index + step + options.length) % options.length
    selectColor(options[next].key)
    refs.current[next]?.focus()
  }

  return (
    <div
      role="radiogroup"
      aria-label={t.groupLabel}
      className="grid grid-cols-4 gap-3"
    >
      {options.map((item, index) => {
        const selected = index === selectedIndex
        return (
          <button
            key={item.key ?? 'default'}
            ref={(element) => {
              refs.current[index] = element
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => selectColor(item.key)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={cn(
              'flex flex-col gap-2 rounded-lg border bg-card p-2 text-left transition-colors',
              selected
                ? 'border-foreground ring-2 ring-foreground/20'
                : 'hover:border-foreground/30',
            )}
          >
            <span
              aria-hidden="true"
              className="relative flex h-10 overflow-hidden rounded-md border"
            >
              {item.swatches.map((swatch, swatchIndex) => (
                <span
                  key={swatchIndex}
                  title={roleLabels[swatchIndex]}
                  className={swatchIndex === 0 ? 'w-1/2' : 'w-1/4'}
                  style={{ background: swatch }}
                />
              ))}
              {selected && (
                <span className="absolute top-1 left-1 flex size-5 items-center justify-center rounded-full bg-white text-black shadow-sm">
                  <Check className="size-3.5" strokeWidth={3} />
                </span>
              )}
            </span>
            <span className="truncate text-xs font-medium">{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}
