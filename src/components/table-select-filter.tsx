import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// 단일 선택 필터(예: 상태값 하나 고르기). Radix Select는 value=""를 "선택 안 됨"으로
// 예약해두기 때문에, "전체"를 나타낼 때는 빈 문자열 대신 `ALL_VALUE` 센티넬을 쓴다.
export const TABLE_FILTER_ALL = '__all__'

export interface TableFilterOption {
  label: string
  value: string
}

export function TableSelectFilter({
  ariaLabel,
  value,
  onChange,
  options,
  allLabel,
  className,
}: {
  ariaLabel: string
  value: string
  onChange: (value: string) => void
  options: Array<TableFilterOption>
  allLabel: string
  className?: string
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={ariaLabel} className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={TABLE_FILTER_ALL}>{allLabel}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
