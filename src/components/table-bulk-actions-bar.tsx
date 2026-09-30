import { Button } from '@/components/ui/button'
import { useTranslation } from '@/i18n/use-translation'

// 체크박스로 하나 이상 선택됐을 때만 나타나는 툴바. 실제 액션 버튼(삭제/내보내기 등)은
// children으로 넘겨서, 페이지마다 다른 일괄 작업을 자유롭게 조합할 수 있게 한다.
export function TableBulkActionsBar({
  count,
  onClear,
  children,
}: {
  count: number
  onClear: () => void
  children: React.ReactNode
}) {
  const t = useTranslation()

  if (count === 0) return null

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">
        {t.common.selectedCount(count)}
      </span>
      {children}
      <Button variant="ghost" size="sm" onClick={onClear}>
        {t.common.clearSelection}
      </Button>
    </div>
  )
}
