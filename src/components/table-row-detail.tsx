import { TableCell, TableRow } from '@/components/ui/table'
import type { RowDetail } from '@/components/row-actions'

// row-actions.tsx의 Sheet가 보여주는 것과 같은 모양(label/value)의 데이터를,
// 테이블 행을 클릭했을 때 펼쳐지는 아코디언 행으로도 보여준다 — 리스트 페이지에서
// details 배열 하나를 RowActions와 이 컴포넌트 양쪽에 그대로 재사용한다.
export function TableRowDetail({
  colSpan,
  details,
}: {
  colSpan: number
  details: Array<RowDetail>
}) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={colSpan} className="bg-muted/30 py-4">
        <div className="grid grid-cols-4 gap-4">
          {details.map((detail) => (
            <div key={detail.label} className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">
                {detail.label}
              </span>
              <span className="text-sm font-medium">{detail.value}</span>
            </div>
          ))}
        </div>
      </TableCell>
    </TableRow>
  )
}
