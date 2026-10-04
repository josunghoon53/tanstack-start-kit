# 스타일 테마 시스템 + 디자인 리프레시 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 킷에 선택형 스타일 테마 4종(Graphite/Warm Paper/Editorial/Nordic)과 색상 각도 기반 프리셋을 넣고, 다크 모드와 배경 이미지를 제거하며, 사이드바·대시보드를 새 디자인으로 바꾼다.

**Architecture:** `<html>`의 `data-style`(스타일)과 `data-color`(색상 각도 덮어쓰기) 속성이 `src/styles.css`의 shadcn 토큰(`--background`, `--primary`, `--sidebar*` …)을 `oklch(L C var(--h))`로 갈아끼운다. 허용 값 목록·저장 키·초기화 스크립트는 `src/config/theme.ts` 한 곳에서 관리하고, CSS와의 어긋남은 테스트로 잡는다. 설정 > 테마 탭에 스타일 피커를 추가하고 기존 색상 피커를 5색+기본으로 바꾼다.

**Tech Stack:** TanStack Start, React 19, Tailwind v4(CSS-first), shadcn/ui, `@fontsource/*`, vitest + Testing Library, pnpm.

**기준 자료:** 설계 `docs/superpowers/specs/2026-10-04-style-themes-design.md`, 시안 `docs/superpowers/specs/assets/style-themes-preview.html` (색 값의 원본).

**작업 디렉터리:** 모든 명령은 `/Users/joseonghun/Documents/MY_PLAYGROUND/tanstack-start-kit`에서 실행한다. (Task 9만 `jsh-os`)

**기존 실패 테스트:** `src/components/table-date-range-filter.test.tsx` 2건은 환경 로케일 문제로 원래 실패한다. 이번 범위가 아니며, 전체 테스트 결과는 "이 2건 외 모두 통과"를 기준으로 본다.

---

## 파일 구조

| 파일 | 역할 | 작업 |
|---|---|---|
| `src/config/theme.ts` | 스타일/색상 목록, 저장 키, 파서, 적용 함수, 초기화 스크립트 | 생성 |
| `src/config/theme.test.ts` | 위 모듈 + CSS 블록 존재 일관성 테스트 | 생성 |
| `src/components/style-theme-picker.tsx` (+test) | 스타일 4종 선택 카드 | 생성 |
| `src/components/color-theme-picker.tsx` (+test) | 기본+5색 선택 | 재작성 |
| `src/components/sparkline.tsx` (+test) | KPI 미니 추세선 | 생성 |
| `src/components/weekly-bars.tsx` (+test) | 주간 막대 | 생성 |
| `src/styles.css` | 토큰, 폰트, 스타일 4종, 프리셋 | 재작성 |
| `src/routes/__root.tsx` | 초기화 스크립트 import, 배경 클래스 교체 | 수정 |
| `src/routes/settings.tsx` (+test) | 테마 탭에 스타일 피커 추가 | 수정 |
| `src/routes/index.tsx` (+test) | 대시보드 KPI 스트립 등 | 수정 |
| `src/i18n/messages.ts` | 스타일/색상/대시보드 문구 | 수정 |
| `src/components/app-sidebar.tsx`, `nav-header.tsx`, `nav-user.tsx`, `language-toggle.tsx`, `tree-connector.tsx`, `site-header.tsx`, `ui/card.tsx` | 사이드바 대비, 제목 굵기 | 수정 |
| `src/components/ThemeToggle.tsx` (+test) | 다크 토글 | 삭제 |
| `public/backgrounds/*.webp` | 배경 이미지 12장 | 삭제 |
| `README.md`, `AGENTS.md`, `docs/screenshots/*` | 문서와 스크린샷 | 수정 |

---

### Task 1: 테마 설정 모듈

**Files:**
- Create: `src/config/theme.ts`
- Test: `src/config/theme.test.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

`src/config/theme.test.ts`:

```ts
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
```

- [ ] **Step 2: 실패 확인**

Run: `pnpm vitest run src/config/theme.test.ts`
Expected: FAIL — `Failed to resolve import "./theme"`

- [ ] **Step 3: 구현**

`src/config/theme.ts`:

```ts
// 스타일 테마(data-style)와 색상 프리셋(data-color)의 단일 출처.
// 허용 값을 늘리면 src/styles.css에도 같은 이름의 블록을 추가해야 한다 —
// 어긋나면 theme.test.ts의 CSS 일관성 테스트가 잡아준다.

export const THEME_STYLES = ['graphite', 'warm', 'editorial', 'nordic'] as const
export type ThemeStyle = (typeof THEME_STYLES)[number]
export const DEFAULT_THEME_STYLE: ThemeStyle = 'graphite'

// 색상 프리셋은 "포인트색"이 아니라 전체 색 조합의 색상 각도(--h)를 옮긴다.
// 값이 없으면(null) 선택한 스타일의 기본 색상을 쓴다.
export const THEME_COLORS = ['blue', 'green', 'purple', 'rose', 'orange'] as const
export type ThemeColor = (typeof THEME_COLORS)[number]

export const STYLE_STORAGE_KEY = 'theme-style'
export const COLOR_STORAGE_KEY = 'theme-color'

export function parseThemeStyle(value: string | null): ThemeStyle {
  return THEME_STYLES.find((style) => style === value) ?? DEFAULT_THEME_STYLE
}

// 예전 버전이 저장해둔 'slate' 같은 값은 알 수 없는 값으로 취급해 기본색으로 돌린다.
export function parseThemeColor(value: string | null): ThemeColor | null {
  return THEME_COLORS.find((color) => color === value) ?? null
}

export function applyThemeStyle(root: HTMLElement, style: ThemeStyle) {
  root.setAttribute('data-style', style)
}

export function applyThemeColor(root: HTMLElement, color: ThemeColor | null) {
  if (color === null) {
    root.removeAttribute('data-color')
  } else {
    root.setAttribute('data-color', color)
  }
}

// <head>에 인라인으로 넣어 첫 페인트 전에 저장된 테마를 복원한다(깜빡임 방지).
// 위 파서와 같은 규칙을 문자열로 다시 쓴 것이므로 둘을 같이 고칠 것.
export const THEME_INIT_SCRIPT = `(function(){try{var d=document.documentElement;var s=localStorage.getItem(${JSON.stringify(STYLE_STORAGE_KEY)});var styles=${JSON.stringify(THEME_STYLES)};d.setAttribute('data-style',styles.indexOf(s)>-1?s:${JSON.stringify(DEFAULT_THEME_STYLE)});var c=localStorage.getItem(${JSON.stringify(COLOR_STORAGE_KEY)});var colors=${JSON.stringify(THEME_COLORS)};if(colors.indexOf(c)>-1){d.setAttribute('data-color',c)}else{d.removeAttribute('data-color')}}catch(e){}})();`
```

- [ ] **Step 4: 통과 확인**

Run: `pnpm vitest run src/config/theme.test.ts`
Expected: PASS (총 14개)

- [ ] **Step 5: 커밋**

```bash
git add src/config/theme.ts src/config/theme.test.ts
git commit -m "feat: 스타일/색상 테마 설정 모듈과 초기화 스크립트 추가"
```

---

### Task 2: i18n 문구 추가

**Files:**
- Modify: `src/i18n/messages.ts` (ko: `settings.theme` ~246행, `dashboard` ~268행, `colorThemePicker` ~297행 / en: ~652, ~674, ~703행)

`messages.ts`는 `as const`라 ko/en 키가 동시에 있어야 타입이 맞는다. 4곳을 각각 수정한다.

- [ ] **Step 1: ko `settings.theme` 교체**

old:
```ts
      theme: {
        heading: '테마',
        accentColorLabel: '강조 색상',
        accentColorDescription:
          '버튼, 링크 등에 사용되는 포인트 컬러를 선택하세요.',
      },
```
new:
```ts
      theme: {
        heading: '테마',
        styleLabel: '스타일',
        styleDescription:
          '폰트, 모서리, 사이드바 등 화면 전체의 분위기를 선택하세요.',
        accentColorLabel: '색상',
        accentColorDescription:
          '선택한 색을 기준으로 배경과 사이드바까지 전체 색 조합이 바뀌어요.',
      },
```

- [ ] **Step 2: en `settings.theme` 교체**

old:
```ts
      theme: {
        heading: 'Theme',
        accentColorLabel: 'Accent color',
        accentColorDescription:
          'Choose the accent color used for buttons, links, and more.',
      },
```
new:
```ts
      theme: {
        heading: 'Theme',
        styleLabel: 'Style',
        styleDescription:
          'Choose the overall look: fonts, corners, sidebar, and more.',
        accentColorLabel: 'Color',
        accentColorDescription:
          'The whole palette, including background and sidebar, shifts to the chosen color.',
      },
