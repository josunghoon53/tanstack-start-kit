# 스타일 × 포인트색 분리 설계 + 구현 계획

> **갱신됨(2026-10-06):** 포인트색 5종(블루/그린/퍼플/로즈/오렌지, `--ah`/`--ae`)은 3색 팔레트 프리셋 12종으로 대체됐다 — [2026-10-06-palette-presets-design.md](../specs/2026-10-06-palette-presets-design.md). 스타일 축은 이 계획 그대로다.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** 테마를 "스타일(모양과 글꼴)"과 "포인트색(작은 곳의 강조색)" 두 축으로 완전히 분리한다. 큰 면(배경/카드/사이드바)은 어떤 선택에서도 무채색이고, 사이드바는 항상 어둡다.

**배경(왜 바꾸나):** 2026-10-04 설계는 색상 프리셋이 전체 팔레트의 색상 각도를 옮겼고, 스타일(Graphite/Warm/Nordic)도 고유 색을 가졌다. 그래서 (1) 스타일과 색상의 경계가 모호했고, (2) 색을 고르면 사이드바·배경이 통째로 물들어 오래 보기 피로했다. 시안(`~/.gstack/projects/josunghoon53-jsh-os/designs/dashboard-20261004/separate.html`)으로 비교해 아래를 확정했다. 이 문서는 `2026-10-04-style-themes-design.md`의 "색상 프리셋이 전체 색 조합을 이동" 결정을 대체한다.

## 확정 사항 (사용자 선택)

- **색 강도 = 없음**: 큰 면은 항상 무채색(아주 약한 따뜻한 기운 `h=90, C≈.004~.008`). 포인트색은 `--primary`, 활성 메뉴 글씨, 차트 강조, 아이콘 칩 같은 작은 곳에만.
- **사이드바 = 어둡게 고정**: 모든 스타일·색에서 어두운 중립. 활성 메뉴는 off-white 박스 + (무채색이면 거의 검정, 포인트색이면 그 색) 굵은 글씨.
- **스타일 4종은 시안 그대로**: `clean`(기본), `soft`, `editorial`, `crisp`. 스타일은 **색을 갖지 않는다**.
- **포인트색**: 무채색(기본, 속성 없음) + `blue/green/purple/rose/orange`.
- 이전 저장값 호환: 예전 `graphite`·`nordic` → `clean`, `warm` → `soft`로 자동 변환. 예전 색상 값은 그대로 유효하고, `slate` 등 알 수 없는 값은 무채색.

## 두 축의 정의

| 속성 | 값 | 바꾸는 토큰 | 바꾸지 않는 것 |
|---|---|---|---|
| `data-style` | `clean`(기본)/`soft`/`editorial`/`crisp` | `--radius`, `--font-body`, `--font-title`, `--weight-body`, `--weight-title`, `--shadow-card`, `--card-border`, `--input` | 모든 색(배경, 카드, 사이드바, 포인트) |
| `data-color` | 없음(무채색)/`blue`/`green`/`purple`/`rose`/`orange` | `--ah`(색상각), `--ae`(포인트 켜짐 0/1) → `--primary`, `--ring`, `--chart-*`, `--sidebar-primary-foreground`, `--sidebar-ring` | 모양, 큰 면의 색 |

스타일별 값:

| | clean | soft | editorial | crisp |
|---|---|---|---|---|
| `--radius` | .5rem | .875rem | -.25rem(카드 포함 0) | 0 (카드 4px, 나머지 직각) |
| 본문/제목 폰트 | IBM Plex Sans KR | Gowun Dodum / Gowun Batang | Nanum Myeongjo | Noto Sans KR |
| 본문/제목 굵기 | 400 / 600 | 400 / 700 | 400 / 800 | 500 / 800 |
| 카드 그림자 | 아주 옅음 | 크고 부드러움 | 없음 | 없음 |
| 카드 테두리 | 옅은 회색 | 옅은 회색 | 옅은 회색 | 검정에 가까운 선 |
| 입력/컨트롤 테두리(`--input`) | 옅은 회색 | 옅은 회색 | 검정에 가까운 선 | 검정에 가까운 선 |

## 파일 구조

