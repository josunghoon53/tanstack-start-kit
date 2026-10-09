import { useEffect, useRef, useState } from 'react'
import { Check } from 'lucide-react'
import { LayoutGroup, LazyMotion, m } from 'motion/react'
import { cn } from '@/lib/utils'
import {
  loadLayoutFeatures,
  scaleIn,
  spring,
  startThemeTransition,
} from '@/lib/motion'
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

// 기본 + 팔레트 프리셋(THEME_COLORS 전부)을 라디오 그룹으로 보여준다. 방향키로 옮기면 바로 적용된다(라디오 버튼과 같은 동작).
export function ColorThemePicker() {
  const t = useTranslation().colorThemePicker
  const [color, setColor] = useState<ThemeColor | null>(null)
  // 저장값을 읽기 전(SSR·첫 렌더)에는 정적 테두리로 표시하고, 읽은 뒤부터 움직이는 선택 표시를 쓴다.
  // 그래야 페이지를 열자마자 기본 카드 → 저장된 카드로 표시가 미끄러지지 않는다.
  const [ready, setReady] = useState(false)
  const refs = useRef<Array<HTMLButtonElement | null>>([])

  useEffect(() => {
    setColor(parseThemeColor(window.localStorage.getItem(COLOR_STORAGE_KEY)))
    setReady(true)
  }, [])

  function selectColor(next: ThemeColor | null) {
    setColor(next)
    startThemeTransition()
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

  // 선택 테두리는 layoutId를 공유하는 m.span 하나라, 고르면 이전 카드에서 새 카드로 미끄러져 옮겨간다.
  // layoutId에는 레이아웃 기능(domMax)이 필요해서 이 화면에서만 지연 로드한다.
  return (
    <LazyMotion features={loadLayoutFeatures} strict>
      <LayoutGroup id="color-theme-picker">
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
                  'relative flex flex-col gap-2 rounded-lg border bg-card p-2 text-left transition-colors',
                  selected
                    ? !ready && 'border-foreground ring-2 ring-foreground/20'
                    : 'hover:border-foreground/30',
                )}
              >
                {selected && ready && (
                  <m.span
                    layoutId="selection"
                    aria-hidden="true"
                    transition={spring}
                    className="pointer-events-none absolute -inset-px rounded-lg border border-foreground ring-2 ring-foreground/20"
                  />
                )}
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
                    <m.span
                      variants={scaleIn}
                      initial={ready ? 'hidden' : false}
                      animate="visible"
                      className="absolute top-1 left-1 flex size-5 items-center justify-center rounded-full bg-white text-black shadow-sm"
                    >
                      <Check className="size-3.5" strokeWidth={3} />
                    </m.span>
                  )}
                </span>
                <span className="truncate text-xs font-medium">
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </LayoutGroup>
    </LazyMotion>
  )
}
