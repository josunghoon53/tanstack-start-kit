import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { StatusDot } from '@/components/status-dot'
import { TablePagination } from '@/components/table-pagination'
import { TableSearchInput } from '@/components/table-search-input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { usePaginatedSearch } from '@/hooks/use-paginated-search'

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
  const { query, setQuery, page, setPage, totalPages, pageItems, totalCount } =
    usePaginatedSearch(
      PAYMENTS,
      (payment, q) =>
        payment.id.toLowerCase().includes(q) ||
        payment.customer.toLowerCase().includes(q) ||
        payment.orderName.toLowerCase().includes(q),
    )

  return (
    <div className="flex flex-col gap-3">
      <TableSearchInput value={query} onChange={setQuery} placeholder="거래번호, 주문자, 주문명으로 검색" />
      <Table className="border-y">
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
          {pageItems.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>
                <StatusDot tone={STATUS_TONE[payment.status]}>{payment.status}</StatusDot>
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
                <CancelPaymentAction
                  orderName={payment.orderName}
                  disabled={payment.status !== '결제완료'}
                />
              </TableCell>
            </TableRow>
          ))}
          {pageItems.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                검색 결과가 없어요.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <TablePagination
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        onPageChange={setPage}
      />
    </div>
  )
}

function CancelPaymentAction({
  orderName,
  disabled,
}: {
  orderName: string
  disabled: boolean
}) {
  const [open, setOpen] = useState(false)

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled}>
          취소
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>결제를 취소할까요?</AlertDialogTitle>
          <AlertDialogDescription>
            {orderName} 결제가 취소되고 고객에게 환불 처리돼요. 이 작업은 되돌릴 수 없어요.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>닫기</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => toast.success(`${orderName} 결제가 취소됐어요.`)}
          >
            결제 취소
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