```

- [ ] **Step 3: ko/en `colorThemePicker` 교체 + `stylePicker` 추가**

ko old:
```ts
    colorThemePicker: {
      blue: '블루',
      green: '그린',
      purple: '퍼플',
      rose: '로즈',
      orange: '오렌지',
      slate: '무채색',
    },
```
ko new:
```ts
    colorThemePicker: {
      default: '기본',
      blue: '블루',
      green: '그린',
      purple: '퍼플',
      rose: '로즈',
      orange: '오렌지',
    },
    stylePicker: {
      graphite: '쿨 그레이 고딕, 직선적이고 기술적인 느낌',
      warm: '크림 톤에 둥근 폰트와 바탕체 제목',
      editorial: '흑백 명조체, 각진 신문 느낌',
      nordic: '블루 그레이와 부드러운 그림자',
    },
```

en old:
```ts
    colorThemePicker: {
      blue: 'Blue',
      green: 'Green',
      purple: 'Purple',
      rose: 'Rose',
      orange: 'Orange',
      slate: 'Slate',
    },
```
en new:
```ts
    colorThemePicker: {
      default: 'Default',
      blue: 'Blue',
      green: 'Green',
      purple: 'Purple',
      rose: 'Rose',
      orange: 'Orange',
    },
    stylePicker: {
      graphite: 'Cool gray sans-serif, sharp and technical',
      warm: 'Cream tones with rounded body and serif headings',
      editorial: 'Black and white serif, newspaper-like and angular',
      nordic: 'Blue-gray with soft shadows',
    },
```

- [ ] **Step 4: ko/en `dashboard`에 주간 매출 문구 추가**

ko: `recentNotifications: {...},` 바로 뒤(`dashboard` 닫기 전)에 추가
```ts
      weeklyRevenue: {
        title: '주간 매출',
      },
```
en: 같은 위치에
```ts
      weeklyRevenue: {
        title: 'Weekly revenue',
      },
```

- [ ] **Step 5: 타입 확인**

Run: `pnpm exec tsc --noEmit 2>&1 | head -20`
Expected: `src/components/color-theme-picker.tsx`의 `t.slate` 오류만 나온다 (Task 3에서 해결). 그 외 오류가 있으면 키 이름/위치를 다시 확인한다.

- [ ] **Step 6: 커밋**

```bash
git add src/i18n/messages.ts
git commit -m "feat: 스타일/색상 피커와 주간 매출 i18n 문구 추가"
```

---

### Task 3: 색상 피커 재작성 + 스타일 피커

**Files:**
- Rewrite: `src/components/color-theme-picker.tsx`
- Create: `src/components/style-theme-picker.tsx`
- Test: `src/components/color-theme-picker.test.tsx`, `src/components/style-theme-picker.test.tsx`

- [ ] **Step 1: 색상 피커 테스트 작성**

`src/components/color-theme-picker.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ColorThemePicker } from './color-theme-picker'
import { useLocaleStore } from '@/i18n/locale-store'

beforeEach(() => {
  useLocaleStore.setState({ locale: 'ko' })
})

afterEach(() => {
  window.localStorage.clear()
  document.documentElement.removeAttribute('data-color')
})

