import type { ComponentType } from 'react'
import {
  BarChart3,
  Boxes,
  CalendarClock,
  ClipboardList,
  CreditCard,
  FileBarChart,
  FileEdit,
  FileText,
  Gauge,
  KeyRound,
  LayoutDashboard,
  Megaphone,
  Package,
  PackagePlus,
  Receipt,
  RefreshCw,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Tags,
  TrendingUp,
  Truck,
  Undo2,
  UserPlus,
  Users,
  UsersRound,
  Wallet,
} from 'lucide-react'
import { messages } from '@/i18n/messages'
import type { Locale } from '@/i18n/messages'

type Icon = ComponentType<{ className?: string }>

export interface NavLeaf {
  label: string
  href: string
  icon: Icon
}

export interface NavSection {
  label: string
  items: Array<NavLeaf>
}

export interface NavLink {
  type: 'link'
  label: string
  href: string
  icon: Icon
}

export interface NavGroup {
  type: 'group'
  label: string
  icon: Icon
  sections: Array<NavSection>
}

export type NavItem = NavLink | NavGroup

export function getNavItems(locale: Locale): Array<NavItem> {
  const t = messages[locale].nav

  return [
    { type: 'link', label: t.dashboard, href: '/', icon: LayoutDashboard },
    {
      type: 'group',
      label: t.users.group,
      icon: Users,
      sections: [
        {
          label: t.users.memberManagement,
          items: [
            { label: t.users.all, href: '/users', icon: Users },
            { label: t.users.admins, href: '/users/admins', icon: ShieldCheck },
          ],
        },
        {
          label: t.users.permissions,
          items: [
            { label: t.users.roles, href: '/users/roles', icon: KeyRound },
            { label: t.users.invites, href: '/users/invites', icon: UserPlus },
          ],
        },
      ],
    },
    {
      type: 'group',
      label: t.orders.group,
      icon: ShoppingCart,
      sections: [
        {
          label: t.orders.processing,
          items: [
            { label: t.orders.all, href: '/orders', icon: ClipboardList },
            { label: t.orders.shipping, href: '/orders/shipping', icon: Truck },
          ],
        },
        {
          label: t.orders.history,
          items: [
            { label: t.orders.refunds, href: '/orders/refunds', icon: Undo2 },
            {
              label: t.orders.stats,
              href: '/orders/stats',
              icon: FileBarChart,
            },
          ],
        },
      ],
    },
    {
      type: 'group',
      label: t.products.group,
      icon: Package,
      sections: [
        {
          label: t.products.management,
          items: [
            { label: t.products.all, href: '/products', icon: Package },
            {
              label: t.products.categories,
              href: '/products/categories',
              icon: Tags,
            },
          ],
        },
        {
          label: t.products.stock,
          items: [
            {
              label: t.products.stockStatus,
              href: '/products/stock',
              icon: Boxes,
            },
            {
              label: t.products.inbound,
              href: '/products/inbound',
              icon: PackagePlus,
            },
          ],
        },
      ],
    },
    {
      type: 'group',
      label: t.payments.group,
      icon: CreditCard,
      sections: [
        {
          label: t.payments.history,
          items: [
            { label: t.payments.all, href: '/payments', icon: Receipt },
            {
              label: t.payments.subscriptions,
              href: '/payments/subscriptions',
              icon: RefreshCw,
            },
          ],
        },
        {
          label: t.payments.settlement,
          items: [
            {
              label: t.payments.settlementHistory,
              href: '/payments/settlements',
              icon: Wallet,
            },
            {
              label: t.payments.refunds,
              href: '/payments/refunds',
              icon: Undo2,
            },
          ],
        },
      ],
    },
    {
      type: 'group',
      label: t.contents.group,
      icon: FileText,
      sections: [
        {
          label: t.contents.management,
          items: [
            { label: t.contents.all, href: '/contents', icon: FileText },
            {
              label: t.contents.notices,
              href: '/contents/notices',
              icon: Megaphone,
            },
          ],
        },
        {
          label: t.contents.publishing,
          items: [
            {
              label: t.contents.scheduled,
              href: '/contents/scheduled',
              icon: CalendarClock,
            },
            {
              label: t.contents.drafts,
              href: '/contents/drafts',
              icon: FileEdit,
            },
          ],
        },
      ],
    },
    {
      type: 'group',
      label: t.analytics.group,
      icon: BarChart3,
      sections: [
        {
          label: t.analytics.overview,
          items: [
            { label: t.analytics.summary, href: '/analytics', icon: Gauge },
            {
              label: t.analytics.revenue,
              href: '/analytics/revenue',
              icon: TrendingUp,
            },
          ],
        },
        {
          label: t.analytics.detail,
          items: [
            {
              label: t.analytics.users,
              href: '/analytics/users',
              icon: UsersRound,
            },
            {
              label: t.analytics.reports,
              href: '/analytics/reports',
              icon: FileBarChart,
            },
          ],
        },
      ],
    },
    { type: 'link', label: t.settings, href: '/settings', icon: Settings },
  ]
}
