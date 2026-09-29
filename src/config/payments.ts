import type { StatusTone } from '@/components/status-dot'

export type PaymentStatus = '결제완료' | '결제취소' | '결제실패'

export interface PaymentItem {
  id: string
  status: PaymentStatus
  approvedAt: string
  orderNo: string
  pg: string
  orderName: string
  customer: string
  method: string
  amount: number
}

export const PAYMENT_STATUS_TONE: Record<PaymentStatus, StatusTone> = {
  결제완료: 'success',
  결제취소: 'neutral',
  결제실패: 'danger',
}

export const PAYMENTS: Array<PaymentItem> = [
  {
    id: 'PAY-20260927-0031',
    status: '결제완료',
    approvedAt: '2026-09-27 09:12:04',
    orderNo: 'ORD-20260927-0031',
    pg: 'KG이니시스',
    orderName: '프로 플랜 월 정기구독',
    customer: '한지민',
    method: '카드결제',
    amount: 29000,
  },
  {
    id: 'PAY-20260927-0028',
    status: '결제완료',
    approvedAt: '2026-09-27 08:47:21',
    orderNo: 'ORD-20260927-0028',
    pg: 'KG이니시스',
    orderName: '스타터 플랜 연간 구독',
    customer: '오세훈',
    method: '계좌이체',
    amount: 168000,
  },
  {
    id: 'PAY-20260926-0019',
    status: '결제취소',
    approvedAt: '2026-09-26 21:03:55',
    orderNo: 'ORD-20260926-0019',
    pg: '토스페이먼츠',
    orderName: '프로 플랜 월 정기구독',
    customer: '문수아',
    method: '간편결제',
    amount: 29000,
  },
  {
    id: 'PAY-20260926-0012',
    status: '결제실패',
    approvedAt: '2026-09-26 14:20:09',
    orderNo: 'ORD-20260926-0012',
    pg: 'KG이니시스',
    orderName: '엔터프라이즈 플랜 월 정기구독',
    customer: '배도현',
    method: '카드결제',
    amount: 129000,
  },
]