describe('ColorThemePicker', () => {
  it('renders the default option and 5 colors', () => {
    render(<ColorThemePicker />)

    for (const label of ['기본', '블루', '그린', '퍼플', '로즈', '오렌지']) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument()
    }
  })

  it('marks 기본 as selected when nothing is stored', () => {
    render(<ColorThemePicker />)

    expect(screen.getByRole('button', { name: '기본' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('applies and stores the chosen color', async () => {
    const user = userEvent.setup()
    render(<ColorThemePicker />)

    await user.click(screen.getByRole('button', { name: '그린' }))

    expect(document.documentElement).toHaveAttribute('data-color', 'green')
    expect(window.localStorage.getItem('theme-color')).toBe('green')
    expect(screen.getByRole('button', { name: '그린' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('clears the attribute and storage when 기본 is chosen again', async () => {
    const user = userEvent.setup()
    render(<ColorThemePicker />)

    await user.click(screen.getByRole('button', { name: '로즈' }))
    await user.click(screen.getByRole('button', { name: '기본' }))

    expect(document.documentElement).not.toHaveAttribute('data-color')
    expect(window.localStorage.getItem('theme-color')).toBeNull()
  })

  it('restores a stored color and treats the legacy slate value as 기본', () => {
    window.localStorage.setItem('theme-color', 'purple')
    const { unmount } = render(<ColorThemePicker />)
    expect(screen.getByRole('button', { name: '퍼플' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    unmount()

    window.localStorage.setItem('theme-color', 'slate')
    render(<ColorThemePicker />)
    expect(screen.getByRole('button', { name: '기본' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })
})
```

- [ ] **Step 2: 스타일 피커 테스트 작성**

`src/components/style-theme-picker.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { StyleThemePicker } from './style-theme-picker'
import { useLocaleStore } from '@/i18n/locale-store'

beforeEach(() => {
  useLocaleStore.setState({ locale: 'ko' })
})

afterEach(() => {
  window.localStorage.clear()
  document.documentElement.removeAttribute('data-style')
})

describe('StyleThemePicker', () => {
  it('renders the 4 styles with their descriptions', () => {
    render(<StyleThemePicker />)

    for (const name of ['Graphite', 'Warm Paper', 'Editorial', 'Nordic']) {
      expect(
        screen.getByRole('button', { name: new RegExp(`^${name}`) }),
      ).toBeInTheDocument()
    }
    expect(
      screen.getByText('크림 톤에 둥근 폰트와 바탕체 제목'),
    ).toBeInTheDocument()
  })

  it('marks Graphite as selected when nothing is stored', () => {
    render(<StyleThemePicker />)

    expect(
      screen.getByRole('button', { name: /^Graphite/ }),
    ).toHaveAttribute('aria-pressed', 'true')
  })

  it('applies and stores the chosen style', async () => {
    const user = userEvent.setup()
    render(<StyleThemePicker />)

    await user.click(screen.getByRole('button', { name: /^Warm Paper/ }))

    expect(document.documentElement).toHaveAttribute('data-style', 'warm')
    expect(window.localStorage.getItem('theme-style')).toBe('warm')
    expect(
      screen.getByRole('button', { name: /^Warm Paper/ }),
    ).toHaveAttribute('aria-pressed', 'true')
  })

  it('restores a stored style and falls back to Graphite for invalid values', () => {
    window.localStorage.setItem('theme-style', 'nordic')
    const { unmount } = render(<StyleThemePicker />)
    expect(
      screen.getByRole('button', { name: /^Nordic/ }),
    ).toHaveAttribute('aria-pressed', 'true')
    unmount()

    window.localStorage.setItem('theme-style', 'bogus')
    render(<StyleThemePicker />)
    expect(
      screen.getByRole('button', { name: /^Graphite/ }),
    ).toHaveAttribute('aria-pressed', 'true')
  })
})
```

- [ ] **Step 3: 실패 확인**

Run: `pnpm vitest run src/components/color-theme-picker.test.tsx src/components/style-theme-picker.test.tsx`
Expected: FAIL — 색상 피커는 `aria-pressed`/기본 옵션이 없고, 스타일 피커는 import 실패.

- [ ] **Step 4: 색상 피커 재작성**

`src/components/color-theme-picker.tsx` 전체를 다음으로 교체:

```tsx
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

// 스와치 색은 src/styles.css의 data-color 프리셋 색상 각도(--h)와 같은 값을 쓴다.
const COLOR_HUES: Record<ThemeColor, number> = {
  blue: 255,
  green: 155,
  purple: 300,
  rose: 12,
  orange: 55,
}

const DEFAULT_SWATCH =
  'conic-gradient(oklch(0.54 0.1 285), oklch(0.6 0.1 42), oklch(0.52 0.09 255), oklch(0.54 0.1 285))'

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
    { key: null, label: t.default, swatch: DEFAULT_SWATCH },
    ...THEME_COLORS.map((key) => ({
      key,
      label: t[key],
      swatch: `oklch(0.52 0.1 ${COLOR_HUES[key]})`,
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
```

- [ ] **Step 5: 스타일 피커 구현**

`src/components/style-theme-picker.tsx`:

```tsx
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
const PREVIEWS: Record<ThemeStyle, { side: string; bg: string; accent: string }> =
  {
    graphite: {
      side: 'oklch(0.25 0.014 285)',
      bg: 'oklch(0.972 0.006 285)',
      accent: 'oklch(0.54 0.1 285)',
    },
    warm: {
      side: 'oklch(0.3 0.022 42)',
      bg: 'oklch(0.975 0.012 42)',
      accent: 'oklch(0.6 0.1 42)',
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
```

- [ ] **Step 6: 통과 확인**

Run: `pnpm vitest run src/components/color-theme-picker.test.tsx src/components/style-theme-picker.test.tsx`
Expected: PASS (5 + 4개)

- [ ] **Step 7: 커밋**

```bash
git add src/components/color-theme-picker.tsx src/components/color-theme-picker.test.tsx src/components/style-theme-picker.tsx src/components/style-theme-picker.test.tsx
git commit -m "feat: 색상 피커를 기본+5색으로 재작성하고 스타일 피커 추가"
```

---

### Task 4: 설정 > 테마 탭 연결

**Files:**
- Modify: `src/routes/settings.tsx` (import ~9행, `ThemeSection` ~222-240행)
- Modify: `src/routes/settings.test.tsx:58-69`

- [ ] **Step 1: 설정 테스트를 새 기대값으로 교체 (실패하게 만들기)**

`src/routes/settings.test.tsx`의 `it('renders the ColorThemePicker with 6 swatches under the 테마 tab', ...)` 블록 전체를 교체:

```tsx
  it('renders the style and color pickers under the 테마 tab', async () => {
    const user = userEvent.setup()
    render(<Settings />)

    await user.click(screen.getByRole('button', { name: '테마' }))

    for (const name of ['Graphite', 'Warm Paper', 'Editorial', 'Nordic']) {
      expect(
        screen.getByRole('button', { name: new RegExp(`^${name}`) }),
      ).toBeInTheDocument()
    }
    for (const label of ['기본', '블루', '그린', '퍼플', '로즈', '오렌지']) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument()
    }
  })
```

- [ ] **Step 2: 실패 확인**

Run: `pnpm vitest run src/routes/settings.test.tsx`
Expected: FAIL — 스타일 피커 버튼을 찾을 수 없음

- [ ] **Step 3: `settings.tsx` 수정**

import 추가(`ColorThemePicker` import 다음 줄):
```tsx
import { StyleThemePicker } from '@/components/style-theme-picker'
```

`ThemeSection` 전체 교체:
```tsx
function ThemeSection() {
  const t = useTranslation().settings

  return (
    <div className="flex flex-col">
      <h2 className="pb-2 text-lg font-bold">{t.theme.heading}</h2>
      <div className="flex flex-col gap-6 rounded-xl bg-muted/50 px-4 py-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-0.5">
            <Label>{t.theme.styleLabel}</Label>
            <span className="text-sm text-muted-foreground">
              {t.theme.styleDescription}
            </span>
          </div>
          <StyleThemePicker />
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-0.5">
            <Label>{t.theme.accentColorLabel}</Label>
            <span className="text-sm text-muted-foreground">
              {t.theme.accentColorDescription}
            </span>
          </div>
          <ColorThemePicker />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: 통과 확인**

Run: `pnpm vitest run src/routes/settings.test.tsx`
Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add src/routes/settings.tsx src/routes/settings.test.tsx
git commit -m "feat: 설정 테마 탭에 스타일 선택 추가"
```

---

### Task 5: 루트 초기화 스크립트 교체

**Files:**
- Modify: `src/routes/__root.tsx` (import 영역, 23행 `THEME_INIT_SCRIPT`, 93행 `bg-grid-fade`)

- [ ] **Step 1: import 추가 + 인라인 상수 삭제**

`import { notificationsQueryOptions } from '../server/notifications'` 다음 줄에 추가:
```tsx
import { THEME_INIT_SCRIPT } from '../config/theme'
```
`const THEME_INIT_SCRIPT = \`(function(){...\`` 한 줄(23행)을 통째로 삭제한다.

- [ ] **Step 2: 배경 클래스 교체**

old: `<div className="bg-grid-fade flex min-h-0 flex-1 flex-col overflow-auto">`
new: `<div className="flex min-h-0 flex-1 flex-col overflow-auto bg-background">`

- [ ] **Step 3: 타입/테스트 확인**

Run: `pnpm exec tsc --noEmit 2>&1 | head; pnpm vitest run src/routes 2>&1 | tail -8`
Expected: 타입 오류 없음, routes 테스트 통과(날짜 필터 2건은 `src/components`라 여기 없음)

- [ ] **Step 4: 커밋**

```bash
git add src/routes/__root.tsx
git commit -m "refactor: 루트의 테마 초기화 스크립트를 config로 이동하고 배경 이미지 클래스 제거"
```

---

### Task 6: 폰트 설치 + 스타일 CSS 재작성

**Files:**
- Modify: `package.json`, `pnpm-lock.yaml` (의존성)
- Rewrite: `src/styles.css`
- Delete: `public/backgrounds/`
- Test: `src/config/theme.test.ts` (CSS 일관성 테스트 추가)

- [ ] **Step 1: CSS 일관성 테스트 추가 (실패하게)**

`src/config/theme.test.ts` 맨 위 import에 추가:
```ts
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
```
파일 끝에 추가:
```ts
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
```

Run: `pnpm vitest run src/config/theme.test.ts`
Expected: FAIL (새 블록 없음, `.dark` 존재)

- [ ] **Step 2: 폰트 패키지 설치**

```bash
pnpm add @fontsource/ibm-plex-sans-kr @fontsource/gowun-dodum @fontsource/gowun-batang @fontsource/nanum-myeongjo @fontsource/noto-sans-kr
for f in ibm-plex-sans-kr gowun-dodum gowun-batang nanum-myeongjo noto-sans-kr; do echo "== $f"; ls node_modules/@fontsource/$f/ | grep -E '^(400|500|600|700|800)\.css$' | tr '\n' ' '; echo; done
```
Expected 존재 확인: ibm-plex-sans-kr 400/500/600/700, gowun-dodum 400, gowun-batang 400/700, nanum-myeongjo 400/700/800, noto-sans-kr 400/500/600/700. 없는 굵기가 있으면 Step 3의 해당 `@import` 줄을 가장 가까운 존재하는 굵기로 바꾼다.

- [ ] **Step 3: `src/styles.css` 상단 교체**

파일 맨 앞 1~10행(`@import url(...pretendard...)` ~ `@theme { --font-sans ... }`)을 다음으로 교체:

```css
@import 'tailwindcss';
@import 'tw-animate-css';
@import 'shadcn/tailwind.css';

/* 스타일 테마별 폰트. 한글 폰트는 unicode-range로 쪼개져 있어 쓰는 글자 조각만 내려받는다. */
@import '@fontsource/ibm-plex-sans-kr/400.css';
@import '@fontsource/ibm-plex-sans-kr/500.css';
@import '@fontsource/ibm-plex-sans-kr/600.css';
@import '@fontsource/ibm-plex-sans-kr/700.css';
@import '@fontsource/gowun-dodum/400.css';
@import '@fontsource/gowun-batang/400.css';
@import '@fontsource/gowun-batang/700.css';
@import '@fontsource/nanum-myeongjo/400.css';
@import '@fontsource/nanum-myeongjo/700.css';
@import '@fontsource/nanum-myeongjo/800.css';
@import '@fontsource/noto-sans-kr/400.css';
@import '@fontsource/noto-sans-kr/500.css';
@import '@fontsource/noto-sans-kr/600.css';
@import '@fontsource/noto-sans-kr/700.css';
```

그리고 `body { margin: 0; font-family: var(--font-sans); }` 규칙은 그대로 둔다.

- [ ] **Step 4: `@theme inline` 블록 보강**

`@theme inline {` 안, `--radius-4xl: ...` 줄 바로 앞에 추가:
```css
  --font-sans: var(--font-body);
  --color-success: var(--success);
  --color-warning: var(--warning);
```

- [ ] **Step 5: 옛 테마 블록 삭제**

`src/styles.css`에서 다음을 전부 지운다 (위치는 `grep -n` 으로 확인):
1. 최상단 `@custom-variant dark (&:is(.dark *));`
2. `:root { --radius: 0.625rem; ... --sidebar-ring: ... }` 기본 팔레트 블록 하나
3. `/* 테마 색상 프리셋 ... */` 주석부터 `:root[data-color='slate'] {...}` 까지
4. `.dark { ... }` 블록과 `.dark[data-color='...'] { ... }` 5개
5. `/* 콘텐츠 배경: ... */` 주석부터 `.dark[data-color='slate'] .bg-grid-fade { ... }` 까지(이미지 오버라이드 포함 전부)

남겨야 할 것: 스크롤바 규칙, `collapsible-*` keyframes/규칙, `@theme inline` 블록, 맨 아래 `@layer base { ... }`.

- [ ] **Step 6: 새 스타일 블록 추가**

`@theme inline { ... }` 블록 바로 뒤에 아래를 붙인다. 색 값의 원본은 `docs/superpowers/specs/assets/style-themes-preview.html`이다.

```css
/* ────────────────────────────────────────────────────────────────────────────
   스타일 테마. <html data-style="..."> 로 선택하고, 기본은 graphite(속성 없을 때도 적용).
   색은 oklch(L C var(--h)) — 색상 각도(--h)만 바꾸면 배경·카드·테두리·사이드바·포인트가
   한 계열로 같이 이동한다. 아래 data-color 프리셋이 그 각도를 덮어쓴다.
   모든 스타일은 사이드바를 메인과 대비되는 어두운 색으로 두고, 활성 메뉴는 포인트색으로 채운다.
   ──────────────────────────────────────────────────────────────────────────── */
:root,
:root[data-style='graphite'] {
  --h: 285;
  --radius: 0.5rem;
  --font-body: 'IBM Plex Sans KR', ui-sans-serif, system-ui, sans-serif;
  --font-title: var(--font-body);
  --weight-body: 400;
  --weight-title: 600;
  --shadow-card: 0 1px 2px oklch(0.3 0.03 var(--h) / 0.06);
  --background: oklch(0.972 0.006 var(--h));
  --foreground: oklch(0.22 0.02 var(--h));
  --card: oklch(1 0.002 var(--h));
  --card-foreground: var(--foreground);
  --popover: var(--card);
  --popover-foreground: var(--foreground);
  --primary: oklch(0.54 0.1 var(--h));
  --primary-foreground: oklch(1 0 0);
  --secondary: oklch(0.945 0.02 var(--h));
  --secondary-foreground: var(--foreground);
  --muted: var(--secondary);
  --muted-foreground: oklch(0.5 0.025 var(--h));
  --accent: var(--secondary);
  --accent-foreground: var(--foreground);
  --destructive: oklch(0.6 0.12 25);
  --success: oklch(0.62 0.09 160);
  --warning: oklch(0.74 0.095 80);
  --border: oklch(0.925 0.01 var(--h));
  --input: oklch(0.88 0.014 var(--h));
  --ring: var(--primary);
  --chart-1: oklch(0.8 0.04 var(--h));
  --chart-2: oklch(0.65 0.08 var(--h));
  --chart-3: oklch(0.5 0.1 var(--h));
  --chart-4: oklch(0.4 0.09 var(--h));
  --chart-5: oklch(0.3 0.06 var(--h));
  --sidebar: oklch(0.25 0.014 var(--h));
  --sidebar-foreground: oklch(0.82 0.014 var(--h));
  --sidebar-primary: oklch(0.5 0.1 var(--h));
  --sidebar-primary-foreground: oklch(1 0 0);
  --sidebar-accent: oklch(0.31 0.016 var(--h));
  --sidebar-accent-foreground: oklch(0.96 0.006 var(--h));
  --sidebar-border: oklch(0.31 0.016 var(--h));
  --sidebar-ring: oklch(0.78 0.07 var(--h));
}

:root[data-style='warm'] {
  --h: 42;
  --radius: 0.875rem;
  --font-body: 'Gowun Dodum', ui-sans-serif, system-ui, sans-serif;
  --font-title: 'Gowun Batang', serif;
  --weight-body: 400;
  --weight-title: 700;
  --shadow-card: 0 8px 24px -16px oklch(0.4 0.08 var(--h) / 0.35);
  --background: oklch(0.975 0.012 var(--h));
  --foreground: oklch(0.26 0.025 var(--h));
  --card: oklch(0.992 0.006 var(--h));
  --card-foreground: var(--foreground);
  --popover: var(--card);
  --popover-foreground: var(--foreground);
  --primary: oklch(0.6 0.1 var(--h));
  --primary-foreground: oklch(1 0 0);
  --secondary: oklch(0.94 0.02 var(--h));
  --secondary-foreground: var(--foreground);
  --muted: var(--secondary);
  --muted-foreground: oklch(0.52 0.035 var(--h));
  --accent: var(--secondary);
  --accent-foreground: var(--foreground);
  --destructive: oklch(0.6 0.12 25);
  --success: oklch(0.62 0.09 160);
  --warning: oklch(0.74 0.095 80);
  --border: oklch(0.91 0.02 var(--h));
  --input: oklch(0.87 0.026 var(--h));
  --ring: var(--primary);
  --chart-1: oklch(0.8 0.05 var(--h));
  --chart-2: oklch(0.68 0.09 var(--h));
  --chart-3: oklch(0.56 0.1 var(--h));
  --chart-4: oklch(0.45 0.09 var(--h));
  --chart-5: oklch(0.34 0.06 var(--h));
  --sidebar: oklch(0.3 0.022 var(--h));
  --sidebar-foreground: oklch(0.86 0.022 var(--h));
  --sidebar-primary: oklch(0.57 0.1 var(--h));
  --sidebar-primary-foreground: oklch(1 0 0);
  --sidebar-accent: oklch(0.37 0.024 var(--h));
  --sidebar-accent-foreground: oklch(0.96 0.012 var(--h));
  --sidebar-border: oklch(0.37 0.024 var(--h));
  --sidebar-ring: oklch(0.76 0.08 var(--h));
}

/* Editorial은 기본이 무채색(--nk: 0). 색상 프리셋을 고르면 아래에서 --nk/--ak를 켜서 색을 입힌다.
   --radius를 음수로 둔 건 rounded-xl(= radius + 4px)이 0이 되도록 하기 위해서다. */
:root[data-style='editorial'] {
  --h: 0;
  --nk: 0;
  --ak: 0;
  --radius: -0.25rem;
  --font-body: 'Nanum Myeongjo', serif;
  --font-title: 'Nanum Myeongjo', serif;
  --weight-body: 400;
  --weight-title: 800;
  --shadow-card: none;
  --background: oklch(1 calc(0.012 * var(--nk)) var(--h));
  --foreground: oklch(0.2 calc(0.02 * var(--nk)) var(--h));
  --card: oklch(1 calc(0.008 * var(--nk)) var(--h));
  --card-foreground: var(--foreground);
  --popover: var(--card);
  --popover-foreground: var(--foreground);
  --primary: oklch(calc(0.2 + 0.35 * var(--nk)) var(--ak) var(--h));
  --primary-foreground: oklch(1 0 0);
  --secondary: oklch(0.95 calc(0.02 * var(--nk)) var(--h));
  --secondary-foreground: var(--foreground);
  --muted: var(--secondary);
  --muted-foreground: oklch(0.46 calc(0.03 * var(--nk)) var(--h));
  --accent: var(--secondary);
  --accent-foreground: var(--foreground);
  --destructive: oklch(0.6 0.12 25);
  --success: oklch(0.62 0.09 160);
  --warning: oklch(0.74 0.095 80);
  --border: oklch(0.91 calc(0.014 * var(--nk)) var(--h));
  --input: oklch(0.2 calc(0.03 * var(--nk)) var(--h));
  --ring: var(--primary);
  --chart-1: oklch(0.85 calc(0.5 * var(--ak)) var(--h));
  --chart-2: oklch(0.68 calc(0.8 * var(--ak)) var(--h));
  --chart-3: oklch(0.5 var(--ak) var(--h));
  --chart-4: oklch(0.38 var(--ak) var(--h));
  --chart-5: oklch(0.28 calc(0.6 * var(--ak)) var(--h));
  --sidebar: oklch(0.19 calc(0.03 * var(--nk)) var(--h));
  --sidebar-foreground: oklch(0.88 calc(0.015 * var(--nk)) var(--h));
  --sidebar-primary: oklch(calc(1 - 0.45 * var(--nk)) var(--ak) var(--h));
  --sidebar-primary-foreground: oklch(calc(0.15 + 0.85 * var(--nk)) 0 0);
  --sidebar-accent: oklch(0.3 calc(0.035 * var(--nk)) var(--h));
  --sidebar-accent-foreground: oklch(1 0 0);
  --sidebar-border: oklch(0.3 calc(0.035 * var(--nk)) var(--h));
  --sidebar-ring: oklch(calc(1 - 0.25 * var(--nk)) calc(0.7 * var(--ak)) var(--h));
}

:root[data-style='nordic'] {
  --h: 255;
  --radius: 0.625rem;
  --font-body: 'Noto Sans KR', ui-sans-serif, system-ui, sans-serif;
  --font-title: var(--font-body);
  --weight-body: 400;
  --weight-title: 600;
  --shadow-card: 0 10px 30px -18px oklch(0.4 0.1 var(--h) / 0.4);
  --background: oklch(0.965 0.012 var(--h));
  --foreground: oklch(0.27 0.03 var(--h));
  --card: oklch(1 0.003 var(--h));
  --card-foreground: var(--foreground);
  --popover: var(--card);
  --popover-foreground: var(--foreground);
  --primary: oklch(0.52 0.09 var(--h));
  --primary-foreground: oklch(1 0 0);
  --secondary: oklch(0.94 0.02 var(--h));
  --secondary-foreground: var(--foreground);
  --muted: var(--secondary);
  --muted-foreground: oklch(0.52 0.035 var(--h));
  --accent: var(--secondary);
  --accent-foreground: var(--foreground);
  --destructive: oklch(0.6 0.12 25);
  --success: oklch(0.62 0.09 160);
  --warning: oklch(0.74 0.095 80);
  --border: oklch(0.92 0.015 var(--h));
  --input: oklch(0.88 0.02 var(--h));
  --ring: var(--primary);
  --chart-1: oklch(0.82 0.04 var(--h));
  --chart-2: oklch(0.68 0.07 var(--h));
  --chart-3: oklch(0.52 0.09 var(--h));
  --chart-4: oklch(0.4 0.08 var(--h));
  --chart-5: oklch(0.3 0.05 var(--h));
  --sidebar: oklch(0.3 0.032 var(--h));
  --sidebar-foreground: oklch(0.85 0.02 var(--h));
  --sidebar-primary: oklch(0.5 0.09 var(--h));
  --sidebar-primary-foreground: oklch(1 0 0);
  --sidebar-accent: oklch(0.37 0.032 var(--h));
  --sidebar-accent-foreground: oklch(0.96 0.008 var(--h));
  --sidebar-border: oklch(0.37 0.032 var(--h));
  --sidebar-ring: oklch(0.76 0.07 var(--h));
}

/* 색상 프리셋: 색상 각도만 덮어쓴다. 위 스타일 블록과 특이도가 같으므로 반드시 그 뒤에 둘 것. */
:root[data-color='blue'] {
  --h: 255;
}
:root[data-color='green'] {
  --h: 155;
}
:root[data-color='purple'] {
  --h: 300;
}
:root[data-color='rose'] {
  --h: 12;
}
:root[data-color='orange'] {
  --h: 55;
}
:root[data-style='editorial'][data-color] {
  --nk: 1;
  --ak: 0.1;
}
```

- [ ] **Step 7: 하단 `@layer base` 교체**

old:
```css
@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```
new:
```css
@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
    font-size: 0.875rem;
    font-weight: var(--weight-body);
  }
  /* :where로 특이도를 0으로 둬서, 컴포넌트가 font-* 유틸리티를 직접 주면 그쪽이 이긴다. */
  :where(h1, h2, h3, [data-slot='card-title']) {
    font-family: var(--font-title);
    font-weight: var(--weight-title);
  }
  td,
  th {
    font-variant-numeric: tabular-nums;
  }
}
```

- [ ] **Step 8: 배경 이미지 삭제**

```bash
git rm -r -q public/backgrounds
ls public
```
Expected: `public` 안에 다른 파일이 있으면 그대로 두고, `backgrounds`만 사라졌는지 확인.

- [ ] **Step 9: 테스트 + 빌드 확인**

Run: `pnpm vitest run src/config/theme.test.ts && pnpm build 2>&1 | tail -6`
Expected: theme 테스트 전부 PASS, `✓ built in`. (폰트 `@import` 경로가 틀리면 여기서 빌드가 실패한다 → Step 2의 굵기 목록과 대조해 수정)

- [ ] **Step 10: 커밋**

```bash
git add package.json pnpm-lock.yaml src/styles.css src/config/theme.test.ts
git commit -m "feat: 스타일 테마 4종과 색상 각도 프리셋 적용, 배경 이미지와 다크 팔레트 제거"
```

---

### Task 7: 다크 모드 제거

**Files:**
- Delete: `src/components/ThemeToggle.tsx`, `src/components/ThemeToggle.test.tsx`
- Modify: `src/components/app-sidebar.tsx`, `src/components/app-sidebar.test.tsx:122-130`, `src/test/setup.ts`
- Modify (strip `dark:` 유틸리티): `src/components/**/*.tsx`

- [ ] **Step 1: ThemeToggle 삭제와 사용처 정리**

```bash
git rm -q src/components/ThemeToggle.tsx src/components/ThemeToggle.test.tsx
```
`src/components/app-sidebar.tsx`에서:
- `import ThemeToggle from '@/components/ThemeToggle'` 줄 삭제
- `<ThemeToggle />` 줄 삭제 (`<LanguageToggle />` 바로 아래)

- [ ] **Step 2: 사이드바 테스트 수정**

`src/components/app-sidebar.test.tsx`의 마지막 `it(...)` 교체:
```tsx
  it('renders the footer with NavUser and the language toggle', async () => {
    renderSidebar('/')

    expect(await screen.findByText('관리자')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /english/i })).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /theme mode/i }),
    ).not.toBeInTheDocument()
  })
```

- [ ] **Step 3: 테스트 setup의 matchMedia 목 제거**

`rg`로 남은 사용처를 확인한다: `grep -rn matchMedia src | grep -v test/setup` → 결과가 없어야 한다.
없으면 `src/test/setup.ts`에서 `// jsdom에는 matchMedia가 없다 ...` 주석부터 `window.matchMedia = vi.fn()...}))` 블록 끝까지 삭제하고, 더 이상 쓰지 않는 `vi` import도 정리한다(`import { afterEach } from 'vitest'`). 결과가 있으면 이 단계는 건너뛰고 주석의 "ThemeToggle, __root.tsx의 다크모드 감지가" 부분만 실제 사용처로 고친다.

- [ ] **Step 4: `dark:` 유틸리티 일괄 제거**

`@custom-variant dark`를 지웠으므로 `dark:` 클래스는 OS 다크 설정(`prefers-color-scheme`)에 반응하는 기본 동작으로 바뀐다. 의도치 않게 켜지지 않게 전부 제거한다.

```bash
grep -rlE " dark:" src | xargs sed -i '' -E "s/ dark:[^ \"'\`]+//g"
grep -rn "dark:" src || echo "남은 dark: 없음"
```
Expected: `남은 dark: 없음`. 남아 있으면(문자열 맨 앞에 붙은 경우 등) 직접 지운다.

- [ ] **Step 5: 확인**

Run: `pnpm exec tsc --noEmit 2>&1 | head; pnpm vitest run 2>&1 | tail -8`
Expected: 타입 오류 없음. 테스트는 `table-date-range-filter` 2건 외 전부 PASS.

- [ ] **Step 6: 커밋**

```bash
git add -A src
git commit -m "refactor: 다크 모드 제거 (ThemeToggle, dark: 유틸리티, matchMedia 목)"
```

---

### Task 8: 사이드바 대비와 제목 굵기 정리

사이드바가 어두운 배경이 되므로 메인용 `text-muted-foreground`/`border` 등을 사이드바 전용 토큰으로 바꾼다.

**Files:**
- Modify: `src/components/nav-header.tsx`, `nav-user.tsx`, `language-toggle.tsx`, `tree-connector.tsx`, `app-sidebar.tsx`, `site-header.tsx`, `ui/card.tsx`

- [ ] **Step 1: nav-header**

`src/components/nav-header.tsx`:
- `<span className="truncate font-semibold">{t.navHeader.brand}</span>` → `<span className="truncate font-semibold text-sidebar-accent-foreground">{t.navHeader.brand}</span>`
- `<span className="truncate text-xs text-muted-foreground">` → `<span className="truncate text-xs text-sidebar-foreground/70">`

- [ ] **Step 2: nav-user (트리거 부분만)**

`src/components/nav-user.tsx` 62행 근처(트리거 안, 드롭다운 라벨 79행은 건드리지 않는다):
- `<span className="truncate text-xs text-muted-foreground">{USER.email}</span>` 중 **첫 번째** → `text-sidebar-foreground/70`
- 트리거의 `<Avatar className="size-8 rounded-lg"><AvatarFallback className="rounded-lg">` → `AvatarFallback`에 `bg-sidebar-accent text-sidebar-accent-foreground` 추가: `className="rounded-lg bg-sidebar-accent text-sidebar-accent-foreground"`
- 트리거의 이름 `<span className="truncate font-medium">{USER.name}</span>` 중 **첫 번째** → `className="truncate font-medium text-sidebar-accent-foreground"`

- [ ] **Step 3: language-toggle에 className 받기**

`src/components/language-toggle.tsx` 전체 교체:
```tsx
import { Button } from '@/components/ui/button'
import { useLocaleStore } from '@/i18n/locale-store'
import { cn } from '@/lib/utils'
import type { Locale } from '@/i18n/messages'

// 언어 이름(한국어/English)은 각 언어 표기 그대로 보여주는 고유명사라 번역 딕셔너리에
// 넣지 않는다 — 언어 선택 UI에서는 보통 각 언어를 그 언어 자체로 표기한다.
const LOCALE_LABELS: Record<Locale, string> = {
  ko: '한국어',
  en: 'English',
}

const NEXT_LOCALE: Record<Locale, Locale> = {
  ko: 'en',
  en: 'ko',
}

export function LanguageToggle({ className }: { className?: string }) {
  const locale = useLocaleStore((state) => state.locale)
  const setLocale = useLocaleStore((state) => state.setLocale)
  const nextLocale = NEXT_LOCALE[locale]

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn(className)}
      onClick={() => setLocale(nextLocale)}
      aria-label={`Switch language to ${LOCALE_LABELS[nextLocale]}`}
      title={`Switch language to ${LOCALE_LABELS[nextLocale]}`}
    >
      {LOCALE_LABELS[locale]}
    </Button>
  )
}
```

- [ ] **Step 4: app-sidebar 클래스 교체**

`src/components/app-sidebar.tsx`:
- `<SidebarHeader className="h-14 justify-center border-b py-0">` → `<SidebarHeader className="h-14 justify-center border-b border-sidebar-border py-0">`
- 섹션 라벨 `<div className="pb-1.5 pl-6 text-xs font-medium text-muted-foreground">` → `text-sidebar-foreground/60`
- `<LanguageToggle />` → 
```tsx
            <LanguageToggle className="border-sidebar-border bg-transparent text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" />
```

- [ ] **Step 5: tree-connector**

`src/components/tree-connector.tsx` 21행: `text-muted-foreground/50` → `text-sidebar-foreground/30`

- [ ] **Step 6: site-header 제목 굵기 / card 정리**

`src/components/site-header.tsx`: `<h1 className="text-lg font-bold">{title}</h1>` → `<h1 className="text-xl">{title}</h1>` (굵기는 `--weight-title`이 준다)

`src/components/ui/card.tsx`:
- `Card` className: `"flex flex-col gap-6 rounded-xl border border-border/60 bg-card py-6 text-card-foreground shadow-sm shadow-black/5"` → `"flex flex-col gap-6 rounded-xl border border-border bg-card py-6 text-card-foreground shadow-[var(--shadow-card)]"` (Task 7에서 `dark:` 부분은 이미 제거된 상태)
- `CardTitle` className: `"text-lg leading-none font-bold"` → `"text-base leading-none"`

- [ ] **Step 7: 테스트**

Run: `pnpm vitest run 2>&1 | tail -8`
Expected: `table-date-range-filter` 2건 외 PASS. (`nav-header.test`의 브랜드 'Admin' 단언은 그대로 통과해야 한다)

- [ ] **Step 8: 커밋**

```bash
git add -A src
git commit -m "style: 어두운 사이드바에 맞춰 사이드바 요소 색과 제목 굵기 정리"
```

---

### Task 9: Sparkline / WeeklyBars 컴포넌트

**Files:**
- Create: `src/components/sparkline.tsx`, `src/components/sparkline.test.tsx`
- Create: `src/components/weekly-bars.tsx`, `src/components/weekly-bars.test.tsx`

- [ ] **Step 1: 테스트 작성**

`src/components/sparkline.test.tsx`:
```tsx
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Sparkline } from './sparkline'

describe('Sparkline', () => {
  it('draws one polyline point per value', () => {
    const { container } = render(
      <Sparkline values={[1, 3, 2, 5]} tone="positive" />,
    )

    const points = container
      .querySelector('polyline')
      ?.getAttribute('points')
      ?.split(' ')
    expect(points).toHaveLength(4)
  })

  it('uses the success color for positive and destructive for negative', () => {
    const { container, rerender } = render(
      <Sparkline values={[1, 2]} tone="positive" />,
    )
    expect(container.querySelector('polyline')).toHaveClass('stroke-success')

    rerender(<Sparkline values={[1, 2]} tone="negative" />)
    expect(container.querySelector('polyline')).toHaveClass('stroke-destructive')
  })

  it('does not produce NaN for flat or single-value series', () => {
    const flat = render(<Sparkline values={[4, 4, 4]} tone="positive" />)
    expect(flat.container.innerHTML).not.toContain('NaN')

    const single = render(<Sparkline values={[7]} tone="positive" />)
    expect(single.container.innerHTML).not.toContain('NaN')
  })

  it('renders nothing for an empty series and is hidden from assistive tech', () => {
    const empty = render(<Sparkline values={[]} tone="positive" />)
    expect(empty.container).toBeEmptyDOMElement()

    const filled = render(<Sparkline values={[1, 2]} tone="positive" />)
    expect(filled.container.querySelector('svg')).toHaveAttribute(
      'aria-hidden',
      'true',
    )
  })
})
```

`src/components/weekly-bars.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { WeeklyBars } from './weekly-bars'

describe('WeeklyBars', () => {
  it('renders one bar per value, scaled to the maximum', () => {
    const { container } = render(
      <WeeklyBars values={[50, 100, 25]} label="주간 매출" />,
    )

    const bars = container.querySelectorAll<HTMLElement>('[data-bar]')
    expect(bars).toHaveLength(3)
    expect(bars[0].style.height).toBe('50%')
    expect(bars[1].style.height).toBe('100%')
    expect(bars[2].style.height).toBe('25%')
  })

  it('highlights only the last bar with the primary color', () => {
    const { container } = render(
      <WeeklyBars values={[10, 20, 30]} label="주간 매출" />,
    )

    const bars = container.querySelectorAll('[data-bar]')
    expect(bars[0]).not.toHaveClass('bg-primary')
    expect(bars[2]).toHaveClass('bg-primary')
  })

  it('exposes the chart as an image with the given label', () => {
    render(<WeeklyBars values={[1, 2]} label="주간 매출" />)

    expect(screen.getByRole('img', { name: '주간 매출' })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 실패 확인**

Run: `pnpm vitest run src/components/sparkline.test.tsx src/components/weekly-bars.test.tsx`
Expected: FAIL — import 실패

- [ ] **Step 3: 구현**

`src/components/sparkline.tsx`:
```tsx
import { cn } from '@/lib/utils'

const WIDTH = 72
const HEIGHT = 22

interface SparklineProps {
  values: Array<number>
  tone: 'positive' | 'negative'
  className?: string
}

// KPI 카드 옆의 장식용 미니 추세선. 값이 클수록 위로 그린다. 스크린리더에는 숨긴다.
export function Sparkline({ values, tone, className }: SparklineProps) {
  if (values.length === 0) {
    return null
  }

  const min = Math.min(...values)
  const range = Math.max(...values) - min || 1
  const step = values.length > 1 ? WIDTH / (values.length - 1) : 0
  const points = values
    .map((value, index) => {
      const x = (index * step).toFixed(1)
      const y = (HEIGHT - ((value - min) / range) * (HEIGHT - 2) - 1).toFixed(1)
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className={cn('h-[22px] w-[72px] shrink-0', className)}
    >
      <polyline
        points={points}
        fill="none"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={tone === 'positive' ? 'stroke-success' : 'stroke-destructive'}
      />
    </svg>
  )
}
```

`src/components/weekly-bars.tsx`:
```tsx
import { cn } from '@/lib/utils'

interface WeeklyBarsProps {
  values: Array<number>
  label: string
}

// 가장 큰 값을 100%로 맞춘 단순 막대. 마지막(가장 최근) 막대만 포인트색으로 강조한다.
export function WeeklyBars({ values, label }: WeeklyBarsProps) {
  const max = Math.max(...values, 1)

  return (
    <div role="img" aria-label={label} className="flex h-24 items-end gap-1.5">
      {values.map((value, index) => (
        <div
          key={index}
          data-bar
          className={cn(
            'flex-1 rounded-t-sm',
            index === values.length - 1 ? 'bg-primary' : 'bg-muted',
          )}
          style={{ height: `${(value / max) * 100}%` }}
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 4: 통과 확인**

Run: `pnpm vitest run src/components/sparkline.test.tsx src/components/weekly-bars.test.tsx`
Expected: PASS (4 + 3)

- [ ] **Step 5: 커밋**

```bash
git add src/components/sparkline.tsx src/components/sparkline.test.tsx src/components/weekly-bars.tsx src/components/weekly-bars.test.tsx
git commit -m "feat: KPI 스파크라인과 주간 막대 컴포넌트 추가"
```

---

### Task 10: 대시보드 리디자인

**Files:**
- Modify: `src/routes/index.tsx`
- Modify: `src/routes/index.test.tsx` (테스트 1개 추가)

- [ ] **Step 1: 테스트 추가 (실패하게)**

`src/routes/index.test.tsx`의 `describe` 안 마지막에 추가:
```tsx
  it('renders the weekly revenue chart', async () => {
    renderWithRouter(<Dashboard />, { extraPaths: ['/orders'] })

    await screen.findByText('ORD-4001')

    expect(
      screen.getByRole('img', { name: t.dashboard.weeklyRevenue.title }),
    ).toBeInTheDocument()
  })
```

Run: `pnpm vitest run src/routes/index.test.tsx`
Expected: FAIL (주간 매출 차트 없음), 기존 4개는 PASS

- [ ] **Step 2: `src/routes/index.tsx` 교체**

전체를 다음으로 교체:
```tsx
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Sparkline } from '@/components/sparkline'
import { StatusDot } from '@/components/status-dot'
import { WeeklyBars } from '@/components/weekly-bars'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ORDER_STATUS_TONE } from '@/config/orders'
import { NOTIFICATION_ICONS } from '@/config/notifications'
import { ordersQueryOptions } from '@/server/orders'
import { notificationsQueryOptions } from '@/server/notifications'
import { useTranslation } from '@/i18n/use-translation'

export const Route = createFileRoute('/')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(ordersQueryOptions()),
  component: Dashboard,
})

// 아래 추이/주간 수치는 킷의 데모 데이터다. 실제 지표를 붙일 때 서버 함수에서 받아 교체할 것.
const REVENUE_TREND = [2, 5, 4, 8, 6, 12, 10, 16]
const ORDERS_TREND = [4, 2, 9, 6, 11, 8, 14, 12]
const USERS_TREND = [16, 14, 15, 10, 11, 6, 8, 3]
const WEEKLY_REVENUE = [40, 55, 35, 70, 60, 48, 92]
const WEEKLY_TOTAL = '₩8,400,000'

function Dashboard() {
  const t = useTranslation()
  const { data: orders } = useSuspenseQuery(ordersQueryOptions())
  const { data: notifications } = useSuspenseQuery(notificationsQueryOptions())

  const stats = [
    {
      ...t.dashboard.stats.todayRevenue,
      value: '₩1,240,000',
      trend: REVENUE_TREND,
      tone: 'positive' as const,
    },
    {
      ...t.dashboard.stats.newOrders,
      value: '18건',
      trend: ORDERS_TREND,
      tone: 'positive' as const,
    },
    {
      ...t.dashboard.stats.newUsers,
      value: '6명',
      trend: USERS_TREND,
      tone: 'negative' as const,
    },
    {
      ...t.dashboard.stats.unreadNotifications,
      value: t.dashboard.unreadCount(notifications.length),
      trend: null,
      tone: 'positive' as const,
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <Card className="grid grid-cols-4 gap-0 divide-x py-0">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col gap-2 px-5 py-4">
            <span className="text-sm font-medium text-muted-foreground">
              {stat.label}
            </span>
            <span className="text-3xl font-semibold tracking-tight">
              {stat.value}
            </span>
            <div className="flex items-end justify-between gap-2">
              <span className="text-sm text-muted-foreground">{stat.hint}</span>
              {stat.trend && <Sparkline values={stat.trend} tone={stat.tone} />}
            </div>
          </div>
        ))}
      </Card>

      <div className="grid grid-cols-[1.7fr_1fr] gap-4">
        <Card>
          <CardHeader>
            <CardTitle>{t.dashboard.recentOrders.title}</CardTitle>
            <CardDescription>
              <Link to="/orders" className="hover:text-primary hover:underline">
                {t.dashboard.recentOrders.viewAll}
              </Link>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table className="border-y">
              <TableHeader>
                <TableRow>
                  <TableHead>{t.orders.columns.id}</TableHead>
                  <TableHead>{t.orders.columns.customer}</TableHead>
                  <TableHead>{t.orders.columns.amount}</TableHead>
                  <TableHead>{t.orders.columns.status}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.slice(0, 4).map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{order.amount}</TableCell>
                    <TableCell>
                      <StatusDot tone={ORDER_STATUS_TONE[order.status]}>
                        {order.status}
                      </StatusDot>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.dashboard.recentNotifications.title}</CardTitle>
              <CardDescription>
                {t.dashboard.recentNotifications.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              {notifications.slice(0, 4).map((item, index) => {
                const Icon = NOTIFICATION_ICONS[item.iconKey]
                return (
                  <div
                    key={index}
                    className="flex items-start gap-3 rounded-lg px-2 py-2"
                  >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Icon className="size-4 text-primary" />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <span className="text-sm">{item.message}</span>
                      <span className="text-xs text-muted-foreground">
                        {item.time}
                      </span>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t.dashboard.weeklyRevenue.title}</CardTitle>
              <CardDescription>{WEEKLY_TOTAL}</CardDescription>
            </CardHeader>
            <CardContent>
              <WeeklyBars
                values={WEEKLY_REVENUE}
                label={t.dashboard.weeklyRevenue.title}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: 통과 확인**

Run: `pnpm vitest run src/routes/index.test.tsx`
Expected: PASS (5개)

- [ ] **Step 4: 커밋**

```bash
git add src/routes/index.tsx src/routes/index.test.tsx
git commit -m "feat: 대시보드를 KPI 스트립, 스파크라인, 주간 매출 구성으로 리디자인"
```

---

### Task 11: 화면 검증

자동 테스트가 못 보는 색/폰트/대비를 브라우저로 확인한다. 코드 변경이 필요하면 해당 Task의 파일을 고치고 아래 커밋 메시지로 정리한다.

- [ ] **Step 1: 전체 검증**

Run: `pnpm vitest run 2>&1 | tail -8; pnpm exec tsc --noEmit 2>&1 | head -5; pnpm build 2>&1 | tail -3; pnpm lint 2>&1 | tail -15`
Expected: 테스트는 `table-date-range-filter` 2건 외 PASS, 타입 오류 없음, 빌드 성공. lint 오류는 새 파일/수정 파일 것만 고친다 (예: `new Function` 규칙이 걸리면 `theme.test.ts`의 해당 줄에 `// eslint-disable-next-line no-new-func`).

- [ ] **Step 2: dev 서버 실행**

```bash
pnpm exec vite dev --port 3100
```
(백그라운드로 실행하고 `http://localhost:3100` 응답을 확인한다. 3000번은 다른 프로세스가 쓸 수 있다.)

- [ ] **Step 3: 로그인 후 4개 스타일 확인**

데모 계정 `admin@example.com` / `admin1234`로 로그인한다. 대시보드에서 다음을 순서대로 확인한다. 브라우저 콘솔에서 `localStorage.setItem('theme-style','warm'); location.reload()` 식으로 전환해도 된다.
- Graphite(기본), Warm Paper, Editorial, Nordic 각각: 사이드바가 메인과 확실히 대비되는가 / 활성 메뉴가 포인트색으로 채워지는가 / 비활성 메뉴·섹션 라벨 글씨가 읽히는가 / 폰트가 스타일마다 다른가
- `localStorage.setItem('theme-color','green')` 후 새로고침: 배경·사이드바·포인트가 초록 계열로 통째로 바뀌는가 (Editorial은 흑백에서 컬러로 바뀌는가)
- 설정 > 테마 탭: 스타일 카드 4개와 색상 6개가 보이고, 클릭하면 즉시 바뀌는가. 새로고침해도 유지되고 첫 화면에 깜빡임이 없는가
- 주문/사용자 같은 리스트 페이지가 새 색을 자연스럽게 따라오는가 (깨진 곳이 있으면 목록으로 기록한다)

- [ ] **Step 4: 발견한 문제 수정 후 커밋**

문제가 없으면 이 단계는 건너뛴다.
```bash
git add -A src
git commit -m "fix: 화면 검증에서 발견한 스타일 테마 문제 수정"
```

---

### Task 12: 문서 갱신

**Files:**
- Modify: `README.md`, `AGENTS.md`, `docs/superpowers/specs/2026-10-04-style-themes-design.md`
- Replace: `docs/screenshots/*`

- [ ] **Step 1: README 수정**

- 7행 `- **테마:** 다크모드, 색상 프리셋` → `- **테마:** 스타일 4종(Graphite, Warm Paper, Editorial, Nordic) × 색상 프리셋`
- 미리보기 표의 `| 대시보드 (라이트) | 대시보드 (다크) |` 2열 표를 1열로 줄인다:
```
| 대시보드                                                 |
| -------------------------------------------------------- |
| ![대시보드](docs/screenshots/dashboard-light.png)        |
```
- 51~52행 `- **테마**: 라이트/다크/자동 + 색상 프리셋 6종(...), 프리셋×테마별 배경 이미지까지 매칭돼 있습니다.` →
```
- **테마**: 스타일 4종(Graphite/Warm Paper/Editorial/Nordic)과 색상 프리셋 5종을 `설정 > 테마`에서
  고릅니다. 스타일은 폰트·모서리·사이드바 분위기를, 색상은 배경·사이드바까지 포함한 전체 색 조합을 바꿉니다.
  라이트 전용입니다(다크 모드 없음).
```

- [ ] **Step 2: AGENTS.md 수정**

- 5행의 "다크모드," 를 "스타일 테마,"로 바꾼다.
- 356~360행 `**테마**` 단락 전체를 교체:
```
**테마**
스타일 4종(`graphite`/`warm`/`editorial`/`nordic`)을 `<html data-style>`로, 색상 프리셋(블루/그린/퍼플/로즈/오렌지)을
`<html data-color>`로 고른다. 허용 값·저장 키(`theme-style`, `theme-color`)·초기화 스크립트는
`src/config/theme.ts`가 단일 출처이고, 선택 UI는 `style-theme-picker.tsx` / `color-theme-picker.tsx`다.
색은 `src/styles.css`에서 `oklch(L C var(--h))`로 정의하며, 색상 프리셋은 `--h`(색상 각도)만 덮어써서
배경·카드·사이드바·포인트가 한 계열로 같이 움직인다. 라이트 전용이다(다크 모드 없음).
새 스타일은 `THEME_STYLES`에 추가하고 `styles.css`에 `:root[data-style='...']` 블록을 만들면 된다 —
`theme.test.ts`가 둘의 불일치를 잡아준다. 새 색상 프리셋도 같은 방식(`THEME_COLORS` + `:root[data-color='...']`).
```
- 405~416행 `.bg-grid-fade` 불릿 전체를 교체:
```
- 콘텐츠 영역 배경은 단색 `--background`다(예전에는 색상별 오버레이 이미지와 격자 패턴이었지만 옛스럽다는
  피드백으로 제거했다). 무늬/배경 이미지를 되살리자는 요청이 오면 방향부터 먼저 확인할 것.
```
- 417행 이후 "페이지 콘텐츠는 반드시 `Card`/`CardContent`로 감싼다" 불릿의 `배경(`.bg-grid-fade`) 위에 흰 카드로 떠 있어야` 를 `배경 위에 카드로 떠 있어야` 로 고친다.

- [ ] **Step 3: 설계 문서의 토큰 이름 정정**

`docs/superpowers/specs/2026-10-04-style-themes-design.md`의 `추가 토큰: \`--success\`, \`--warning\`(시안의 \`--ok\`, \`--warn\`), \`--font-heading\`, \`--shadow-card\`` 에서 `--font-heading` → `--font-title`(+ `--font-body`, `--weight-body`, `--weight-title`)로 고친다.

- [ ] **Step 4: 스크린샷 갱신**

dev 서버(3100)에서 로그인한 뒤 Graphite 기본 상태로 1440×900 스크린샷을 찍어 `docs/screenshots/`의 기존 이름으로 덮어쓴다: `dashboard-light.png`(대시보드), `orders-light.png`(주문), `settings-ai-light.png`(설정 > AI 연동), `ai-playground-light.png`. `dashboard-dark.png`는 삭제한다. 데모 계정 정보가 보이는 부분은 이전과 같은 방식으로 가린다(기존 스크린샷의 처리 방식을 먼저 확인할 것).

```bash
git rm -q docs/screenshots/dashboard-dark.png
```

- [ ] **Step 5: 커밋**

```bash
git add README.md AGENTS.md docs
git commit -m "docs: 스타일 테마 시스템에 맞춰 README, AGENTS, 스크린샷 갱신"
```

---

### Task 13: JSH-OS에 반영

킷은 `jsh-os`와 히스토리가 달라서, 킷을 remote로 붙여 객체를 가져온 뒤 패치를 3-way로 적용한다.

**Files:** `~/Documents/MY_PLAYGROUND/jsh-os` 전체 (킷과 같은 구조)

- [ ] **Step 1: 킷 커밋 범위 확인**

```bash
cd /Users/joseonghun/Documents/MY_PLAYGROUND/tanstack-start-kit
git log --oneline 77b6001..HEAD
```
Expected: 설계 문서 커밋(`14cd0e9`)부터 Task 12까지의 커밋 목록. `77b6001`은 이 작업 이전의 킷 마지막 커밋이다.

- [ ] **Step 2: 패치 적용**

```bash
git -C /Users/joseonghun/Documents/MY_PLAYGROUND/tanstack-start-kit format-patch --stdout 77b6001..HEAD > /tmp/jsh-os-style-themes.patch
cd /Users/joseonghun/Documents/MY_PLAYGROUND/jsh-os
git remote add kit ../tanstack-start-kit 2>/dev/null || true
git fetch -q kit    # 3-way 병합에 필요한 원본 객체를 가져온다
git am --3way /tmp/jsh-os-style-themes.patch
```
바이너리(삭제되는 `public/backgrounds/*.webp`, 교체되는 스크린샷)는 `format-patch`에 포함되지 않아 `git am`이 실패하면, `--binary`를 붙여 패치를 다시 만든다(`format-patch --binary --stdout ...`).
충돌이 나면 `git status`로 파일을 확인해 직접 해결하고 `git add <파일> && git am --continue`. 예상 충돌 위치: `README.md`(소개문이 다름), `src/i18n/messages.ts`(브랜드 문구 근처). **해결 원칙:** 킷의 새 내용을 취하되 JSH-OS 고유 변경(README 제목/소개, `brand: 'JSH-OS'`, `APP_NAME = 'JSH-OS'`, `package.json` name)은 유지한다.

- [ ] **Step 3: JSH-OS 고유 보정**

- `src/routes/__root.tsx`의 `title: 'Admin'` → `title: 'JSH-OS'`
- `src/components/nav-header.tsx`가 킷 버전으로 덮였더라도 브랜드는 `t.navHeader.brand`를 쓰므로 `messages.ts`의 `brand: 'JSH-OS'`(ko/en)가 유지됐는지 `grep -n "brand:" src/i18n/messages.ts`로 확인
- `src/components/nav-header.test.tsx`의 `findByText('Admin')`이 `'JSH-OS'`인지 확인
- `README.md` 제목이 `# JSH-OS`인지, 앞서 지운 "새 프로젝트 시작하기" 섹션이 되살아나지 않았는지 확인

- [ ] **Step 4: 검증**

```bash
pnpm install && pnpm vitest run 2>&1 | tail -8 && pnpm build 2>&1 | tail -3
```
Expected: `table-date-range-filter` 2건 외 PASS, 빌드 성공.

- [ ] **Step 5: 보정 커밋**

```bash
git add -A
git commit -m "chore: JSH-OS 브랜드와 탭 제목을 스타일 테마 반영본에 맞게 보정"
```
(`git am`이 만든 커밋 위에 보정만 얹는다. 보정할 변경이 없으면 건너뛴다.)

- [ ] **Step 6: 푸시는 사용자 확인 후**

두 저장소(`tanstack-start-kit`, `jsh-os`)의 푸시는 외부에 공개되는 작업이므로, 여기서 멈추고 결과를 보고한 뒤 사용자 확인을 받고 진행한다.

---

## Self-Review

**1. Spec coverage**

| 스펙 항목 | Task |
|---|---|
| 라이트 전용, 다크 제거(`ThemeToggle`, `.dark`, `@custom-variant`, 초기화 스크립트의 다크 로직) | 6(.dark/variant), 7(ThemeToggle, `dark:`), 1·5(스크립트) |
| 스타일 4종 + `data-style`/`data-color` 속성, 저장 키 | 1, 3 |
| `slate` 제거와 폴백 | 1(`parseThemeColor`), 3(테스트), 6 |
| shadcn 토큰 매핑, `--success`/`--warning`/`--shadow-card` | 6 |
| 색상 프리셋이 전체 조합 이동(`--h`), Editorial 특수 처리 | 6 |
| 사이드바 대비, 활성 메뉴 채움, 비활성 글씨 가독성 | 6(토큰), 8 |
| 폰트 `@fontsource` 번들링, 스타일별 굵기 | 6 |
| 배경 이미지/`bg-grid-fade` 제거 | 5, 6 |
| 설정 > 테마 탭 스타일 피커, i18n | 2, 3, 4 |
| 첫 화면 깜빡임 방지 | 1, 5 |
| 대시보드 KPI 스트립+스파크라인, 표, 알림, 주간 막대 | 9, 10 |
| 테스트(피커, 초기화 스크립트, CSS 일관성), 빌드 | 1, 3, 6, 11 |
| README/AGENTS/스크린샷 | 12 |
| JSH-OS 반영 | 13 |

스펙의 `--font-heading`은 구현에서 `--font-title`로 정했고, Task 12 Step 3에서 스펙을 정정한다.

**2. Placeholder scan:** TBD/TODO/"적절히" 류 없음. 수정 위치를 행 번호로 안내한 곳(Task 2, 5, 8)은 old/new 문자열 또는 정확한 클래스 문자열을 함께 적었다. 다만 Task 6 Step 5는 삭제 대상을 블록 단위로 지시하므로 실행 시 `grep -n`으로 경계를 확인해야 한다.

**3. Type consistency:** `ThemeStyle`/`ThemeColor`, `THEME_STYLES`/`THEME_COLORS`, `parseThemeStyle`/`parseThemeColor`, `applyThemeStyle`/`applyThemeColor`, `STYLE_STORAGE_KEY`/`COLOR_STORAGE_KEY`, `DEFAULT_THEME_STYLE`, `THEME_INIT_SCRIPT`는 Task 1 정의와 Task 3·5·6의 사용이 일치한다. i18n 키 `colorThemePicker.default`, `stylePicker.{graphite,warm,editorial,nordic}`, `settings.theme.{styleLabel,styleDescription}`, `dashboard.weeklyRevenue.title`은 Task 2에서 정의하고 Task 3·4·10에서 쓴다. `Sparkline`의 `tone: 'positive' | 'negative'`는 Task 9와 10이 같다.
