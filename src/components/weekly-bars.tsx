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
