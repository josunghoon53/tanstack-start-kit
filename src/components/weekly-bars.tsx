import { m } from 'motion/react'
import { cn } from '@/lib/utils'
import { STAGGER, duration, ease } from '@/lib/motion'

interface WeeklyBarsProps {
  values: Array<number>
  label: string
  // 첫 막대가 자라기 시작하는 지연(초). 대시보드 카드 진입 순서에 맞춘다.
  delay?: number
}

// 가장 큰 값을 100%로 맞춘 단순 막대. 마지막(가장 최근) 막대만 포인트색으로 강조한다.
// 마운트할 때 막대가 바닥에서부터 차례로 자란다(scaleY, transform이라 동작 줄이기면 즉시 끝난다).
export function WeeklyBars({ values, label, delay = 0 }: WeeklyBarsProps) {
  const max = Math.max(...values, 1)

  return (
    <div role="img" aria-label={label} className="flex h-24 items-end gap-1.5">
      {values.map((value, index) => (
        <m.div
          key={index}
          data-bar
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{
            duration: duration.slow,
            ease: ease.out,
            delay: delay + index * (STAGGER / 2),
          }}
          className={cn(
            'flex-1 origin-bottom rounded-t-sm',
            index === values.length - 1 ? 'bg-primary' : 'bg-muted',
          )}
          style={{ height: `${(value / max) * 100}%` }}
        />
      ))}
    </div>
  )
}
