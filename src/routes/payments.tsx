import { createFileRoute } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export const Route = createFileRoute('/payments')({ component: Payments })

const STATUS_VARIANT = {
  완료: 'default',
  대기: 'outline',
  환불: 'destructive',
} as const

const PAYMENTS = [
  { id: 'PAY-9081', customer: '김민지', amount: '128,000원', method: '신용카드', status: '완료' as const, date: '2026-09-21' },
  { id: 'PAY-9080', customer: '이서준', amount: '54,000원', method: '계좌이체', status: '대기' as const, date: '2026-09-20' },
  { id: 'PAY-9079', customer: '박지훈', amount: '212,500원', method: '신용카드', status: '완료' as const, date: '2026-09-18' },
  { id: 'PAY-9078', customer: '최유나', amount: '39,900원', method: '간편결제', status: '환불' as const, date: '2026-09-17' },
]

function Payments() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>결제</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>결제ID</TableHead>
              <TableHead>고객</TableHead>
              <TableHead>금액</TableHead>
              <TableHead>결제수단</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>날짜</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {PAYMENTS.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="font-medium">{payment.id}</TableCell>
                <TableCell>{payment.customer}</TableCell>
                <TableCell>{payment.amount}</TableCell>
                <TableCell>{payment.method}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[payment.status]}>{payment.status}</Badge>
                </TableCell>
                <TableCell>{payment.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
