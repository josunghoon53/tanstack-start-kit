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
  Palette,
  Receipt,
  RefreshCw,
  Settings,
  Settings2,
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

export const NAV_ITEMS: Array<NavItem> = [
  { type: 'link', label: '대시보드', href: '/', icon: LayoutDashboard },
  {
    type: 'group',
    label: '사용자',
    icon: Users,
    sections: [
      {
        label: '회원 관리',
        items: [
          { label: '전체 사용자', href: '/users', icon: Users },
          { label: '관리자 계정', href: '/users/admins', icon: ShieldCheck },
        ],
      },
      {
        label: '권한',
        items: [
          { label: '역할 관리', href: '/users/roles', icon: KeyRound },
          { label: '초대 관리', href: '/users/invites', icon: UserPlus },
        ],
      },
    ],
  },
  {
    type: 'group',
    label: '주문',
    icon: ShoppingCart,
    sections: [
      {
        label: '주문 처리',
        items: [
          { label: '전체 주문', href: '/orders', icon: ClipboardList },
          { label: '배송중', href: '/orders/shipping', icon: Truck },
        ],
      },
      {
        label: '처리 이력',
        items: [
          { label: '취소/환불', href: '/orders/refunds', icon: Undo2 },
          { label: '주문 통계', href: '/orders/stats', icon: FileBarChart },
        ],
      },
    ],
  },
  {
    type: 'group',
    label: '상품',
    icon: Package,
    sections: [
      {
        label: '상품 관리',
        items: [
          { label: '전체 상품', href: '/products', icon: Package },
          { label: '카테고리', href: '/products/categories', icon: Tags },
        ],
      },
      {
        label: '재고',
        items: [
          { label: '재고 현황', href: '/products/stock', icon: Boxes },
          { label: '입고 관리', href: '/products/inbound', icon: PackagePlus },
        ],
      },
    ],
  },
  {
    type: 'group',
    label: '결제',
    icon: CreditCard,
    sections: [
      {
        label: '결제 내역',
        items: [
          { label: '전체 결제', href: '/payments', icon: Receipt },
          { label: '정기 결제', href: '/payments/subscriptions', icon: RefreshCw },
        ],
      },
      {
        label: '정산',
        items: [
          { label: '정산 내역', href: '/payments/settlements', icon: Wallet },
          { label: '환불 관리', href: '/payments/refunds', icon: Undo2 },
        ],
      },
    ],
  },
  {
    type: 'group',
    label: '콘텐츠',
    icon: FileText,
    sections: [
      {
        label: '콘텐츠 관리',
        items: [
          { label: '전체 콘텐츠', href: '/contents', icon: FileText },
          { label: '공지사항', href: '/contents/notices', icon: Megaphone },
        ],
      },
      {
        label: '게시',
        items: [
          { label: '발행 예약', href: '/contents/scheduled', icon: CalendarClock },
          { label: '임시 저장', href: '/contents/drafts', icon: FileEdit },
        ],
      },
    ],
  },
  {
    type: 'group',
    label: '분석',
    icon: BarChart3,
    sections: [
      {
        label: '개요',
        items: [
          { label: '전체 요약', href: '/analytics', icon: Gauge },
          { label: '매출 분석', href: '/analytics/revenue', icon: TrendingUp },
        ],
      },
      {
        label: '상세',
        items: [
          { label: '사용자 분석', href: '/analytics/users', icon: UsersRound },
          { label: '리포트', href: '/analytics/reports', icon: FileBarChart },
        ],
      },
    ],
  },
  {
    type: 'group',
    label: '설정',
    icon: Settings,
    sections: [
      {
        label: '일반',
        items: [
          { label: '사이트 설정', href: '/settings', icon: Settings2 },
          { label: '브랜딩', href: '/settings/branding', icon: Palette },
        ],
      },
      {
        label: '계정',
        items: [
          { label: '팀 관리', href: '/settings/team', icon: UsersRound },
          { label: '결제 정보', href: '/settings/billing', icon: CreditCard },
        ],
      },
    ],
  },
]