| 파일 | 작업 |
|---|---|
| `src/config/theme.ts` (+test) | 스타일 목록 교체, 레거시 매핑, 초기화 스크립트 갱신 |
| `src/styles.css` | 테마 블록 재작성(무채색 기본 + 포인트 + 스타일 4종) |
| `src/components/ui/card.tsx` | 카드 테두리를 `--card-border` 토큰으로 |
| `src/components/style-theme-picker.tsx` (+test) | 4종 모양 미리보기(회색조 + 해당 폰트) |
| `src/components/color-theme-picker.tsx` (+test) | "무채색" + 5색 |
| `src/i18n/messages.ts` | 문구 교체(ko/en) |
| `src/routes/settings.test.tsx` | 새 이름 반영 |
| `README.md`, `AGENTS.md`, 기존 spec | 문서 갱신 |

---

### Task 1: 설정 모듈 — 스타일 교체와 레거시 매핑

**Files:** Modify `src/config/theme.ts`, `src/config/theme.test.ts`

- [ ] **Step 1: `src/config/theme.test.ts`를 새 기대값으로 수정 (실패하게)**

1. `THEME_STYLES` 관련 테스트는 목록 변수를 쓰므로 그대로 두되, 아래 레거시 테스트를 `describe('parseThemeStyle', ...)` 안에 추가:
```ts
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
```
2. `describe('THEME_INIT_SCRIPT', ...)`의 첫 테스트(`restores a stored style and color before first paint`)에서 `'nordic'`을 `'crisp'`으로 바꾼다(기대값도 `'crisp'`). 같은 describe에 추가:
```ts
  it('maps legacy stored styles to their new equivalents', () => {
    window.localStorage.setItem(STYLE_STORAGE_KEY, 'warm')

    runScript()

    expect(document.documentElement).toHaveAttribute('data-style', 'soft')
  })
```
3. `describe('styles.css consistency', ...)`를 다음으로 교체:
```ts
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
```
Run: `pnpm vitest run src/config/theme.test.ts` → FAIL (새 스타일 이름/매핑 없음).

- [ ] **Step 2: `src/config/theme.ts` 수정**

상단 주석부터 `parseThemeColor` 앞까지를 다음으로 교체(나머지 `THEME_COLORS`, 키, `parseThemeColor`, `apply*`는 유지하되 주석만 아래처럼 고친다):

```ts
// 테마는 두 축이다.
//  - 스타일(data-style): 모양과 글꼴만 정한다. 색은 하나도 갖지 않는다.
//  - 포인트색(data-color): 버튼·활성 메뉴 글씨·차트 강조 같은 작은 곳의 색만 정한다.
// 큰 면(배경/카드/사이드바)은 어떤 선택에서도 무채색이다.
// 허용 값을 늘리면 src/styles.css에도 같은 이름의 블록을 추가해야 한다 —
// 어긋나면 theme.test.ts의 CSS 일관성 테스트가 잡아준다.

export const THEME_STYLES = ['clean', 'soft', 'editorial', 'crisp'] as const
export type ThemeStyle = (typeof THEME_STYLES)[number]
export const DEFAULT_THEME_STYLE: ThemeStyle = 'clean'

// 예전 버전이 저장해 둔 스타일 이름을 가장 가까운 새 스타일로 옮긴다.
// (객체 리터럴이 아니라 Map을 쓰는 건 'constructor' 같은 프로토타입 키가 걸리지 않게 하려는 것이다.)
const LEGACY_STYLES = new Map<string, ThemeStyle>([
  ['graphite', 'clean'],
  ['nordic', 'clean'],
  ['warm', 'soft'],
])

// 포인트색. 값이 없으면(null) 무채색이다.
export const THEME_COLORS = [
  'blue',
  'green',
  'purple',
  'rose',
  'orange',
] as const
export type ThemeColor = (typeof THEME_COLORS)[number]

export const STYLE_STORAGE_KEY = 'theme-style'
export const COLOR_STORAGE_KEY = 'theme-color'

export function parseThemeStyle(value: string | null): ThemeStyle {
  const known = THEME_STYLES.find((style) => style === value)
  if (known) {
    return known
  }
  return (value !== null && LEGACY_STYLES.get(value)) || DEFAULT_THEME_STYLE
}
```
`parseThemeColor` 위 주석은 `// 알 수 없는 값(예전의 'slate' 등)은 무채색(null)으로 취급한다.`로 교체.

