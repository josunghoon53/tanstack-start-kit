export type OrderStatus = '배송중' | '완료' | '취소'

export interface OrderItem {
  id: string
  customer: string
  amount: string
  status: OrderStatus
  date: string
}

export const ORDER_STATUS_TONE: Record<OrderStatus, 'warning' | 'success' | 'danger'> = {
  배송중: 'warning',
  완료: 'success',
  취소: 'danger',
}

export const ORDERS: Array<OrderItem> = [
  { id: 'ORD-1042', customer: '김민지', amount: '128,000원', status: '배송중', date: '2026-09-21' },
  { id: 'ORD-1041', customer: '이서준', amount: '54,000원', status: '완료', date: '2026-09-20' },
  { id: 'ORD-1040', customer: '박지훈', amount: '212,500원', status: '완료', date: '2026-09-18' },
  { id: 'ORD-1039', customer: '최유나', amount: '39,900원', status: '취소', date: '2026-09-17' },
]
