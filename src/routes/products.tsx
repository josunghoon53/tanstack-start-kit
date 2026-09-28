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

export const Route = createFileRoute('/products')({ component: Products })

const STATUS_TONE = {
  판매중: 'success',
  품절: 'danger',
} as const

const PRODUCTS = [
  { name: '무선 이어폰 Pro', category: '전자기기', stock: 128, price: '89,000원', status: '판매중' as const },
  { name: '보온 텀블러 500ml', category: '리빙', stock: 0, price: '18,000원', status: '품절' as const },
  { name: '접이식 노트북 스탠드', category: '전자기기', stock: 54, price: '32,000원', status: '판매중' as const },
  { name: '유기농 핸드크림', category: '뷰티', stock: 12, price: '9,900원', status: '판매중' as const },
]

function Products() {
  const { query, setQuery, page, setPage, totalPages, pageItems, totalCount } =
    usePaginatedSearch(
      PRODUCTS,
      (product, q) =>
        product.name.toLowerCase().includes(q) || product.category.toLowerCase().includes(q),
    )

  return (
    <div className="flex flex-col gap-3">
      <TableSearchInput value={query} onChange={setQuery} placeholder="상품명, 카테고리로 검색" />
      <Table className="border-y">
        <TableHeader>
          <TableRow>
            <TableHead>상품명</TableHead>
            <TableHead>카테고리</TableHead>
            <TableHead>재고</TableHead>
            <TableHead>가격</TableHead>
            <TableHead>상태</TableHead>
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
                <StatusDot tone={STATUS_TONE[product.status]}>{product.status}</StatusDot>
              </TableCell>
              <TableCell>
                <RowActions label={product.name} />
              </TableCell>
            </TableRow>
          ))}
          {pageItems.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
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