`THEME_INIT_SCRIPT`를 다음으로 교체(레거시 매핑 포함, 파서와 같은 규칙):
```ts
export const THEME_INIT_SCRIPT = `(function(){try{var d=document.documentElement;var s=localStorage.getItem(${JSON.stringify(STYLE_STORAGE_KEY)});var styles=${JSON.stringify(THEME_STYLES)};var legacy=${JSON.stringify(Object.fromEntries(LEGACY_STYLES))};var st=styles.indexOf(s)>-1?s:(Object.prototype.hasOwnProperty.call(legacy,s)?legacy[s]:${JSON.stringify(DEFAULT_THEME_STYLE)});d.setAttribute('data-style',st);var c=localStorage.getItem(${JSON.stringify(COLOR_STORAGE_KEY)});var colors=${JSON.stringify(THEME_COLORS)};if(colors.indexOf(c)>-1){d.setAttribute('data-color',c)}else{d.removeAttribute('data-color')}}catch(e){}})();`
```
(Step 1에서 일부 테스트는 CSS 때문에 Task 2 전까지 실패해도 된다 — CSS 일관성 테스트만. 나머지는 이 단계에서 통과해야 한다.)

- [ ] **Step 3:** `pnpm vitest run src/config/theme.test.ts` → CSS 일관성 3개를 뺀 나머지 PASS. `pnpm exec prettier --write src/config/theme.ts src/config/theme.test.ts`.
- [ ] **Step 4: 커밋** `git add src/config/theme.ts src/config/theme.test.ts && git commit -m "feat: 테마 스타일을 clean/soft/editorial/crisp로 교체하고 예전 저장값 매핑 추가"`

---

### Task 2: 스타일 CSS 재작성

**Files:** Modify `src/styles.css`, `src/components/ui/card.tsx`

- [ ] **Step 1:** `src/styles.css`에서 `/* ─── 스타일 테마 ...` 머리말 주석(141행 부근)부터 `:root[data-style='editorial'][data-color] { ... }` 블록 끝(`--ak: 0.1; }`)까지를 아래로 통째로 교체한다. (`@theme inline`과 `@layer base`는 그대로 둔다. `grep -n`으로 경계를 확인할 것.)

