import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { ChevronRight, Download, Trash2 } from 'lucide-react'
import { Fragment, useMemo, useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { RowActions, joinSummary } from '@/components/row-actions'
import { SortableTableHead } from '@/components/sortable-table-head'
import { StatusDot } from '@/components/status-dot'
import {
  AnimatedTableBody,
  AnimatedTableRow,
} from '@/components/animated-table-row'
import { TableBulkActionsBar } from '@/components/table-bulk-actions-bar'
import { TableDateRangeFilter } from '@/components/table-date-range-filter'
import { TablePagination } from '@/components/table-pagination'
import { TableRowDetail } from '@/components/table-row-detail'
import { TableSearchInput } from '@/components/table-search-input'
import {
  TABLE_FILTER_ALL,
  TableSelectFilter,
} from '@/components/table-select-filter'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAccordionGroup } from '@/hooks/use-accordion-group'
import { usePaginatedSearch } from '@/hooks/use-paginated-search'
import { useRowSelection } from '@/hooks/use-row-selection'
import { useSort } from '@/hooks/use-sort'
import { Card, CardContent } from '@/components/ui/card'
import { downloadCsv, toCsv } from '@/lib/csv'
import { isWithinDateRange } from '@/lib/date'
import { sortItems } from '@/lib/sort'
import { cn } from '@/lib/utils'
import { ORDER_STATUS_TONE } from '@/config/orders'
import type { OrderItem, OrderStatus } from '@/config/orders'
import { ordersQueryOptions } from '@/server/orders'
import { useTranslation } from '@/i18n/use-translation'

const ORDER_STATUSES: Array<OrderStatus> = ['배송중', '완료', '취소']

type OrderSortKey = 'id' | 'customer' | 'amount' | 'status' | 'date'

const ORDER_SORT_VALUES: Record<
  OrderSortKey,
  (order: OrderItem) => string | number
> = {
  id: (order) => order.id,
  customer: (order) => order.customer,
  amount: (order) => Number(order.amount.replace(/[^0-9.]/g, '')) || 0,
  status: (order) => order.status,
  date: (order) => order.date,
}

export const Route = createFileRoute('/orders')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(ordersQueryOptions()),
  component: Orders,
})

function Orders() {
  const t = useTranslation()
  const { data: orders } = useSuspenseQuery(ordersQueryOptions())
  const [statusFilter, setStatusFilter] = useState(TABLE_FILTER_ALL)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const { sortKey, direction, toggleSort } = useSort<OrderSortKey>()
  const sortedOrders = useMemo(
    () =>
      sortItems(
        orders,
        sortKey ? ORDER_SORT_VALUES[sortKey] : undefined,
        direction,
      ),
    [orders, sortKey, direction],
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
  } = usePaginatedSearch(sortedOrders, (order, q) => {
    const matchesText =
      order.id.toLowerCase().includes(q) ||
      order.customer.toLowerCase().includes(q)
    const matchesStatus =
      statusFilter === TABLE_FILTER_ALL || order.status === statusFilter
    const matchesDate = isWithinDateRange(order.date, dateRange)
    return matchesText && matchesStatus && matchesDate
  })
  const { isOpen, setOpen } = useAccordionGroup()
  const selection = useRowSelection<OrderItem>((order) => order.id)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)

  function exportRows(rows: Array<OrderItem>) {
    const csv = toCsv(rows, [
      { header: t.orders.columns.id, accessor: (o) => o.id },
      { header: t.orders.columns.customer, accessor: (o) => o.customer },
      { header: t.orders.columns.amount, accessor: (o) => o.amount },
      { header: t.orders.columns.status, accessor: (o) => o.status },
      { header: t.orders.columns.date, accessor: (o) => o.date },
    ])
    downloadCsv('orders.csv', csv)
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
            placeholder={t.orders.searchPlaceholder}
          />
          <TableSelectFilter
            ariaLabel={t.orders.columns.status}
            value={statusFilter}
            onChange={setStatusFilter}
            allLabel={t.common.all}
            options={ORDER_STATUSES.map((status) => ({
              label: status,
              value: status,
            }))}
            className="w-32"
          />
          <TableDateRangeFilter
            value={dateRange}
            onChange={setDateRange}
            placeholder={t.common.dateRangePlaceholder}
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
                    pageItems.filter((order) => selection.isSelected(order)),
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
              <TableHead className="w-8" />
              <SortableTableHead
                sortKey="id"
                activeKey={sortKey}
                direction={direction}
                onSort={toggleSort}
              >
                {t.orders.columns.id}
              </SortableTableHead>
              <SortableTableHead
                sortKey="customer"
                activeKey={sortKey}
                direction={direction}
                onSort={toggleSort}
              >
                {t.orders.columns.customer}
              </SortableTableHead>
              <SortableTableHead
                sortKey="amount"
                activeKey={sortKey}
                direction={direction}
                onSort={toggleSort}
              >
                {t.orders.columns.amount}
              </SortableTableHead>
              <SortableTableHead
                sortKey="status"
                activeKey={sortKey}
                direction={direction}
                onSort={toggleSort}
              >
                {t.orders.columns.status}
              </SortableTableHead>
              <SortableTableHead
                sortKey="date"
                activeKey={sortKey}
                direction={direction}
                onSort={toggleSort}
              >
                {t.orders.columns.date}
              </SortableTableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <AnimatedTableBody
            layoutKey={pageItems.map((order) => order.id).join('|')}
          >
            {pageItems.map((order) => {
              const details = [
                { label: t.orders.columns.customer, value: order.customer },
                { label: t.orders.columns.amount, value: order.amount },
                { label: t.orders.columns.status, value: order.status },
                { label: t.orders.columns.date, value: order.date },
              ]
              const open = isOpen(order.id)

              return (
                <Fragment key={order.id}>
                  <AnimatedTableRow
                    className="cursor-pointer"
                    onClick={() => setOpen(order.id, !open)}
                  >
                    <TableCell onClick={(event) => event.stopPropagation()}>
                      <Checkbox
                        aria-label={t.common.selectRow(order.id)}
                        checked={selection.isSelected(order)}
                        onCheckedChange={(checked) =>
                          selection.toggle(order, checked === true)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <ChevronRight
                        className={cn(
                          'size-4 text-muted-foreground transition-transform',
                          open && 'rotate-90',
                        )}
                      />
                      <span className="sr-only">
                        {open
                          ? t.common.collapseRow(order.id)
                          : t.common.expandRow(order.id)}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{order.amount}</TableCell>
                    <TableCell>
                      <StatusDot tone={ORDER_STATUS_TONE[order.status]}>
                        {order.status}
                      </StatusDot>
                    </TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell onClick={(event) => event.stopPropagation()}>
                      <RowActions
                        label={order.id}
                        details={details}
                        summary={joinSummary(
                          order.customer,
                          `${t.orders.columns.date} ${order.date}`,
                        )}
                        status={{
                          label: order.status,
                          tone: ORDER_STATUS_TONE[order.status],
                        }}
                      />
                    </TableCell>
                  </AnimatedTableRow>
                  {open && <TableRowDetail colSpan={8} details={details} />}
                </Fragment>
              )
            })}
            {pageItems.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
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
