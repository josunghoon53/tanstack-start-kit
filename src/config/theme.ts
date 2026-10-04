// 스타일 테마(data-style)와 색상 프리셋(data-color)의 단일 출처.
// 허용 값을 늘리면 src/styles.css에도 같은 이름의 블록을 추가해야 한다 —
// 어긋나면 theme.test.ts의 CSS 일관성 테스트가 잡아준다.

export const THEME_STYLES = ['graphite', 'warm', 'editorial', 'nordic'] as const
export type ThemeStyle = (typeof THEME_STYLES)[number]
export const DEFAULT_THEME_STYLE: ThemeStyle = 'graphite'

// 색상 프리셋은 "포인트색"이 아니라 전체 색 조합의 색상 각도(--h)를 옮긴다.
// 값이 없으면(null) 선택한 스타일의 기본 색상을 쓴다.
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
