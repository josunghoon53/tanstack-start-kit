// 테마는 두 축이다.
//  - 스타일(data-style): 모양과 글꼴만 정한다. 색은 하나도 갖지 않는다.
//  - 팔레트(data-color): 3색 팔레트 프리셋. 사이드바 면과 메인의 작은 포인트
//    (주요 버튼·링크·주간 막대 강조 1개·활성 탭·칩)에만 쓰인다.
// 메인의 큰 면(배경/카드/표/본문)은 어떤 선택에서도 무채색이다. 프리셋이 없으면 사이드바도 무채색이다.
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

// 팔레트 프리셋. 값이 없으면(null) 기본(무채색)이다.
export const THEME_COLORS = [
  'pop',
  'pop-red',
  'navy-yellow',
  'violet-lime',
  'charcoal-orange',
] as const
export type ThemeColor = (typeof THEME_COLORS)[number]

// 프리셋 하나의 최종 색 토큰(hex). styles.css의 :root[data-color='…'] 블록과 값이 같아야 한다
// (theme.test.ts가 비교한다). 세 색의 역할은 상대 휘도로 정한다:
//   main(주색)=가장 어두운 색, accent(포인트)=중간, soft(옅은 색)=가장 밝은 색.
// 나머지는 승인된 미리보기(docs/superpowers/specs/assets/color-combos-preview.html, 모드 2)의
// 규칙으로 미리 계산한 값이다:
//   mainFg       주색 위 글자. 항상 흰색(흰 글자 4.5:1 미만이면 주색을 5%씩 어둡게).
//   accentFg     포인트 위 글자(사이드바 활성 메뉴). #111/#FFF 중 대비가 높은 쪽.
//   softFg       옅은 색 위 칩 글자. 중립 잉크 #1F2024(4.5:1 미만이면 어둡게).
//   sidebarText  사이드바 비활성 글자. 옅은 색을 흰색 쪽으로 40% 섞음(4.5:1 미만이면 더 흰색 쪽으로).
//   sidebarStrong 사이드바 강한 글자(브랜드·호버). 옅은 색을 흰색 쪽으로 70%(7:1 보장).
//   sidebarLine  사이드바 구분선·호버 면. 주색을 흰색 쪽으로 16% 섞음.
export interface PalettePreset {
  main: string
  accent: string
  soft: string
  mainFg: string
  accentFg: string
  softFg: string
  sidebarText: string
  sidebarStrong: string
  sidebarLine: string
}

export const PALETTE_PRESETS: Record<ThemeColor, PalettePreset> = {
  // 코발트 / 라임 / 아이보리
  pop: {
    main: '#003FE2',
    accent: '#D6FC43',
    soft: '#F6F4F0',
    mainFg: '#FFFFFF',
    accentFg: '#111111',
    softFg: '#1F2024',
    sidebarText: '#FAF8F6',
    sidebarStrong: '#FCFCFB',
    sidebarLine: '#295EE7',
  },
  // 잉크 / 레드 / 오프화이트
  'pop-red': {
    main: '#1D2330',
    accent: '#E84635',
    soft: '#F4F1E8',
    mainFg: '#FFFFFF',
    accentFg: '#111111',
    softFg: '#1F2024',
    sidebarText: '#F8F7F1',
    sidebarStrong: '#FCFBF8',
    sidebarLine: '#414651',
  },
  // 후보(평가 중): 네이비 / 옐로 / 크림
  'navy-yellow': {
    main: '#0B1F3A',
    accent: '#FFD60A',
    soft: '#FFF8DB',
    mainFg: '#FFFFFF',
    accentFg: '#111111',
    softFg: '#1F2024',
    sidebarText: '#FFFBE9',
    sidebarStrong: '#FFFDF4',
    sidebarLine: '#32435A',
  },
  // 후보(평가 중): 바이올렛 / 라임 / 라벤더 화이트
  'violet-lime': {
    main: '#241B4D',
    accent: '#C8F03A',
    soft: '#F1EEFC',
    mainFg: '#FFFFFF',
    accentFg: '#111111',
    softFg: '#1F2024',
    sidebarText: '#F7F5FD',
    sidebarStrong: '#FBFAFE',
    sidebarLine: '#473F69',
  },
  // 후보(평가 중): 차콜 / 오렌지 / 피치 화이트
  'charcoal-orange': {
    main: '#1C1C1E',
    accent: '#FF7A1A',
    soft: '#FFF1E6',
    mainFg: '#FFFFFF',
    accentFg: '#111111',
    softFg: '#1F2024',
    sidebarText: '#FFF7F0',
    sidebarStrong: '#FFFBF8',
    sidebarLine: '#404042',
  },
}

export const STYLE_STORAGE_KEY = 'theme-style'
export const COLOR_STORAGE_KEY = 'theme-color'

export function parseThemeStyle(value: string | null): ThemeStyle {
  const known = THEME_STYLES.find((style) => style === value)
  if (known) {
    return known
  }
  return (value !== null && LEGACY_STYLES.get(value)) || DEFAULT_THEME_STYLE
}

// 알 수 없는 값(예전 포인트색 'blue'/'green'/'purple'/'rose'/'orange', 그보다 예전의 'slate' 등)은
// 기본(무채색, null)으로 취급한다.
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
