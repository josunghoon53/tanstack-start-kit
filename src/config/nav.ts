import type { ComponentType } from 'react'
import { LayoutDashboard } from 'lucide-react'

export interface NavItem {
  label: string
  href: string
  icon: ComponentType<{ className?: string }>
}

export const NAV_ITEMS: Array<NavItem> = [
  { label: '대시보드', href: '/', icon: LayoutDashboard },
]
