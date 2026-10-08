import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { ChevronRight, Download, Trash2 } from 'lucide-react'
import { Fragment, useMemo, useState } from 'react'
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
import { TableMultiSelectFilter } from '@/components/table-multi-select-filter'
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
import { sortItems } from '@/lib/sort'
import { cn } from '@/lib/utils'
import { PRODUCT_STATUS_TONE } from '@/config/products'
import type { ProductItem, ProductStatus } from '@/config/products'
import { productsQueryOptions } from '@/server/products'
import { useTranslation } from '@/i18n/use-translation'

const PRODUCT_STATUSES: Array<ProductStatus> = ['판매중', '품절']

type ProductSortKey = 'name' | 'category' | 'stock' | 'price' | 'status'

const PRODUCT_SORT_VALUES: Record<
  ProductSortKey,
  (product: ProductItem) => string | number
> = {
  name: (product) => product.name,
  category: (product) => product.category,
  stock: (product) => product.stock,
  price: (product) => Number(product.price.replace(/[^0-9.]/g, '')) || 0,
  status: (product) => product.status,
}

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
  const { sortKey, direction, toggleSort } = useSort<ProductSortKey>()
  const sortedProducts = useMemo(
    () =>
      sortItems(
        products,
        sortKey ? PRODUCT_SORT_VALUES[sortKey] : undefined,
        direction,
      ),
    [products, sortKey, direction],
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
  } = usePaginatedSearch(sortedProducts, (product, q) => {
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
  const selection = useRowSelection<ProductItem>((product) => product.name)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)

  function exportRows(rows: Array<ProductItem>) {
    const csv = toCsv(rows, [
      { header: t.products.columns.name, accessor: (p) => p.name },
      { header: t.products.columns.category, accessor: (p) => p.category },
      { header: t.products.columns.stock, accessor: (p) => p.stock },
      { header: t.products.columns.price, accessor: (p) => p.price },
      { header: t.products.columns.status, accessor: (p) => p.status },
    ])
    downloadCsv('products.csv', csv)
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
                    pageItems.filter((product) =>
                      selection.isSelected(product),
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
              <TableHead className="w-8" />
              <SortableTableHead
                sortKey="name"
                activeKey={sortKey}
                direction={direction}
                onSort={toggleSort}
              >
                {t.products.columns.name}
              </SortableTableHead>
              <SortableTableHead
                sortKey="category"
                activeKey={sortKey}
                direction={direction}
                onSort={toggleSort}
              >
                {t.products.columns.category}
              </SortableTableHead>
              <SortableTableHead
                sortKey="stock"
                activeKey={sortKey}
                direction={direction}
                onSort={toggleSort}
              >
                {t.products.columns.stock}
              </SortableTableHead>
              <SortableTableHead
                sortKey="price"
                activeKey={sortKey}
                direction={direction}
                onSort={toggleSort}
              >
                {t.products.columns.price}
              </SortableTableHead>
              <SortableTableHead
                sortKey="status"
                activeKey={sortKey}
                direction={direction}
                onSort={toggleSort}
              >
                {t.products.columns.status}
              </SortableTableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <AnimatedTableBody
            layoutKey={pageItems.map((product) => product.name).join('|')}
          >
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
                  <AnimatedTableRow
                    className="cursor-pointer"
                    onClick={() => setOpen(product.name, !open)}
                  >
                    <TableCell onClick={(event) => event.stopPropagation()}>
                      <Checkbox
                        aria-label={t.common.selectRow(product.name)}
                        checked={selection.isSelected(product)}
                        onCheckedChange={(checked) =>
                          selection.toggle(product, checked === true)
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
                      <RowActions
                        label={product.name}
                        details={details}
                        summary={joinSummary(
                          product.category,
                          `${t.products.columns.price} ${product.price}`,
                        )}
                        status={{
                          label: product.status,
                          tone: PRODUCT_STATUS_TONE[product.status],
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
