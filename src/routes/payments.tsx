import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Download, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { SortableTableHead } from '@/components/sortable-table-head'
import { StatusDot } from '@/components/status-dot'
import {
  AnimatedTableBody,
  AnimatedTableRow,
} from '@/components/animated-table-row'
import { TableBulkActionsBar } from '@/components/table-bulk-actions-bar'
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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { usePaginatedSearch } from '@/hooks/use-paginated-search'
import { useRowSelection } from '@/hooks/use-row-selection'
import { useSort } from '@/hooks/use-sort'
import { Card, CardContent } from '@/components/ui/card'
import { downloadCsv, toCsv } from '@/lib/csv'
import { sortItems } from '@/lib/sort'
import { PAYMENT_STATUS_TONE } from '@/config/payments'
import type { PaymentItem, PaymentStatus } from '@/config/payments'
import { paymentsQueryOptions } from '@/server/payments'
import { useTranslation } from '@/i18n/use-translation'

const PAYMENT_STATUSES: Array<PaymentStatus> = [
  '결제완료',
  '결제취소',
  '결제실패',
]

type PaymentSortKey =
  | 'status'
  | 'approvedAt'
  | 'orderNo'
  | 'pg'
  | 'orderName'
  | 'customer'
  | 'method'
  | 'amount'

const PAYMENT_SORT_VALUES: Record<
  PaymentSortKey,
  (payment: PaymentItem) => string | number
> = {
  status: (payment) => payment.status,
  approvedAt: (payment) => payment.approvedAt,
  orderNo: (payment) => payment.orderNo,
  pg: (payment) => payment.pg,
  orderName: (payment) => payment.orderName,
  customer: (payment) => payment.customer,
  method: (payment) => payment.method,
  amount: (payment) => payment.amount,
}

export const Route = createFileRoute('/payments')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(paymentsQueryOptions()),
  component: Payments,
})

