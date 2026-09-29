import type { ComponentType } from 'react'
import { Bell, CreditCard, Package, UserPlus } from 'lucide-react'

export type NotificationCategory = '가입' | '주문' | '결제' | '재고'
export type NotificationIconKey = 'signup' | 'order' | 'payment' | 'stock'

// 아이콘 컴포넌트 자체는 서버 함수를 통해 직렬화해서 보낼 수 없으므로(함수 참조라
// JSON으로 못 보냄), 데이터에는 iconKey 문자열만 담고 렌더링할 때 이 맵으로 변환한다.
export interface NotificationItem {
  iconKey: NotificationIconKey
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

export const NOTIFICATION_ICONS: Record<NotificationIconKey, ComponentType<{ className?: string }>> = {
  signup: UserPlus,
  order: Package,
  payment: CreditCard,
  stock: Bell,
}

export const NOTIFICATIONS: Array<NotificationItem> = [
  { iconKey: 'signup', category: '가입', message: '최유나 님이 새로 가입했어요.', time: '5분 전' },
  { iconKey: 'order', category: '주문', message: 'ORD-1042 주문이 배송을 시작했어요.', time: '32분 전' },
  { iconKey: 'payment', category: '결제', message: 'PAY-9078 결제가 환불 처리됐어요.', time: '1시간 전' },
  { iconKey: 'stock', category: '재고', message: '무선 이어폰 Pro 재고가 소진됐어요.', time: '어제' },
  { iconKey: 'signup', category: '가입', message: '박정우 님이 새로 가입했어요.', time: '어제' },
  { iconKey: 'payment', category: '결제', message: 'PAY-9081 결제가 완료됐어요.', time: '2일 전' },
]