```css
/* ────────────────────────────────────────────────────────────────────────────
   테마는 두 축이다.
   - 스타일(<html data-style>): 모양과 글꼴만 정한다. 색은 하나도 갖지 않는다.
   - 포인트색(<html data-color>): 버튼·활성 메뉴 글씨·차트 강조 같은 작은 곳의 색만 정한다.
   큰 면(배경/카드/사이드바)은 어떤 선택에서도 무채색이다(눈의 피로를 줄이려는 결정).
   사이드바는 항상 어두운 중립이고, 활성 메뉴는 off-white 박스에 굵은 글씨로 표시한다.
   색은 oklch(L C H) — 큰 면은 색상각 90에 채도 .004~.008(아주 약한 따뜻한 기운),
   포인트색은 --ah(색상각)와 --ae(0=무채색, 1=포인트 켜짐)로 계산한다.
   ──────────────────────────────────────────────────────────────────────────── */
:root {
  --ah: 90;
  --ae: 0;

  /* 큰 면: 항상 무채색 */
  --background: oklch(0.955 0.006 90);
  --foreground: oklch(0.2 0.006 90);
  --card: oklch(0.988 0.003 90);
  --card-foreground: var(--foreground);
  --popover: var(--card);
  --popover-foreground: var(--foreground);
  --secondary: oklch(0.935 0.006 90);
  --secondary-foreground: var(--foreground);
  --muted: var(--secondary);
  --muted-foreground: oklch(0.47 0.008 90);
  --accent: var(--secondary);
  --accent-foreground: var(--foreground);
  --border: oklch(0.9 0.006 90);
  --destructive: oklch(0.56 0.12 25);
  --success: oklch(0.62 0.09 160);
  --warning: oklch(0.74 0.095 80);

  /* 포인트색: 무채색일 땐 거의 검정, 색을 고르면 그 색(밝기 .5, 채도 .11) */
  --primary: oklch(
    calc(0.25 + 0.25 * var(--ae)) calc(0.11 * var(--ae)) var(--ah)
  );
  --primary-foreground: oklch(1 0 0);
  --ring: var(--primary);
  --chart-1: oklch(0.85 calc(0.04 * var(--ae)) var(--ah));
  --chart-2: oklch(0.7 calc(0.07 * var(--ae)) var(--ah));
  --chart-3: oklch(0.55 calc(0.1 * var(--ae)) var(--ah));
  --chart-4: oklch(0.42 calc(0.09 * var(--ae)) var(--ah));
  --chart-5: oklch(0.3 calc(0.06 * var(--ae)) var(--ah));

  /* 사이드바: 항상 어둡게 */
  --sidebar: oklch(0.21 0.004 90);
  --sidebar-foreground: oklch(0.84 0.005 90);
  --sidebar-primary: oklch(0.985 0.004 90);
  --sidebar-primary-foreground: oklch(
    calc(0.18 + 0.32 * var(--ae)) calc(0.1 * var(--ae)) var(--ah)
  );
  --sidebar-accent: oklch(0.3 0.004 90);
  --sidebar-accent-foreground: oklch(0.97 0.004 90);
  --sidebar-border: oklch(0.3 0.004 90);
  --sidebar-ring: oklch(0.85 calc(0.08 * var(--ae)) var(--ah));
}

/* ── 스타일 축: 모양과 글꼴 ── */
:root,
:root[data-style='clean'] {
  --radius: 0.5rem;
  --font-body: 'IBM Plex Sans KR', ui-sans-serif, system-ui, sans-serif;
  --font-title: var(--font-body);
  --weight-body: 400;
  --weight-title: 600;
  --shadow-card: 0 1px 2px oklch(0.3 0.01 90 / 0.06);
  --card-border: var(--border);
  --input: oklch(0.86 0.006 90);
}

:root[data-style='soft'] {
  --radius: 0.875rem;
  --font-body: 'Gowun Dodum', ui-sans-serif, system-ui, sans-serif;
  --font-title: 'Gowun Batang', serif;
  --weight-body: 400;
  --weight-title: 700;
  --shadow-card: 0 8px 24px -16px oklch(0.35 0.02 90 / 0.35);
  --card-border: var(--border);
  --input: oklch(0.86 0.006 90);
}

/* --radius를 음수로 둔 건 rounded-xl(= radius + 4px)이 0이 되도록 하기 위해서다. */
:root[data-style='editorial'] {
  --radius: -0.25rem;
  --font-body: 'Nanum Myeongjo', serif;
  --font-title: 'Nanum Myeongjo', serif;
  --weight-body: 400;
  --weight-title: 800;
  --shadow-card: none;
  --card-border: var(--border);
  --input: oklch(0.2 0.006 90);
}

/* radius 0 → 카드(rounded-xl)만 4px, 버튼·입력은 직각. 테두리는 검정에 가까운 선. */
:root[data-style='crisp'] {
  --radius: 0rem;
  --font-body: 'Noto Sans KR', ui-sans-serif, system-ui, sans-serif;
  --font-title: var(--font-body);
  --weight-body: 500;
  --weight-title: 800;
  --shadow-card: none;
  --card-border: oklch(0.22 0.004 90);
  --input: oklch(0.22 0.004 90);
}

/* ── 포인트색 축: 색상각만 정하고 포인트를 켠다. 위 블록들보다 뒤에 둘 것(특이도가 같다). ── */
:root[data-color='blue'] {
  --ah: 255;
  --ae: 1;
}
:root[data-color='green'] {
  --ah: 155;
  --ae: 1;
}
:root[data-color='purple'] {
  --ah: 300;
  --ae: 1;
}
:root[data-color='rose'] {
  --ah: 12;
  --ae: 1;
}
:root[data-color='orange'] {
  --ah: 55;
  --ae: 1;
}
```
- [ ] **Step 2:** `src/components/ui/card.tsx` 9행: `border border-border` → `border border-(--card-border)` (나머지 클래스 유지).
- [ ] **Step 3:** `pnpm exec prettier --write src/styles.css`(포맷만 바뀌는지 diff 확인), `pnpm vitest run src/config/theme.test.ts`(전부 PASS), `pnpm build`(성공). 이 시점에 `style-theme-picker` 테스트는 새 이름 때문에 실패해도 된다(Task 3).
- [ ] **Step 4: 커밋** `git add src/styles.css src/components/ui/card.tsx && git commit -m "feat: 스타일은 모양만, 포인트색은 작은 곳만 — 큰 면은 항상 무채색으로 테마 CSS 재작성"`

