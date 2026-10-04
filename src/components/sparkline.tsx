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
        className={
          tone === 'positive' ? 'stroke-success' : 'stroke-destructive'
        }
      />
    </svg>
  )
}
