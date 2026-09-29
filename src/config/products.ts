import type { StatusTone } from '@/components/status-dot'

export type ProductStatus = '판매중' | '품절'

export interface ProductItem {
  name: string
  category: string
  stock: number
  price: string
  status: ProductStatus
}

export const PRODUCT_STATUS_TONE: Record<ProductStatus, StatusTone> = {
  판매중: 'success',
  품절: 'danger',
}

export const PRODUCTS: Array<ProductItem> = [
  { name: '무선 이어폰 Pro', category: '전자기기', stock: 128, price: '89,000원', status: '판매중' },
  { name: '보온 텀블러 500ml', category: '리빙', stock: 0, price: '18,000원', status: '품절' },
  { name: '접이식 노트북 스탠드', category: '전자기기', stock: 54, price: '32,000원', status: '판매중' },
  { name: '유기농 핸드크림', category: '뷰티', stock: 12, price: '9,900원', status: '판매중' },
]
