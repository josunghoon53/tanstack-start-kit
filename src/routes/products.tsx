import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { RowActions } from '@/components/row-actions'
import { StatusDot } from '@/components/status-dot'
import { TablePagination } from '@/components/table-pagination'
import { TableSearchInput } from '@/components/table-search-input'
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
import { PRODUCT_STATUS_TONE } from '@/config/products'
import { productsQueryOptions } from '@/server/products'
import { useTranslation } from '@/i18n/use-translation'

export const Route = createFileRoute('/products')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(productsQueryOptions()),
  component: Products,
})

function Products() {
  const t = useTranslation()
  const { data: products } = useSuspenseQuery(productsQueryOptions())
  const { query, setQuery, page, setPage, totalPages, pageItems, totalCount } =
    usePaginatedSearch(
      products,
      (product, q) =>
        product.name.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q),
    )

  return (
    <Card className="flex-1">
      <CardContent className="flex flex-col gap-3">
        <TableSearchInput
          value={query}
          onChange={setQuery}
          placeholder={t.products.searchPlaceholder}
        />
        <Table className="border-y">
          <TableHeader>
            <TableRow>
              <TableHead>{t.products.columns.name}</TableHead>
              <TableHead>{t.products.columns.category}</TableHead>
              <TableHead>{t.products.columns.stock}</TableHead>
              <TableHead>{t.products.columns.price}</TableHead>
              <TableHead>{t.products.columns.status}</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.map((product) => (
              <TableRow key={product.name}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>{product.price}</TableCell>
                <TableCell>
                  <StatusDot tone={PRODUCT_STATUS_TONE[product.status]}>
                    {product.status}
                  </StatusDot>
                </TableCell>
                <TableCell>
                  <RowActions label={product.name} />
                </TableCell>
              </TableRow>
            ))}
            {pageItems.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
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
