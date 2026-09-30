import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { Fragment } from 'react'
import { RowActions } from '@/components/row-actions'
import { StatusDot } from '@/components/status-dot'
import { TablePagination } from '@/components/table-pagination'
import { TableRowDetail } from '@/components/table-row-detail'
import { TableSearchInput } from '@/components/table-search-input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAccordionGroup } from '@/hooks/use-accordion-group'
import { usePaginatedSearch } from '@/hooks/use-paginated-search'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ORDER_STATUS_TONE } from '@/config/orders'
import { ordersQueryOptions } from '@/server/orders'
import { useTranslation } from '@/i18n/use-translation'

export const Route = createFileRoute('/orders')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(ordersQueryOptions()),
  component: Orders,
})

function Orders() {
  const t = useTranslation()
  const { data: orders } = useSuspenseQuery(ordersQueryOptions())
  const { query, setQuery, page, setPage, totalPages, pageItems, totalCount } =
    usePaginatedSearch(
      orders,
      (order, q) =>
        order.id.toLowerCase().includes(q) ||
        order.customer.toLowerCase().includes(q),
    )
  const { isOpen, setOpen } = useAccordionGroup()

  return (
    <Card className="flex-1">
      <CardContent className="flex flex-col gap-3">
        <TableSearchInput
          value={query}
          onChange={setQuery}
          placeholder={t.orders.searchPlaceholder}
        />
        <Table className="border-y">
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>{t.orders.columns.id}</TableHead>
              <TableHead>{t.orders.columns.customer}</TableHead>
              <TableHead>{t.orders.columns.amount}</TableHead>
              <TableHead>{t.orders.columns.status}</TableHead>
              <TableHead>{t.orders.columns.date}</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
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
                  <TableRow
                    className="cursor-pointer"
                    onClick={() => setOpen(order.id, !open)}
                  >
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
                      <RowActions label={order.id} details={details} />
                    </TableCell>
                  </TableRow>
                  {open && <TableRowDetail colSpan={7} details={details} />}
                </Fragment>
              )
            })}
            {pageItems.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
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
