import { useEffect, useLayoutEffect, useRef } from 'react'
import {
  MotionGlobalConfig,
  animate,
  m,
  useMotionValue,
  useReducedMotion,
} from 'motion/react'
import { duration, ease } from '@/lib/motion'

export type ParsedNumber = {
  prefix: string
  value: number
  suffix: string
  decimals: number
  grouped: boolean
}

// "₩1,240,000" → { prefix: '₩', value: 1240000, suffix: '' }, "18건" → { value: 18, suffix: '건' }.
// 숫자 부분이 없거나("-") 숫자로 읽을 수 없으면 null — 그때는 글자를 그대로 보여준다.
export function parseAnimatedNumber(text: string): ParsedNumber | null {
  const match = /-?\d[\d,]*(?:\.\d+)?/.exec(text)
  if (!match) {
    return null
  }
  const raw = match[0]
  const value = Number(raw.replace(/,/g, ''))
  if (!Number.isFinite(value)) {
    return null
  }
  const fraction = raw.split('.')[1] as string | undefined
  return {
    prefix: text.slice(0, match.index),
    value,
    suffix: text.slice(match.index + raw.length),
    decimals: fraction ? fraction.length : 0,
    grouped: raw.includes(','),
  }
}

// 중간 값을 원래 글자 모양(접두/접미사, 소수 자릿수, 천 단위 쉼표)대로 다시 쓴다.
export function formatAnimatedNumber(parsed: ParsedNumber, current: number) {
  const number = current.toLocaleString('en-US', {
    minimumFractionDigits: parsed.decimals,
    maximumFractionDigits: parsed.decimals,
    useGrouping: parsed.grouped,
  })
  return `${parsed.prefix}${number}${parsed.suffix}`
}

// 서버에서는 경고 없이 넘어가고 브라우저에서는 페인트 전에 0으로 되돌리기 위한 훅.
const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect

interface AnimatedNumberProps {
  value: string
  delay?: number
  className?: string
}

// KPI처럼 포맷된 숫자 문자열을 0부터 세어 올린다. 서버 렌더·하이드레이션 첫 렌더는 항상 최종 글자라
// SSR 불일치가 없고, 마운트 직후(페인트 전) 0으로 바꿔 카운트업을 시작한다. 끝나면 원래 문자열과 정확히 같다.
// 동작 줄이기(prefers-reduced-motion)나 MotionGlobalConfig.skipAnimations면 바로 최종 값을 보여준다.
export function AnimatedNumber({
  value,
  delay = 0,
  className,
}: AnimatedNumberProps) {
  const display = useMotionValue(value)
  const reduceMotion = useReducedMotion()
  const hasAnimated = useRef(false)

  useIsomorphicLayoutEffect(() => {
    const parsed = parseAnimatedNumber(value)
    // 처음 한 번만 센다. 이후 값이 바뀌면(로케일 전환 등) 바로 새 글자로 바꾼다.
    if (
      hasAnimated.current ||
      !parsed ||
      reduceMotion ||
      MotionGlobalConfig.skipAnimations
    ) {
      display.set(value)
      return
    }
    hasAnimated.current = true
    let completed = false
    display.set(formatAnimatedNumber(parsed, 0))
    const controls = animate(0, parsed.value, {
      duration: duration.count,
      ease: ease.out,
      delay,
      onUpdate: (current) => display.set(formatAnimatedNumber(parsed, current)),
      onComplete: () => {
        completed = true
        display.set(value)
      },
    })
    return () => {
      controls.stop()
      display.set(value)
      // 끝나기 전에 정리되면(StrictMode의 이중 실행 등) 다음 실행에서 다시 센다.
      if (!completed) {
        hasAnimated.current = false
      }
    }
  }, [value])

  return <m.span className={className}>{display}</m.span>
}
