import { CalendarIcon } from 'lucide-react'
import type { DateRange } from 'react-day-picker'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

function formatDate(date: Date) {
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

// 날짜 범위 필터. 값은 react-day-picker의 DateRange 그대로 들고 있다가, 실제
// "이 행이 범위 안에 있는지" 비교는 호출부에서 `isWithinDateRange`(@/lib/date)로 한다 —
// 이 컴포넌트는 순수하게 범위를 고르는 UI만 맡는다.
export function TableDateRangeFilter({
  value,
  onChange,
  placeholder,
}: {
  value: DateRange | undefined
  onChange: (range: DateRange | undefined) => void
  placeholder: string
}) {
  const label = value?.from
    ? value.to
      ? `${formatDate(value.from)} - ${formatDate(value.to)}`
      : formatDate(value.from)
    : placeholder

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn('gap-2', !value?.from && 'text-muted-foreground')}
        >
          <CalendarIcon className="size-4" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={value}
          onSelect={onChange}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  )
}
