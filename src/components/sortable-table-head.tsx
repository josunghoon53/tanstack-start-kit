import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { TableHead } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { SortDirection } from '@/hooks/use-sort'

// 클릭 가능한 정렬 헤더. `useSort`가 관리하는 activeKey/direction과 이 헤더의
// sortKey가 같은지 비교해서 위/아래 화살표를 보여주고, 다르면 흐린 중립 아이콘을 보여준다.
export function SortableTableHead<K extends string>({
  sortKey,
  activeKey,
  direction,
  onSort,
  className,
  children,
}: {
  sortKey: K
  activeKey: K | undefined
  direction: SortDirection
  onSort: (key: K) => void
  className?: string
  children: React.ReactNode
}) {
  const isActive = activeKey === sortKey

  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn(
          'flex items-center gap-1 hover:text-foreground',
          !isActive && 'text-muted-foreground',
        )}
      >
        {children}
        {isActive ? (
          direction === 'asc' ? (
            <ArrowUp className="size-3.5" />
          ) : (
            <ArrowDown className="size-3.5" />
          )
        ) : (
          <ArrowUpDown className="size-3.5 text-muted-foreground/50" />
        )}
      </button>
    </TableHead>
  )
}