function Payments() {
  const t = useTranslation()
  const { data: payments } = useSuspenseQuery(paymentsQueryOptions())
  const [statusFilter, setStatusFilter] = useState(TABLE_FILTER_ALL)
  const { sortKey, direction, toggleSort } = useSort<PaymentSortKey>()
  const sortedPayments = useMemo(
    () =>
      sortItems(
        payments,
        sortKey ? PAYMENT_SORT_VALUES[sortKey] : undefined,
        direction,
      ),
    [payments, sortKey, direction],
  )
  const {
    query,
    setQuery,
    page,
    setPage,
    totalPages,
    pageItems,
    filteredItems,
    totalCount,
  } = usePaginatedSearch(sortedPayments, (payment, q) => {
    const matchesText =
      payment.id.toLowerCase().includes(q) ||
      payment.customer.toLowerCase().includes(q) ||
      payment.orderName.toLowerCase().includes(q)
    const matchesStatus =
      statusFilter === TABLE_FILTER_ALL || payment.status === statusFilter
    return matchesText && matchesStatus
  })
  const selection = useRowSelection<PaymentItem>((payment) => payment.id)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)

  function exportRows(rows: Array<PaymentItem>) {
    const csv = toCsv(rows, [
      { header: t.payments.columns.status, accessor: (p) => p.status },
      { header: t.payments.columns.approvedAt, accessor: (p) => p.approvedAt },
      { header: t.payments.columns.orderNo, accessor: (p) => p.orderNo },
      { header: t.payments.columns.pg, accessor: (p) => p.pg },
      { header: t.payments.columns.orderName, accessor: (p) => p.orderName },
      { header: t.payments.columns.customer, accessor: (p) => p.customer },
      { header: t.payments.columns.method, accessor: (p) => p.method },
      { header: t.payments.columns.amount, accessor: (p) => p.amount },
    ])
    downloadCsv('payments.csv', csv)
  }

  function handleBulkDelete() {
    setBulkDeleteOpen(false)
    toast.success(t.common.deleteSelectedToast(selection.count))
    selection.clear()
  }

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
          <div className="ml-auto flex items-center gap-2">
            <TableBulkActionsBar
              count={selection.count}
              onClear={selection.clear}
            >
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() =>
                  exportRows(
                    pageItems.filter((payment) =>
                      selection.isSelected(payment),
                    ),
                  )
                }
              >
                <Download className="size-4" />
                {t.common.exportCsv}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="gap-2"
                onClick={() => setBulkDeleteOpen(true)}
              >
                <Trash2 className="size-4" />
                {t.common.deleteSelected}
              </Button>
            </TableBulkActionsBar>
            {selection.count === 0 && (
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => exportRows(filteredItems)}
              >
                <Download className="size-4" />
                {t.common.exportCsv}
              </Button>
            )}
          </div>
        </div>
        <Table className="border-y">
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">
                <Checkbox
                  aria-label={t.common.selectAllRows}
                  checked={
                    selection.isAllSelected(pageItems)
                      ? true
                      : selection.isSomeSelected(pageItems)
                        ? 'indeterminate'
                        : false
                  }
                  onCheckedChange={(checked) =>
                    selection.toggleAll(pageItems, checked === true)
                  }
                />
              </TableHead>
              <SortableTableHead
                sortKey="status"
                activeKey={sortKey}
                direction={direction}
                onSort={toggleSort}
              >
                {t.payments.columns.status}
              </SortableTableHead>
              <SortableTableHead
                sortKey="approvedAt"
                activeKey={sortKey}
                direction={direction}
                onSort={toggleSort}
              >
                {t.payments.columns.approvedAt}
              </SortableTableHead>
              <SortableTableHead
                sortKey="orderNo"
                activeKey={sortKey}
                direction={direction}
                onSort={toggleSort}
              >
                {t.payments.columns.orderNo}
              </SortableTableHead>
              <SortableTableHead
                sortKey="pg"
                activeKey={sortKey}
                direction={direction}
                onSort={toggleSort}
              >
                {t.payments.columns.pg}
              </SortableTableHead>
              <SortableTableHead
                sortKey="orderName"
                activeKey={sortKey}
                direction={direction}
                onSort={toggleSort}
              >
                {t.payments.columns.orderName}
              </SortableTableHead>
              <SortableTableHead
                sortKey="customer"
                activeKey={sortKey}
                direction={direction}
                onSort={toggleSort}
              >
                {t.payments.columns.customer}
              </SortableTableHead>
              <SortableTableHead
                sortKey="method"
                activeKey={sortKey}
                direction={direction}
                onSort={toggleSort}
              >
                {t.payments.columns.method}
              </SortableTableHead>
              <SortableTableHead
                sortKey="amount"
                activeKey={sortKey}
                direction={direction}
                onSort={toggleSort}
                className="text-right"
              >
                {t.payments.columns.amount}
              </SortableTableHead>
              <TableHead className="w-16" />
            </TableRow>
          </TableHeader>
          <AnimatedTableBody
            layoutKey={pageItems.map((payment) => payment.id).join('|')}
          >
            {pageItems.map((payment) => (
              <AnimatedTableRow key={payment.id}>
                <TableCell>
                  <Checkbox
                    aria-label={t.common.selectRow(payment.orderNo)}
                    checked={selection.isSelected(payment)}
                    onCheckedChange={(checked) =>
                      selection.toggle(payment, checked === true)
                    }
                  />
                </TableCell>
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
              </AnimatedTableRow>
            ))}
            {pageItems.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="py-10 text-center text-muted-foreground"
                >
                  {t.common.noResults}
                </TableCell>
              </TableRow>
            )}
          </AnimatedTableBody>
        </Table>
        <TablePagination
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          onPageChange={setPage}
        />
      </CardContent>

      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t.common.deleteSelectedTitle(selection.count)}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t.common.deleteSelectedDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleBulkDelete}>
              {t.common.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
