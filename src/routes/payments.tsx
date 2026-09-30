import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { StatusDot } from '@/components/status-dot'
import { TablePagination } from '@/components/table-pagination'
import { TableSearchInput } from '@/components/table-search-input'
import {
  TABLE_FILTER_ALL,
  TableSelectFilter,
} from '@/components/table-select-filter'
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
import { Card, CardContent } from '@/components/ui/card'
import { PAYMENT_STATUS_TONE } from '@/config/payments'
import type { PaymentStatus } from '@/config/payments'
import { paymentsQueryOptions } from '@/server/payments'
import { useTranslation } from '@/i18n/use-translation'

const PAYMENT_STATUSES: Array<PaymentStatus> = [
  '결제완료',
  '결제취소',
  '결제실패',
]

export const Route = createFileRoute('/payments')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(paymentsQueryOptions()),
  component: Payments,
})

function Payments() {
  const t = useTranslation()
  const { data: payments } = useSuspenseQuery(paymentsQueryOptions())
  const [statusFilter, setStatusFilter] = useState(TABLE_FILTER_ALL)
  const { query, setQuery, page, setPage, totalPages, pageItems, totalCount } =
    usePaginatedSearch(payments, (payment, q) => {
      const matchesText =
        payment.id.toLowerCase().includes(q) ||
        payment.customer.toLowerCase().includes(q) ||
        payment.orderName.toLowerCase().includes(q)
      const matchesStatus =
        statusFilter === TABLE_FILTER_ALL || payment.status === statusFilter
      return matchesText && matchesStatus
    })

  return (
    <Card className="flex-1">
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <TableSearchInput
            value={query}
            onChange={setQuery}
            placeholder={t.payments.searchPlaceholder}
          />
          <TableSelectFilter
            ariaLabel={t.payments.columns.status}
            value={statusFilter}
            onChange={setStatusFilter}
            allLabel={t.common.all}
            options={PAYMENT_STATUSES.map((status) => ({
              label: status,
              value: status,
            }))}
            className="w-32"
          />
        </div>
        <Table className="border-y">
          <TableHeader>
            <TableRow>
              <TableHead>{t.payments.columns.status}</TableHead>
              <TableHead>{t.payments.columns.approvedAt}</TableHead>
              <TableHead>{t.payments.columns.orderNo}</TableHead>
              <TableHead>{t.payments.columns.pg}</TableHead>
              <TableHead>{t.payments.columns.orderName}</TableHead>
              <TableHead>{t.payments.columns.customer}</TableHead>
              <TableHead>{t.payments.columns.method}</TableHead>
              <TableHead className="text-right">
                {t.payments.columns.amount}
              </TableHead>
              <TableHead className="w-16" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>
                  <StatusDot tone={PAYMENT_STATUS_TONE[payment.status]}>
                    {payment.status}
                  </StatusDot>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {payment.approvedAt}
                </TableCell>
                <TableCell className="font-medium">{payment.orderNo}</TableCell>
                <TableCell>{payment.pg}</TableCell>
                <TableCell>{payment.orderName}</TableCell>
                <TableCell>{payment.customer}</TableCell>
                <TableCell>{payment.method}</TableCell>
                <TableCell className="text-right">
                  <span className="font-medium">
                    {payment.amount.toLocaleString()}
                  </span>{' '}
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
                <TableCell
                  colSpan={9}
                  className="py-10 text-center text-muted-foreground"
                >
                  {t.common.noResults}
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
      </CardContent>
    </Card>
  )
}

function CancelPaymentAction({
  orderName,
  disabled,
}: {
  orderName: string
  disabled: boolean
}) {
  const t = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled}>
          {t.payments.cancelAction.button}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t.payments.cancelAction.dialogTitle}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t.payments.cancelAction.dialogDescription(orderName)}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t.payments.cancelAction.close}</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() =>
              toast.success(t.payments.cancelAction.successToast(orderName))
            }
          >
            {t.payments.cancelAction.confirmButton}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
