import type { ComponentType } from 'react'
import { Bell, CreditCard, Package, UserPlus } from 'lucide-react'

export type NotificationCategory = '가입' | '주문' | '결제' | '재고'

export interface NotificationItem {
  icon: ComponentType<{ className?: string }>
  category: NotificationCategory
  message: string
  time: string
}

export const NOTIFICATION_CATEGORIES: Array<NotificationCategory> = [
  '가입',
  '주문',
  '결제',
  '재고',
]

export const NOTIFICATIONS: Array<NotificationItem> = [
  {
    icon: UserPlus,
    category: '가입',
    message: '최유나 님이 새로 가입했어요.',
    time: '5분 전',
  },
  {
    icon: Package,
    category: '주문',
    message: 'ORD-1042 주문이 배송을 시작했어요.',
    time: '32분 전',
  },
  {
    icon: CreditCard,
    category: '결제',
    message: 'PAY-9078 결제가 환불 처리됐어요.',
    time: '1시간 전',
  },
  {
    icon: Bell,
    category: '재고',
    message: '무선 이어폰 Pro 재고가 소진됐어요.',
    time: '어제',
  },
  {
    icon: UserPlus,
    category: '가입',
    message: '박정우 님이 새로 가입했어요.',
    time: '어제',
  },
  {
    icon: CreditCard,
    category: '결제',
    message: 'PAY-9081 결제가 완료됐어요.',
    time: '2일 전',
  },
]
