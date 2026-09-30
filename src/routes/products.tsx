import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { Fragment, useMemo, useState } from 'react'
import { RowActions } from '@/components/row-actions'
import { StatusDot } from '@/components/status-dot'
import { TableMultiSelectFilter } from '@/components/table-multi-select-filter'
import { TablePagination } from '@/components/table-pagination'
import { TableRowDetail } from '@/components/table-row-detail'
import { TableSearchInput } from '@/components/table-search-input'
import {
  TABLE_FILTER_ALL,
  TableSelectFilter,
} from '@/components/table-select-filter'
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
import { PRODUCT_STATUS_TONE } from '@/config/products'
import type { ProductStatus } from '@/config/products'
import { productsQueryOptions } from '@/server/products'
import { useTranslation } from '@/i18n/use-translation'

const PRODUCT_STATUSES: Array<ProductStatus> = ['판매중', '품절']

export const Route = createFileRoute('/products')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(productsQueryOptions()),
  component: Products,
})

function Products() {
  const t = useTranslation()
  const { data: products } = useSuspenseQuery(productsQueryOptions())
  const categories = useMemo(
    () =>
      Array.from(new Set(products.map((product) => product.category))).sort(),
    [products],
  )
  const [categoryFilter, setCategoryFilter] = useState<Array<string>>([])
  const [statusFilter, setStatusFilter] = useState(TABLE_FILTER_ALL)
  const { query, setQuery, page, setPage, totalPages, pageItems, totalCount } =
    usePaginatedSearch(products, (product, q) => {
      const matchesText =
        product.name.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q)
      const matchesCategory =
        categoryFilter.length === 0 || categoryFilter.includes(product.category)
      const matchesStatus =
        statusFilter === TABLE_FILTER_ALL || product.status === statusFilter
      return matchesText && matchesCategory && matchesStatus
    })
  const { isOpen, setOpen } = useAccordionGroup()

  return (
    <Card className="flex-1">
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <TableSearchInput
            value={query}
            onChange={setQuery}
            placeholder={t.products.searchPlaceholder}
          />
          <TableMultiSelectFilter
            label={t.products.columns.category}
            options={categories.map((category) => ({
              label: category,
              value: category,
            }))}
            selected={categoryFilter}
            onChange={setCategoryFilter}
          />
          <TableSelectFilter
            ariaLabel={t.products.columns.status}
            value={statusFilter}
            onChange={setStatusFilter}
            allLabel={t.common.all}
            options={PRODUCT_STATUSES.map((status) => ({
              label: status,
              value: status,
            }))}
            className="w-32"
          />
        </div>
        <Table className="border-y">
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>{t.products.columns.name}</TableHead>
              <TableHead>{t.products.columns.category}</TableHead>
              <TableHead>{t.products.columns.stock}</TableHead>
              <TableHead>{t.products.columns.price}</TableHead>
              <TableHead>{t.products.columns.status}</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.map((product) => {
              const details = [
                {
                  label: t.products.columns.category,
                  value: product.category,
                },
                { label: t.products.columns.stock, value: product.stock },
                { label: t.products.columns.price, value: product.price },
                { label: t.products.columns.status, value: product.status },
              ]
              const open = isOpen(product.name)

              return (
                <Fragment key={product.name}>
                  <TableRow
                    className="cursor-pointer"
                    onClick={() => setOpen(product.name, !open)}
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
                          ? t.common.collapseRow(product.name)
                          : t.common.expandRow(product.name)}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>{product.price}</TableCell>
                    <TableCell>
                      <StatusDot tone={PRODUCT_STATUS_TONE[product.status]}>
                        {product.status}
                      </StatusDot>
                    </TableCell>
                    <TableCell onClick={(event) => event.stopPropagation()}>
                      <RowActions label={product.name} details={details} />
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
