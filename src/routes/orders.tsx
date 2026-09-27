import { createFileRoute } from '@tanstack/react-router'
import { RowActions } from '@/components/row-actions'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { statusBadgeClass } from '@/lib/status-badge'

export const Route = createFileRoute('/orders')({ component: Orders })

const STATUS_TONE = {
  배송중: 'warning',
  완료: 'success',
  취소: 'danger',
} as const

const ORDERS = [
  { id: 'ORD-1042', customer: '김민지', amount: '128,000원', status: '배송중' as const, date: '2026-09-21' },
  { id: 'ORD-1041', customer: '이서준', amount: '54,000원', status: '완료' as const, date: '2026-09-20' },
  { id: 'ORD-1040', customer: '박지훈', amount: '212,500원', status: '완료' as const, date: '2026-09-18' },
  { id: 'ORD-1039', customer: '최유나', amount: '39,900원', status: '취소' as const, date: '2026-09-17' },
]

function Orders() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>주문번호</TableHead>
          <TableHead>고객</TableHead>
          <TableHead>금액</TableHead>
          <TableHead>상태</TableHead>
          <TableHead>주문일</TableHead>
          <TableHead className="w-10" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {ORDERS.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-medium">{order.id}</TableCell>
            <TableCell>{order.customer}</TableCell>
            <TableCell>{order.amount}</TableCell>
            <TableCell>
              <Badge
                variant="outline"
                className={statusBadgeClass(STATUS_TONE[order.status])}
              >
                {order.status}
              </Badge>
            </TableCell>
            <TableCell>{order.date}</TableCell>
            <TableCell>
              <RowActions label={order.id} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