---

### Task 3: 피커·문구·테스트

**Files:** Rewrite `src/components/style-theme-picker.tsx`, modify `src/components/color-theme-picker.tsx`, `src/i18n/messages.ts`, tests

- [ ] **Step 1: i18n (`src/i18n/messages.ts`)** — ko/en 모두:
  - `settings.theme`: ko `styleDescription: '모양과 글꼴을 바꿔요. 색은 바뀌지 않아요.'`, `accentColorLabel: '포인트 색상'`, `accentColorDescription: '버튼, 활성 메뉴 글씨, 차트 강조처럼 작은 곳에만 쓰여요. 화면의 큰 면은 항상 무채색이에요.'`; en `styleDescription: 'Changes the shape and typography. Colors stay the same.'`, `accentColorLabel: 'Accent color'`, `accentColorDescription: 'Used only in small places such as buttons, the active menu text and chart highlights. Large surfaces always stay neutral.'` (`styleLabel`은 유지)
  - `colorThemePicker`: `default` 키를 `neutral`로 바꾼다 — ko `'무채색'`, en `'Neutral'`.
  - `stylePicker`를 다음으로 교체 — ko: `clean: '8px 모서리와 가는 테두리, 깔끔한 고딕'`, `soft: '크게 둥근 카드와 부드러운 그림자, 둥근 글꼴'`, `editorial: '각진 모서리와 명조체, 신문 같은 느낌'`, `crisp: '검은 테두리와 굵은 고딕, 또렷한 느낌'`; en: `clean: 'Clean sans-serif with 8px corners and thin borders'`, `soft: 'Large rounded cards, soft shadows and rounded type'`, `editorial: 'Square corners and serif type, newspaper-like'`, `crisp: 'Dark outlines and bold sans-serif, sharp and clear'`
- [ ] **Step 2: 테스트 수정 (실패하게)**
  - `style-theme-picker.test.tsx`: 이름 목록을 `['Clean', 'Soft', 'Editorial', 'Crisp']`, 기본 선택 `/^Clean/`, 설명 텍스트 `'크게 둥근 카드와 부드러운 그림자, 둥근 글꼴'`, "applies and stores" 테스트는 `/^Soft/` 클릭 → `data-style='soft'`/저장값 `'soft'`. "restores a stored style…" 테스트는 저장값 `'crisp'`→`/^Crisp/` pressed, `'bogus'`→`/^Clean/` pressed. 레거시 테스트 추가: 저장값 `'warm'` → `/^Soft/` pressed, `'graphite'` → `/^Clean/` pressed.
  - `color-theme-picker.test.tsx`: 라벨 `'기본'`을 모두 `'무채색'`으로. 
  - `settings.test.tsx`: 스타일 이름 목록을 `['Clean', 'Soft', 'Editorial', 'Crisp']`, 색상 라벨 목록의 `'기본'`을 `'무채색'`으로.
  `pnpm vitest run src/components/style-theme-picker.test.tsx src/components/color-theme-picker.test.tsx src/routes/settings.test.tsx` → FAIL 확인.
- [ ] **Step 3: `style-theme-picker.tsx` 재작성** — 이름·미리보기 상수를 다음으로 바꾼다(컴포넌트 본문 구조/접근성은 유지: 버튼 `aria-pressed`, 카드 이름 = 스타일명 + 설명).
```tsx
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
```
미리보기 칩 JSX(기존 `<span aria-hidden ...>` 블록)를 다음으로 교체:
```tsx
            <span
              aria-hidden="true"
              className="flex h-14 overflow-hidden rounded-md border"
              style={{ background: 'oklch(0.955 0.006 90)' }}
            >
              <span className="w-1/4" style={{ background: 'oklch(0.21 0.004 90)' }} />
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
```
  `DEFAULT_THEME_STYLE`/나머지 로직은 그대로.
