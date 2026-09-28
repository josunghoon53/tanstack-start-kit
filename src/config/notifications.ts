import type { ComponentType } from 'react'
import { Bell, CreditCard, Package, UserPlus } from 'lucide-react'

export interface NotificationItem {
  icon: ComponentType<{ className?: string }>
  message: string
  time: string
}

export const NOTIFICATIONS: Array<NotificationItem> = [
  {
    icon: UserPlus,
    message: '최유나 님이 새로 가입했어요.',
    time: '5분 전',
  },
  {
    icon: Package,
    message: 'ORD-1042 주문이 배송을 시작했어요.',
    time: '32분 전',
  },
  {
    icon: CreditCard,
    message: 'PAY-9078 결제가 환불 처리됐어요.',
    time: '1시간 전',
  },
  {
    icon: Bell,
    message: '무선 이어폰 Pro 재고가 소진됐어요.',
    time: '어제',
  },
]
