import { createFileRoute } from '@tanstack/react-router'
import { RowActions } from '@/components/row-actions'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export const Route = createFileRoute('/products')({ component: Products })

const PRODUCTS = [
  { name: '무선 이어폰 Pro', category: '전자기기', stock: 128, price: '89,000원', status: '판매중' as const },
  { name: '보온 텀블러 500ml', category: '리빙', stock: 0, price: '18,000원', status: '품절' as const },
  { name: '접이식 노트북 스탠드', category: '전자기기', stock: 54, price: '32,000원', status: '판매중' as const },
  { name: '유기농 핸드크림', category: '뷰티', stock: 12, price: '9,900원', status: '판매중' as const },
]

function Products() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>상품</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
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
            {PRODUCTS.map((product) => (
              <TableRow key={product.name}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>{product.price}</TableCell>
                <TableCell>
                  <Badge variant={product.status === '판매중' ? 'default' : 'destructive'}>
                    {product.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <RowActions label={product.name} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
