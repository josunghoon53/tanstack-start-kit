import { createFileRoute } from '@tanstack/react-router'
import { RowActions } from '@/components/row-actions'
import { StatusDot } from '@/components/status-dot'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ORDER_STATUS_TONE, ORDERS } from '@/config/orders'

export const Route = createFileRoute('/orders')({ component: Orders })

function Orders() {
  return (
    <Table className="border-y">
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
              <StatusDot tone={ORDER_STATUS_TONE[order.status]}>{order.status}</StatusDot>
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
