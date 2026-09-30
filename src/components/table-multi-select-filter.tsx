import { ListFilter } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { TableFilterOption } from './table-select-filter'

// 다중 선택 필터(예: 카테고리 여러 개 동시 선택). 체크박스 항목을 클릭해도 메뉴가
// 닫히지 않아야 여러 개를 연달아 고를 수 있어서, onSelect에서 기본 동작을 막는다.
export function TableMultiSelectFilter({
  label,
  options,
  selected,
  onChange,
}: {
  label: string
  options: Array<TableFilterOption>
  selected: Array<string>
  onChange: (next: Array<string>) => void
}) {
  function toggle(value: string, checked: boolean) {
    onChange(
      checked ? [...selected, value] : selected.filter((v) => v !== value),
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <ListFilter className="size-4" />
          {label}
          {selected.length > 0 && (
            <Badge variant="secondary">{selected.length}</Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={selected.includes(option.value)}
            onSelect={(event) => event.preventDefault()}
            onCheckedChange={(checked) => toggle(option.value, checked)}
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
