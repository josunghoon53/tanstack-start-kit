import { m, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'
import { duration, ease } from '@/lib/motion'

const WIDTH = 72
const HEIGHT = 22

interface SparklineProps {
  values: Array<number>
  tone: 'positive' | 'negative'
  className?: string
  // 선이 그려지기 시작하는 지연(초). 대시보드 카드 진입 순서에 맞춘다.
  delay?: number
}

// KPI 카드 옆의 장식용 미니 추세선. 값이 클수록 위로 그린다. 스크린리더에는 숨긴다.
// 마운트할 때 왼쪽에서 오른쪽으로 선이 그려진다(pathLength). 동작 줄이기면 바로 다 그린다.
export function Sparkline({
  values,
  tone,
  className,
  delay = 0,
}: SparklineProps) {
  const reduceMotion = useReducedMotion()

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
      <m.polyline
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: duration.slow + 0.15, ease: ease.out, delay }
        }
        points={points}
        fill="none"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={
          tone === 'positive' ? 'stroke-success' : 'stroke-destructive'
        }
      />
    </svg>
  )
}
