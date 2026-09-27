import { cn } from '@/lib/utils'

export type StatusTone = 'success' | 'danger' | 'warning' | 'neutral'

const DOT_COLOR: Record<StatusTone, string> = {
  success: 'bg-emerald-500',
  danger: 'bg-red-500',
  warning: 'bg-amber-500',
  neutral: 'bg-muted-foreground',
}

export function StatusDot({
  tone,
  children,
}: {
  tone: StatusTone
  children: React.ReactNode
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-foreground">
      <span className={cn('size-1.5 shrink-0 rounded-full', DOT_COLOR[tone])} />
      {children}
    </span>
  )
}
