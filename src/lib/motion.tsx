import { useEffect, useState } from 'react'
import { LazyMotion, MotionConfig, domAnimation } from 'motion/react'
import type { ReactNode } from 'react'
import type { Transition, Variants } from 'motion/react'

// 이 킷의 모든 motion 규칙은 이 파일 한 곳에서 정한다(토큰, 변형, 공용 Provider).
// 컴포넌트에서는 `motion.*`이 아니라 `m.*`만 쓴다 — LazyMotion(strict)이 `motion.*`을 막고,
// 기능은 domAnimation만 번들에 넣는다(레이아웃 애니메이션이 필요한 곳은 loadLayoutFeatures 참고).

// 길이(초). 짧게 유지한다: 상호작용 150ms, 기본 250ms, 진입 450ms 이하.
export const duration = {
  fast: 0.15,
  base: 0.25,
  slow: 0.45,
  // KPI 숫자 카운트업만 조금 길다(숫자가 올라가는 게 보일 만큼).
  count: 0.8,
} as const

// 이징 곡선. CSS 쪽(styles.css의 --motion-ease-out)과 같은 값이다.
export const ease = {
  out: [0.22, 1, 0.36, 1],
  inOut: [0.65, 0, 0.35, 1],
} as const satisfies Record<string, [number, number, number, number]>

// 튀지 않는 작은 스프링(감쇠비 약 0.95). 선택 표시 이동 같은 레이아웃 이동에만 쓴다.
export const spring = {
  type: 'spring',
  stiffness: 500,
  damping: 38,
  mass: 0.8,
} as const satisfies Transition

// 형제 사이 진입 간격(초).
export const STAGGER = 0.06
// 시트 안 정의 목록처럼 촘촘한 줄의 진입 간격(초).
export const STAGGER_TIGHT = 0.03

export const defaultTransition: Transition = {
  duration: duration.base,
  ease: ease.out,
}

// i번째 형제의 진입 지연(초). custom={i}로 넘겨 쓴다.
export function staggerDelay(index: number, base = 0) {
  return base + index * STAGGER
}

// 자식에게 hidden → visible을 차례로 흘려보내는 컨테이너.
export function staggerContainer(
  stagger = STAGGER,
  delayChildren = 0,
): Variants {
  return {
    hidden: {},
    visible: { transition: { staggerChildren: stagger, delayChildren } },
  }
}

// 아래에서 살짝 올라오며 나타남. custom으로 순번을 주면 그만큼 늦게 시작한다.
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: (index: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: duration.base + 0.05,
      ease: ease.out,
      delay: staggerDelay(index),
    },
  }),
}

// 8px 아래에서 천천히(slow) 올라오며 나타남. custom={순번}마다 STAGGER_TIGHT씩 늦게 시작한다.
// 행 보기 시트의 헤더 → 상세 줄 → 푸터 순차 진입에 쓴다.
export const riseIn: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: (index: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: duration.slow,
      ease: ease.out,
      delay: index * STAGGER_TIGHT,
    },
  }),
}

export const fade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: defaultTransition },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.6 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: duration.fast, ease: ease.out },
  },
}

// 레이아웃 애니메이션(layout/layoutId)용 기능 묶음. domMax는 메인 번들에 넣지 않고
// 필요한 화면에서 <LazyMotion features={loadLayoutFeatures} strict>로 감싸 지연 로드한다.
export const loadLayoutFeatures = () =>
  import('./motion-features').then((module) => module.default)

// 서버 렌더와 하이드레이션 첫 렌더에서는 false, 마운트 이후에만 true.
// "처음 화면에는 애니메이션을 걸지 않고 이후 변화에만 건다"를 SSR 불일치 없이 할 때 쓴다.
export function useHasMounted() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  return mounted
}

// 테마(팔레트/스타일)를 바꾸기 직전에 부른다. <html data-theme-transition>을 잠깐 붙여
// styles.css의 색 전환(background-color/color/border-color/fill, 250ms)을 켰다가 끈다.
// 상시로 켜두지 않는 이유: 첫 로드와 일반 hover 전환에는 영향을 주지 않기 위해서다.
const THEME_TRANSITION_MS = 300
let themeTransitionTimer: ReturnType<typeof setTimeout> | undefined

export function startThemeTransition(
  root: HTMLElement = document.documentElement,
) {
  root.setAttribute('data-theme-transition', '')
  clearTimeout(themeTransitionTimer)
  themeTransitionTimer = setTimeout(() => {
    root.removeAttribute('data-theme-transition')
  }, THEME_TRANSITION_MS)
}

// 앱 전체에 한 번 마운트한다(__root.tsx). reducedMotion="user"라 OS의 "동작 줄이기"를
// 켜면 transform/레이아웃 애니메이션은 즉시 끝나고 opacity만 남는다.
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user" transition={defaultTransition}>
        {children}
      </MotionConfig>
    </LazyMotion>
  )
}
