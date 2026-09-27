import type { ComponentType } from 'react'
import {
  BarChart3,
  Bell,
  CreditCard,
  FileText,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingCart,
  Users,
} from 'lucide-react'

export interface NavItem {
  label: string
  href: string
  icon: ComponentType<{ className?: string }>
}

export const NAV_ITEMS: Array<NavItem> = [
  { label: '대시보드', href: '/', icon: LayoutDashboard },
  { label: '사용자', href: '/users', icon: Users },
  { label: '주문', href: '/orders', icon: ShoppingCart },
  { label: '상품', href: '/products', icon: Package },
  { label: '결제', href: '/payments', icon: CreditCard },
  { label: '콘텐츠', href: '/contents', icon: FileText },
  { label: '알림', href: '/notifications', icon: Bell },
  { label: '분석', href: '/analytics', icon: BarChart3 },
  { label: '설정', href: '/settings', icon: Settings },
]
