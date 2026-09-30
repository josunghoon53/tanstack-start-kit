import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/i18n/use-translation'

export function TablePagination({
  page,
  totalPages,
  totalCount,
  onPageChange,
}: {
  page: number
  totalPages: number
  totalCount: number
  onPageChange: (page: number) => void
}) {
  const t = useTranslation()

  return (
    <div className="flex items-center justify-between pt-3">
      <span className="text-sm text-muted-foreground">
        {t.common.totalCount(totalCount)}
      </span>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {page} / {totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  )
}
