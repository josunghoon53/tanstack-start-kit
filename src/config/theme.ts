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

// 알 수 없는 값(예전의 'slate' 등)은 무채색(null)으로 취급한다.
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
export const THEME_INIT_SCRIPT = `(function(){try{var d=document.documentElement;var s=localStorage.getItem(${JSON.stringify(STYLE_STORAGE_KEY)});var styles=${JSON.stringify(THEME_STYLES)};var legacy=${JSON.stringify(Object.fromEntries(LEGACY_STYLES))};var st=styles.indexOf(s)>-1?s:(Object.prototype.hasOwnProperty.call(legacy,s)?legacy[s]:${JSON.stringify(DEFAULT_THEME_STYLE)});d.setAttribute('data-style',st);var c=localStorage.getItem(${JSON.stringify(COLOR_STORAGE_KEY)});var colors=${JSON.stringify(THEME_COLORS)};if(colors.indexOf(c)>-1){d.setAttribute('data-color',c)}else{d.removeAttribute('data-color')}}catch(e){}})();`
