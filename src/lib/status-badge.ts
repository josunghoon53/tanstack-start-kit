export type StatusTone = 'success' | 'danger' | 'warning' | 'neutral'

const TONE_CLASS: Record<StatusTone, string> = {
  success:
    'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400',
  danger:
    'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-400',
  warning:
    'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-400',
  neutral:
    'border-border bg-muted text-muted-foreground',
}

export function statusBadgeClass(tone: StatusTone) {
  return TONE_CLASS[tone]
}