- [ ] **Step 4: `color-theme-picker.tsx`** — `DEFAULT_SWATCH` 상수를 삭제하고 옵션 첫 항목을 `{ key: null, label: t.neutral, swatch: 'oklch(0.25 0 90)' }`로 바꾼다. 색 스와치는 `oklch(0.5 0.11 ${COLOR_HUES[key]})`로 바꿔 실제 포인트색(밝기 .5, 채도 .11)과 맞춘다. 주석의 "프리셋 색상각(--h)" 표현은 "포인트색의 색상각(--ah)"으로 고친다.
- [ ] **Step 5:** 위 3개 테스트 PASS, `pnpm exec tsc --noEmit` 클린, `pnpm exec prettier --write`(수정한 tsx 파일들). 
- [ ] **Step 6: 커밋** `git add -A src && git commit -m "feat: 스타일 선택은 모양 미리보기로, 색상 선택은 포인트색으로 문구와 UI 정리"`

---

### Task 4: 대비 검증과 보정

- [ ] **Step 1:** WCAG 대비 스크립트를 `/tmp`에 작성(OKLCH→sRGB 변환 + 상대휘도)해 `src/styles.css`의 값으로 다음을 **포인트색 6종(무채색 + 5색) 전부**에 대해 계산한다: 흰색 on `--primary`, `--primary` on `--card`, `--sidebar-primary-foreground` on `--sidebar-primary`, `--sidebar-foreground` on `--sidebar`, `--sidebar-foreground` 70% 불투명 on `--sidebar`(섹션 라벨), `--foreground` on `--background`, `--muted-foreground` on `--card`, 흰색 on `--destructive`. 
- [ ] **Step 2:** 4.5 미만이 있으면 `--primary`/`--sidebar-primary-foreground`의 밝기 계수(`0.25 + 0.25*ae`, `0.18 + 0.32*ae`)를 최소로 조정(채도는 낮은 상태 유지)하고, 결과 표를 보고한다. 값을 바꿨다면 `style-theme-picker`/`color-theme-picker` 스와치 값도 맞춘다.
- [ ] **Step 3:** `pnpm vitest run`(기존 실패 2건 외 통과), `pnpm build`. 변경이 있으면 커밋 `fix: 포인트색 대비를 WCAG AA 기준에 맞게 조정`.

---

### Task 5: 문서

- [ ] `README.md` 7행·51행의 테마 문구를 "스타일 4종(Clean, Soft, Editorial, Crisp)과 포인트색(무채색 + 5색)을 `설정 > 테마`에서 고릅니다. 스타일은 모양과 글꼴만, 포인트색은 버튼·활성 메뉴 글씨 같은 작은 곳의 색만 바꾸고, 큰 면과 사이드바는 항상 무채색입니다."로 교체.
- [ ] `AGENTS.md` **테마** 단락을 두 축 설명(위 "두 축의 정의" 표 요지), 새 스타일 추가 방법(`THEME_STYLES` + `:root[data-style='…']` 블록은 **색 토큰을 넣지 말 것**), 포인트색 추가 방법, 레거시 매핑(`graphite`/`nordic`→`clean`, `warm`→`soft`)으로 교체. 기존의 "스타일별 폰트 CSS 크기"·"Editorial 음수 radius" 주의 불릿은 유지하되 Crisp의 `radius: 0`(카드만 4px) 설명을 한 줄 덧붙인다.
- [ ] `docs/superpowers/specs/2026-10-04-style-themes-design.md` 맨 위(제목 아래)에 `> **갱신됨(2026-10-05):** 색상 프리셋이 전체 팔레트를 옮기던 부분과 스타일 4종(Graphite/Warm/Editorial/Nordic)은 [2026-10-05-style-color-split.md](../plans/2026-10-05-style-color-split.md)로 대체됐다.` 한 줄 추가.
- [ ] 커밋 `docs: 스타일과 포인트색 분리 구조에 맞춰 README, AGENTS, 이전 설계 문서 갱신`.

(스크린샷 갱신과 JSH-OS 반영은 컨트롤러가 별도로 진행한다.)
