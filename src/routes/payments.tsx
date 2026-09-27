import { createFileRoute } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { statusBadgeClass } from '@/lib/status-badge'

export const Route = createFileRoute('/payments')({ component: Payments })

const STATUS_TONE = {
  결제완료: 'success',
  결제취소: 'neutral',
  결제실패: 'danger',
} as const

const PAYMENTS = [
  {
    id: 'PAY-20260927-0031',
    status: '결제완료' as const,
    approvedAt: '2026-09-27 09:12:04',
    orderNo: 'ORD-20260927-0031',
    pg: 'KG이니시스',
    orderName: '프로 플랜 월 정기구독',
    customer: '한지민',
    method: '카드결제',
    amount: 29000,
  },
  {
    id: 'PAY-20260927-0028',
    status: '결제완료' as const,
    approvedAt: '2026-09-27 08:47:21',
    orderNo: 'ORD-20260927-0028',
    pg: 'KG이니시스',
    orderName: '스타터 플랜 연간 구독',
    customer: '오세훈',
    method: '계좌이체',
    amount: 168000,
  },
  {
    id: 'PAY-20260926-0019',
    status: '결제취소' as const,
    approvedAt: '2026-09-26 21:03:55',
    orderNo: 'ORD-20260926-0019',
    pg: '토스페이먼츠',
    orderName: '프로 플랜 월 정기구독',
    customer: '문수아',
    method: '간편결제',
    amount: 29000,
  },
  {
    id: 'PAY-20260926-0012',
    status: '결제실패' as const,
    approvedAt: '2026-09-26 14:20:09',
    orderNo: 'ORD-20260926-0012',
    pg: 'KG이니시스',
    orderName: '엔터프라이즈 플랜 월 정기구독',
    customer: '배도현',
    method: '카드결제',
    amount: 129000,
  },
]

function Payments() {
  return (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>상태</TableHead>
              <TableHead>승인 시각</TableHead>
              <TableHead>거래번호</TableHead>
              <TableHead>결제대행사</TableHead>
              <TableHead>주문명</TableHead>
              <TableHead>주문자</TableHead>
              <TableHead>결제수단</TableHead>
              <TableHead className="text-right">결제금액</TableHead>
              <TableHead className="w-16" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {PAYMENTS.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={statusBadgeClass(STATUS_TONE[payment.status])}
                  >
                    {payment.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{payment.approvedAt}</TableCell>
                <TableCell className="font-medium">{payment.orderNo}</TableCell>
                <TableCell>{payment.pg}</TableCell>
                <TableCell>{payment.orderName}</TableCell>
                <TableCell>{payment.customer}</TableCell>
                <TableCell>{payment.method}</TableCell>
                <TableCell className="text-right">
                  <span className="font-medium">{payment.amount.toLocaleString()}</span>{' '}
                  <span className="text-xs text-muted-foreground">KRW</span>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={payment.status !== '결제완료'}
                  >
                    취소
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
